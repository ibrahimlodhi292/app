import { google } from "googleapis";
import { Readable } from "stream";
import pdf from "pdf-parse";
import prisma from "@/lib/db/prisma";
import { generateEmbeddings, upsertVectors, chunkText, deleteVectors } from "@/lib/ai/embeddings";
import { type DriveFile, type DriveSyncResult } from "@/types";

function getAuthClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

function getServiceAccountAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/documents.readonly",
    ],
  });
}

export async function listDriveFiles(
  accessToken: string,
  folderId?: string
): Promise<DriveFile[]> {
  const auth = getAuthClient(accessToken);
  const drive = google.drive({ version: "v3", auth });

  const query = [
    "trashed = false",
    "(mimeType='application/pdf' OR mimeType='application/vnd.google-apps.document' OR mimeType='text/plain' OR mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document')",
    folderId ? `'${folderId}' in parents` : "",
  ]
    .filter(Boolean)
    .join(" and ");

  const response = await drive.files.list({
    q: query,
    fields: "files(id, name, mimeType, webViewLink, size, modifiedTime)",
    pageSize: 100,
  });

  return (response.data.files || []) as DriveFile[];
}

export async function getFileContent(
  accessToken: string,
  fileId: string,
  mimeType: string
): Promise<string> {
  const auth = getAuthClient(accessToken);
  const drive = google.drive({ version: "v3", auth });

  if (mimeType === "application/vnd.google-apps.document") {
    const response = await drive.files.export({
      fileId,
      mimeType: "text/plain",
    });
    return response.data as string;
  }

  if (mimeType === "application/pdf") {
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );
    const buffer = Buffer.from(response.data as ArrayBuffer);
    const data = await pdf(buffer);
    return data.text;
  }

  if (mimeType === "text/plain") {
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "text" }
    );
    return response.data as string;
  }

  return "";
}

export async function syncDriveDocuments(
  restaurantId: string,
  accessToken: string,
  folderIds: string[]
): Promise<DriveSyncResult> {
  let synced = 0;
  let failed = 0;
  let skipped = 0;
  const syncedDocuments: Awaited<ReturnType<typeof prisma.document.upsert>>[] = [];

  for (const folderId of folderIds) {
    let files: DriveFile[] = [];
    try {
      files = await listDriveFiles(accessToken, folderId);
    } catch (err) {
      console.error(`Failed to list files in folder ${folderId}:`, err);
      failed++;
      continue;
    }

    for (const file of files) {
      if (!file.id) continue;

      try {
        const existing = await prisma.document.findFirst({
          where: { driveFileId: file.id, restaurantId },
        });

        await prisma.document.upsert({
          where: { id: existing?.id || "new" },
          update: { syncStatus: "SYNCING" },
          create: {
            restaurantId,
            name: file.name,
            type: file.mimeType?.split("/").pop() || "unknown",
            driveFileId: file.id,
            driveUrl: file.webViewLink,
            mimeType: file.mimeType,
            size: file.size ? Number(file.size) : null,
            syncStatus: "SYNCING",
          },
        });

        const content = await getFileContent(accessToken, file.id, file.mimeType!);

        if (!content.trim()) {
          skipped++;
          continue;
        }

        const chunks = chunkText(content, 1000, 200);
        const embeddings = await generateEmbeddings(chunks);

        const doc = await prisma.document.upsert({
          where: { id: existing?.id || "new" },
          update: {
            content,
            isIndexed: true,
            indexedAt: new Date(),
            syncStatus: "SUCCESS",
            errorMessage: null,
          },
          create: {
            restaurantId,
            name: file.name,
            type: file.mimeType?.split("/").pop() || "unknown",
            driveFileId: file.id,
            driveUrl: file.webViewLink,
            mimeType: file.mimeType,
            size: file.size ? Number(file.size) : null,
            content,
            isIndexed: true,
            indexedAt: new Date(),
            syncStatus: "SUCCESS",
          },
        });

        if (existing) {
          const oldChunks = await prisma.embeddingChunk.findMany({
            where: { documentId: doc.id },
          });
          if (oldChunks.length > 0) {
            await deleteVectors(oldChunks.map((c) => c.vectorId!).filter(Boolean));
            await prisma.embeddingChunk.deleteMany({ where: { documentId: doc.id } });
          }
        }

        const vectors = chunks.map((chunk, i) => ({
          id: `${doc.id}_chunk_${i}`,
          values: embeddings[i],
          metadata: {
            documentId: doc.id,
            documentName: file.name,
            restaurantId,
            chunkIndex: i,
            content: chunk,
          },
        }));

        await upsertVectors(vectors);

        await prisma.embeddingChunk.createMany({
          data: chunks.map((chunk, i) => ({
            documentId: doc.id,
            content: chunk,
            chunkIndex: i,
            vectorId: `${doc.id}_chunk_${i}`,
          })),
        });

        syncedDocuments.push(doc);
        synced++;
      } catch (err) {
        console.error(`Failed to sync file ${file.name}:`, err);
        failed++;

        const existing = await prisma.document.findFirst({
          where: { driveFileId: file.id, restaurantId },
        });
        if (existing) {
          await prisma.document.update({
            where: { id: existing.id },
            data: {
              syncStatus: "FAILED",
              errorMessage: err instanceof Error ? err.message : "Unknown error",
            },
          });
        }
      }
    }
  }

  return {
    synced,
    failed,
    skipped,
    documents: syncedDocuments as unknown as import("@/types").Document[],
  };
}

export async function getOAuthUrl(): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

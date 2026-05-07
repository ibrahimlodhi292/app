import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import {
  listDriveFiles,
  syncDriveDocuments,
  getOAuthUrl,
  exchangeCodeForTokens,
} from "@/lib/google/drive";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const restaurantId = req.headers.get("x-restaurant-id");

  if (action === "auth-url") {
    const url = await getOAuthUrl();
    return NextResponse.json({ url });
  }

  if (action === "callback") {
    const code = searchParams.get("code");
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

    const tokens = await exchangeCodeForTokens(code);

    if (restaurantId) {
      await prisma.integration.upsert({
        where: { restaurantId_type: { restaurantId, type: "google_drive" } },
        update: {
          config: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date,
          },
          isActive: true,
        },
        create: {
          restaurantId,
          type: "google_drive",
          name: "Google Drive",
          isActive: true,
          config: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date,
          },
        },
      });
    }

    return NextResponse.json({ success: true, tokens });
  }

  if (action === "files") {
    if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const folderId = searchParams.get("folderId") || undefined;
    const integration = await prisma.integration.findFirst({
      where: { restaurantId, type: "google_drive", isActive: true },
    });

    if (!integration) {
      return NextResponse.json({ error: "Google Drive not connected" }, { status: 400 });
    }

    const config = integration.config as { accessToken: string };
    const files = await listDriveFiles(config.accessToken, folderId);
    return NextResponse.json({ success: true, data: files });
  }

  if (action === "documents") {
    if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const documents = await prisma.document.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { embeddings: true } } },
    });

    return NextResponse.json({ success: true, data: documents });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

const syncSchema = z.object({
  folderIds: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "sync") {
    const body = await req.json();
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const integration = await prisma.integration.findFirst({
      where: { restaurantId, type: "google_drive", isActive: true },
    });

    if (!integration) {
      return NextResponse.json({ error: "Google Drive not connected" }, { status: 400 });
    }

    const config = integration.config as { accessToken: string };

    await prisma.integration.update({
      where: { id: integration.id },
      data: { syncStatus: "SYNCING" },
    });

    const result = await syncDriveDocuments(
      restaurantId,
      config.accessToken,
      parsed.data.folderIds
    );

    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        syncStatus: result.failed > 0 ? "FAILED" : "SUCCESS",
        lastSyncAt: new Date(),
        errorMessage:
          result.failed > 0
            ? `${result.failed} files failed to sync`
            : null,
      },
    });

    await prisma.adminSettings.update({
      where: { restaurantId },
      data: { googleDriveFolderIds: parsed.data.folderIds },
    });

    return NextResponse.json({ success: true, data: result });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

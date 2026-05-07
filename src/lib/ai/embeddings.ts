import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let pineconeClient: Pinecone | null = null;

function getPinecone(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  }
  return pineconeClient;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += 100) {
    batches.push(texts.slice(i, i + 100));
  }

  const allEmbeddings: number[][] = [];
  for (const batch of batches) {
    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
      input: batch.map((t) => t.slice(0, 8000)),
    });
    allEmbeddings.push(...response.data.map((d) => d.embedding));
  }
  return allEmbeddings;
}

export async function upsertVectors(vectors: {
  id: string;
  values: number[];
  metadata: Record<string, string | number | boolean>;
}[]): Promise<void> {
  const pc = getPinecone();
  const index = pc.index(process.env.PINECONE_INDEX!);
  await index.upsert(vectors);
}

export async function queryVectors(
  embedding: number[],
  topK: number = 5,
  filter?: Record<string, string>
): Promise<{ id: string; score: number; metadata: Record<string, unknown> }[]> {
  const pc = getPinecone();
  const index = pc.index(process.env.PINECONE_INDEX!);

  const results = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter,
  });

  return (results.matches || []).map((m) => ({
    id: m.id,
    score: m.score || 0,
    metadata: m.metadata as Record<string, unknown>,
  }));
}

export async function deleteVectors(ids: string[]): Promise<void> {
  const pc = getPinecone();
  const index = pc.index(process.env.PINECONE_INDEX!);
  await index.deleteMany(ids);
}

export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);

    if (chunk.trim().length > 50) {
      chunks.push(chunk.trim());
    }

    if (end === text.length) break;
    start = end - overlap;
  }

  return chunks;
}

export function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 20);
}

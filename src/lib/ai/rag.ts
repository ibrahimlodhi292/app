import OpenAI from "openai";
import { generateEmbedding, queryVectors } from "./embeddings";
import { buildRAGPrompt } from "./prompts";
import { type DocumentSource } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function retrieveContext(
  query: string,
  restaurantId: string,
  topK: number = 5
): Promise<{ context: string; sources: DocumentSource[] }> {
  const queryEmbedding = await generateEmbedding(query);

  const results = await queryVectors(queryEmbedding, topK, {
    restaurantId,
  });

  const relevantResults = results.filter((r) => r.score > 0.7);

  if (relevantResults.length === 0) {
    return { context: "", sources: [] };
  }

  const sources: DocumentSource[] = relevantResults.map((r) => ({
    documentId: r.metadata.documentId as string,
    documentName: r.metadata.documentName as string,
    chunk: r.metadata.content as string,
    score: r.score,
  }));

  const context = relevantResults
    .map((r, i) => `[${i + 1}] ${r.metadata.content}`)
    .join("\n\n");

  return { context, sources };
}

export async function answerWithRAG(
  query: string,
  restaurantId: string,
  conversationHistory: { role: string; content: string }[]
): Promise<{ answer: string; sources: DocumentSource[]; confidence: number }> {
  const { context, sources } = await retrieveContext(query, restaurantId);

  if (!context) {
    return {
      answer: "",
      sources: [],
      confidence: 0,
    };
  }

  const ragPrompt = buildRAGPrompt(context, query);

  const messages = [
    { role: "system" as const, content: ragPrompt },
    ...conversationHistory.slice(-6).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: query },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    messages,
    temperature: 0.3,
    max_tokens: 500,
  });

  const answer = response.choices[0]?.message?.content || "";
  const avgScore =
    sources.reduce((sum, s) => sum + s.score, 0) / sources.length;

  return {
    answer,
    sources,
    confidence: avgScore,
  };
}

export async function classifyIntent(
  message: string
): Promise<{
  intent: string;
  confidence: number;
  extractedEntities: Record<string, unknown>;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Classify the intent of this restaurant chatbot message. Return ONLY valid JSON:
{
  "intent": "reservation|menu_inquiry|hours|location|pricing|complaint|escalation|general|farewell|greeting",
  "confidence": 0.0,
  "extractedEntities": {}
}`,
      },
      { role: "user", content: message },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  try {
    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch {
    return { intent: "general", confidence: 0.5, extractedEntities: {} };
  }
}

export async function scoreLeadFromConversation(
  messages: { role: string; content: string }[]
): Promise<{ score: number; reasoning: string }> {
  const transcript = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Score this lead from 0-100 based on purchase intent, information completeness, urgency, and engagement. Return JSON: {"score": number, "reasoning": "brief"}`,
      },
      { role: "user", content: transcript },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  try {
    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch {
    return { score: 50, reasoning: "Unable to score" };
  }
}

export async function summarizeConversation(
  messages: { role: string; content: string }[]
): Promise<string> {
  const transcript = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Summarize this restaurant chat conversation in 2-3 sentences for CRM purposes. Focus on what the guest wanted, outcome, and any follow-ups.",
      },
      { role: "user", content: transcript },
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content || "No summary available";
}

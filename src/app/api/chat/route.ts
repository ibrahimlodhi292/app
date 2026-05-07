import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { retrieveContext } from "@/lib/ai/rag";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { restaurantTools } from "@/lib/ai/tools";
import { checkRateLimit, getCached, setCached, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

const messageSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  restaurantId: z.string().min(1),
  sessionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const rateCheck = await checkRateLimit(`chat:${ip}`, 60, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { message, conversationId, restaurantId, sessionId } = parsed.data;
  const userId = req.headers.get("x-user-id") || undefined;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { settings: true },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  let conversation;
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
    });
  }

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        restaurantId,
        userId,
        sessionId: sessionId || undefined,
        title: message.slice(0, 50),
      },
      include: { messages: true },
    });
  }

  const settings = restaurant.settings;
  const systemPrompt = buildSystemPrompt({
    restaurantName: restaurant.name,
    restaurantDescription: restaurant.description,
    aiPersonality: settings?.aiPersonality,
    customInstructions: settings?.systemPrompt,
  });

  const { context, sources } = await retrieveContext(message, restaurantId, 5);

  const enhancedSystemPrompt = context
    ? `${systemPrompt}\n\n## Retrieved Knowledge:\n${context}`
    : systemPrompt;

  const conversationHistory = conversation.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: message,
    },
  });

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL || "gpt-4o"),
    system: enhancedSystemPrompt,
    messages: [
      ...conversationHistory,
      { role: "user", content: message },
    ],
    tools: {
      createReservation: {
        description: restaurantTools.createReservation.description,
        parameters: restaurantTools.createReservation.parameters.extend({
          conversationId: z.string().default(conversation.id),
          restaurantId: z.string().default(restaurantId),
        }),
        execute: async (args) =>
          restaurantTools.createReservation.execute({
            ...args,
            conversationId: conversation.id,
            restaurantId,
          }),
      },
      captureLead: {
        description: restaurantTools.captureLead.description,
        parameters: restaurantTools.captureLead.parameters,
        execute: async (args) =>
          restaurantTools.captureLead.execute({
            ...args,
            conversationId: conversation.id,
            restaurantId,
          }),
      },
      escalateToHuman: {
        description: restaurantTools.escalateToHuman.description,
        parameters: restaurantTools.escalateToHuman.parameters,
        execute: async (args) =>
          restaurantTools.escalateToHuman.execute({
            ...args,
            conversationId: conversation.id,
            restaurantId,
          }),
      },
      checkAvailability: {
        description: restaurantTools.checkAvailability.description,
        parameters: restaurantTools.checkAvailability.parameters,
        execute: async (args) =>
          restaurantTools.checkAvailability.execute({ ...args, restaurantId }),
      },
    },
    maxSteps: 5,
    onFinish: async ({ text, usage }) => {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: text,
          tokensUsed: usage?.totalTokens,
          metadata: sources.length > 0 ? (JSON.parse(JSON.stringify({ sources }))) : undefined,
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      await prisma.analytics.upsert({
        where: {
          restaurantId_date: {
            restaurantId,
            date: new Date(new Date().toISOString().split("T")[0]),
          },
        },
        update: { totalMessages: { increment: 2 } },
        create: {
          restaurantId,
          date: new Date(new Date().toISOString().split("T")[0]),
          totalMessages: 2,
        },
      });
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = (result as any).toDataStreamResponse() as Response;
  response.headers.set("X-Conversation-Id", conversation.id);
  return response;
}

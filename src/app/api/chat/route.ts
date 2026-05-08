import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { openai as aiSdkOpenai } from "@ai-sdk/openai";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { retrieveContext } from "@/lib/ai/rag";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { restaurantTools } from "@/lib/ai/tools";
import { checkRateLimit } from "@/lib/redis";

// Check OpenAI is configured
function hasOpenAI() {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-...";
}

export async function POST(req: NextRequest) {
  if (!hasOpenAI()) {
    return NextResponse.json(
      { error: "AI is not configured yet. Please add your OPENAI_API_KEY to environment variables." },
      { status: 503 }
    );
  }

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const rateCheck = await checkRateLimit(`chat:${ip}`, 60, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again in a minute." }, { status: 429 });
  }

  let rawBody: Record<string, unknown>;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Support both formats:
  // 1. Custom format: { message: string, restaurantId, conversationId }
  // 2. Vercel AI SDK format: { messages: [{role, content}], restaurantId, conversationId }
  let userMessage: string;
  if (typeof rawBody.message === "string" && rawBody.message.trim()) {
    userMessage = rawBody.message.trim();
  } else if (Array.isArray(rawBody.messages)) {
    const msgs = rawBody.messages as Array<{ role: string; content: string }>;
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    userMessage = lastUser?.content?.trim() || "";
  } else {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (!userMessage || userMessage.length > 4000) {
    return NextResponse.json({ error: "Message must be 1–4000 characters" }, { status: 400 });
  }

  const conversationId = typeof rawBody.conversationId === "string" ? rawBody.conversationId : undefined;
  const sessionId = typeof rawBody.sessionId === "string" ? rawBody.sessionId : undefined;
  let restaurantId = typeof rawBody.restaurantId === "string" ? rawBody.restaurantId : "";

  const userId = req.headers.get("x-user-id") || undefined;

  // If no restaurantId provided, try to find one from auth or use first available
  if (!restaurantId) {
    const headerRestaurantId = req.headers.get("x-restaurant-id");
    if (headerRestaurantId) {
      restaurantId = headerRestaurantId;
    } else {
      // Demo mode: use the first restaurant in the DB
      try {
        const firstRestaurant = await prisma.restaurant.findFirst({ select: { id: true } });
        if (firstRestaurant) restaurantId = firstRestaurant.id;
      } catch {}
    }
  }

  if (!restaurantId) {
    return NextResponse.json({ error: "No restaurant configured. Please register first." }, { status: 400 });
  }

  let restaurant;
  try {
    restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { settings: true },
    });
  } catch (err) {
    return NextResponse.json({ error: "Database error. Please try again." }, { status: 500 });
  }

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  // Load or create conversation
  let conversation;
  try {
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
          title: userMessage.slice(0, 50),
        },
        include: { messages: true },
      });
    }
  } catch {
    return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 });
  }

  const settings = restaurant.settings;
  const systemPrompt = buildSystemPrompt({
    restaurantName: restaurant.name,
    restaurantDescription: restaurant.description,
    aiPersonality: settings?.aiPersonality,
    customInstructions: settings?.systemPrompt,
  });

  // RAG context (gracefully skipped if Pinecone not configured)
  const { context, sources } = await retrieveContext(userMessage, restaurantId, 5);
  const enhancedSystemPrompt = context
    ? `${systemPrompt}\n\n## Retrieved Knowledge:\n${context}`
    : systemPrompt;

  const conversationHistory = (conversation.messages || []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Save user message
  try {
    await prisma.message.create({
      data: { conversationId: conversation.id, role: "user", content: userMessage },
    });
  } catch {}

  const convId = conversation.id;

  // Build clean tool schemas (omit internal IDs from AI-visible params)
  const tools = {
    createReservation: {
      description: restaurantTools.createReservation.description,
      parameters: z.object({
        guestName: z.string().describe("Full name of the guest"),
        guestEmail: z.string().email().optional().describe("Guest email address"),
        guestPhone: z.string().optional().describe("Guest phone number"),
        partySize: z.number().min(1).max(50).describe("Number of guests"),
        date: z.string().describe("Reservation date (YYYY-MM-DD)"),
        timeSlot: z.string().describe("Reservation time e.g. '7:00 PM'"),
        specialRequests: z.string().optional().describe("Dietary restrictions or special requests"),
      }),
      execute: async (args: {
        guestName: string; guestEmail?: string; guestPhone?: string;
        partySize: number; date: string; timeSlot: string; specialRequests?: string;
      }) => restaurantTools.createReservation.execute({ ...args, conversationId: convId, restaurantId }),
    },
    captureLead: {
      description: restaurantTools.captureLead.description,
      parameters: z.object({
        name: z.string().optional().describe("Lead's full name"),
        email: z.string().email().optional().describe("Lead's email address"),
        phone: z.string().optional().describe("Lead's phone number"),
        inquiry: z.string().describe("What the lead is interested in"),
        score: z.number().min(0).max(100).optional().describe("Lead qualification score"),
      }),
      execute: async (args: {
        name?: string; email?: string; phone?: string; inquiry: string; score?: number;
      }) => restaurantTools.captureLead.execute({ ...args, conversationId: convId, restaurantId }),
    },
    escalateToHuman: {
      description: restaurantTools.escalateToHuman.description,
      parameters: z.object({
        reason: z.string().describe("Reason for escalation"),
        guestName: z.string().optional().describe("Guest's name if known"),
        guestEmail: z.string().optional().describe("Guest's email if known"),
      }),
      execute: async (args: { reason: string; guestName?: string; guestEmail?: string }) =>
        restaurantTools.escalateToHuman.execute({ ...args, conversationId: convId, restaurantId }),
    },
    checkAvailability: {
      description: restaurantTools.checkAvailability.description,
      parameters: z.object({
        date: z.string().describe("Date to check (YYYY-MM-DD)"),
        timeSlot: z.string().describe("Time slot to check"),
        partySize: z.number().describe("Number of guests"),
      }),
      execute: async (args: { date: string; timeSlot: string; partySize: number }) =>
        restaurantTools.checkAvailability.execute({ ...args, restaurantId }),
    },
  };

  try {
    const result = streamText({
      model: aiSdkOpenai(process.env.OPENAI_MODEL || "gpt-4o"),
      system: enhancedSystemPrompt,
      messages: [
        ...conversationHistory,
        { role: "user", content: userMessage },
      ],
      tools,
      maxSteps: 5,
      onFinish: async ({ text, usage }) => {
        try {
          await prisma.message.create({
            data: {
              conversationId: convId,
              role: "assistant",
              content: text,
              tokensUsed: usage?.totalTokens,
              metadata: sources.length > 0 ? JSON.parse(JSON.stringify({ sources })) : undefined,
            },
          });

          await prisma.conversation.update({
            where: { id: convId },
            data: { updatedAt: new Date() },
          });

          await prisma.analytics.upsert({
            where: { restaurantId_date: { restaurantId, date: new Date(new Date().toISOString().split("T")[0]) } },
            update: { totalMessages: { increment: 2 } },
            create: {
              restaurantId,
              date: new Date(new Date().toISOString().split("T")[0]),
              totalMessages: 2,
            },
          });
        } catch {}
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (result as any).toDataStreamResponse() as Response;
    const headers = new Headers(response.headers);
    headers.set("X-Conversation-Id", convId);
    return new Response(response.body, { status: response.status, headers });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI request failed";
    if (msg.includes("API key") || msg.includes("401")) {
      return NextResponse.json({ error: "Invalid OpenAI API key" }, { status: 503 });
    }
    return NextResponse.json({ error: "AI is temporarily unavailable. Please try again." }, { status: 503 });
  }
}

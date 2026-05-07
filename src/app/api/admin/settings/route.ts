import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { deleteCached, CACHE_KEYS } from "@/lib/redis";

const settingsSchema = z.object({
  aiPersonality: z.string().optional(),
  systemPrompt: z.string().optional(),
  welcomeMessage: z.string().optional(),
  businessHours: z.record(z.object({
    isOpen: z.boolean(),
    open: z.string(),
    close: z.string(),
  })).optional(),
  reservationSettings: z.object({
    maxPartySize: z.number(),
    minPartySize: z.number(),
    slotDurationMinutes: z.number(),
    advanceBookingDays: z.number(),
    timeSlots: z.array(z.string()),
  }).optional(),
  emailNotifications: z.object({
    reservationConfirmation: z.boolean(),
    reservationReminder: z.boolean(),
    leadNotification: z.boolean(),
    escalationAlert: z.boolean(),
    adminEmail: z.string().email(),
  }).optional(),
  autoSync: z.boolean().optional(),
  syncIntervalMinutes: z.number().min(15).max(1440).optional(),
  maxConversationLength: z.number().min(10).max(200).optional(),
  escalationThreshold: z.number().min(1).max(10).optional(),
});

export async function GET(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.adminSettings.findUnique({
    where: { restaurantId },
  });

  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const settings = await prisma.adminSettings.upsert({
    where: { restaurantId },
    update: parsed.data,
    create: { restaurantId, ...parsed.data },
  });

  await deleteCached(CACHE_KEYS.settings(restaurantId));

  return NextResponse.json({ success: true, data: settings });
}

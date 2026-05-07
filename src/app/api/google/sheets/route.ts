import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { saveLeadToSheets } from "@/lib/google/sheets";

const connectSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  spreadsheetId: z.string(),
});

export async function POST(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "connect") {
    const body = await req.json();
    const parsed = connectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await prisma.integration.upsert({
      where: { restaurantId_type: { restaurantId, type: "google_sheets" } },
      update: {
        config: parsed.data,
        isActive: true,
      },
      create: {
        restaurantId,
        type: "google_sheets",
        name: "Google Sheets",
        isActive: true,
        config: parsed.data,
      },
    });

    return NextResponse.json({ success: true });
  }

  if (action === "test") {
    try {
      await saveLeadToSheets({
        restaurantId,
        name: "Test Lead",
        email: "test@example.com",
        phone: "+1234567890",
        inquiry: "Test connection",
        timestamp: new Date().toISOString(),
        score: 0,
      });
      return NextResponse.json({ success: true, message: "Test lead saved to Sheets" });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Test failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const integration = await prisma.integration.findFirst({
    where: { restaurantId, type: "google_sheets" },
  });

  return NextResponse.json({
    success: true,
    data: {
      isConnected: integration?.isActive || false,
      lastSync: integration?.lastSyncAt,
    },
  });
}

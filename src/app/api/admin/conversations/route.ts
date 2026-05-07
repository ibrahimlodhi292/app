import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "30");
  const isEscalated = searchParams.get("escalated") === "true" ? true : undefined;

  const where: Record<string, unknown> = { restaurantId };
  if (isEscalated !== undefined) where.isEscalated = isEscalated;

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        summary: true,
        isActive: true,
        isEscalated: true,
        escalatedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    }),
    prisma.conversation.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: conversations,
    total,
    page,
    pageSize,
  });
}

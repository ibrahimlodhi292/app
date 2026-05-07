import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { restaurantId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { conversation: { select: { sessionId: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: leads,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

const updateLeadSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]).optional(),
  score: z.number().min(0).max(100).optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("id");
  if (!leadId) return NextResponse.json({ error: "Lead ID required" }, { status: 400 });

  const body = await req.json();
  const parsed = updateLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id: leadId, restaurantId },
    data: parsed.data,
  });

  return NextResponse.json({ success: true, data: lead });
}

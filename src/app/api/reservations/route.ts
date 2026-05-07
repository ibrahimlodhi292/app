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
  const date = searchParams.get("date");

  const where: Record<string, unknown> = { restaurantId };
  if (status) where.status = status;
  if (date) {
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.date = { gte: d, lt: next };
  }

  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.reservation.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: reservations,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

const updateReservationSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]).optional(),
  timeSlot: z.string().optional(),
  date: z.string().optional(),
  specialRequests: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const reservationId = searchParams.get("id");
  if (!reservationId) return NextResponse.json({ error: "Reservation ID required" }, { status: 400 });

  const body = await req.json();
  const parsed = updateReservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.date) data.date = new Date(parsed.data.date);

  const reservation = await prisma.reservation.update({
    where: { id: reservationId, restaurantId },
    data,
  });

  return NextResponse.json({ success: true, data: reservation });
}

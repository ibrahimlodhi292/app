import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
  const restaurantId = req.headers.get("x-restaurant-id");
  if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") || "30");

  const startDate = subDays(new Date(), days);

  const [analyticsData, totalLeads, totalReservations, recentConversations, topLeads] =
    await Promise.all([
      prisma.analytics.findMany({
        where: {
          restaurantId,
          date: { gte: startDate },
        },
        orderBy: { date: "asc" },
      }),
      prisma.lead.count({ where: { restaurantId } }),
      prisma.reservation.count({ where: { restaurantId } }),
      prisma.conversation.count({
        where: { restaurantId, createdAt: { gte: startDate } },
      }),
      prisma.lead.findMany({
        where: { restaurantId, status: { in: ["NEW", "CONTACTED"] } },
        orderBy: { score: "desc" },
        take: 5,
      }),
    ]);

  const chartData = analyticsData.map((a) => ({
    date: format(a.date, "MMM dd"),
    chats: a.totalChats,
    messages: a.totalMessages,
    leads: a.totalLeads,
    reservations: a.totalReservations,
  }));

  const totals = analyticsData.reduce(
    (acc, curr) => ({
      chats: acc.chats + curr.totalChats,
      messages: acc.messages + curr.totalMessages,
      leads: acc.leads + curr.totalLeads,
      reservations: acc.reservations + curr.totalReservations,
    }),
    { chats: 0, messages: 0, leads: 0, reservations: 0 }
  );

  return NextResponse.json({
    success: true,
    data: {
      chartData,
      totals,
      totalLeads,
      totalReservations,
      recentConversations,
      topLeads,
      period: `${days} days`,
    },
  });
}

import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { saveLeadToSheets } from "@/lib/google/sheets";
import { sendEmail } from "@/lib/email/resend";
import { reservationConfirmationTemplate } from "@/lib/email/templates";

export const restaurantTools = {
  createReservation: {
    description: "Create a table reservation for a guest",
    parameters: z.object({
      guestName: z.string().describe("Full name of the guest"),
      guestEmail: z.string().email().optional().describe("Guest email address"),
      guestPhone: z.string().optional().describe("Guest phone number"),
      partySize: z.number().min(1).max(50).describe("Number of guests"),
      date: z.string().describe("Reservation date in ISO format (YYYY-MM-DD)"),
      timeSlot: z.string().describe("Reservation time (e.g. '7:00 PM')"),
      specialRequests: z.string().optional().describe("Dietary restrictions or special requests"),
      conversationId: z.string().describe("Current conversation ID"),
      restaurantId: z.string().describe("Restaurant ID"),
    }),
    execute: async (args: {
      guestName: string;
      guestEmail?: string;
      guestPhone?: string;
      partySize: number;
      date: string;
      timeSlot: string;
      specialRequests?: string;
      conversationId: string;
      restaurantId: string;
    }) => {
      const reservation = await prisma.reservation.create({
        data: {
          restaurantId: args.restaurantId,
          conversationId: args.conversationId,
          guestName: args.guestName,
          guestEmail: args.guestEmail,
          guestPhone: args.guestPhone,
          partySize: args.partySize,
          date: new Date(args.date),
          timeSlot: args.timeSlot,
          specialRequests: args.specialRequests,
          status: "CONFIRMED",
        },
      });

      if (args.guestEmail) {
        const restaurant = await prisma.restaurant.findUnique({
          where: { id: args.restaurantId },
        });

        await sendEmail({
          to: args.guestEmail,
          subject: `Reservation Confirmed — ${restaurant?.name}`,
          html: reservationConfirmationTemplate({
            guestName: args.guestName,
            restaurantName: restaurant?.name || "Restaurant",
            date: args.date,
            time: args.timeSlot,
            partySize: args.partySize,
            confirmationCode: reservation.confirmationCode,
            specialRequests: args.specialRequests,
            restaurantPhone: restaurant?.phone || undefined,
            restaurantAddress: restaurant?.address || undefined,
          }),
          restaurantId: args.restaurantId,
          template: "reservation_confirmation",
          reservationId: reservation.id,
        });
      }

      return {
        success: true,
        confirmationCode: reservation.confirmationCode,
        message: `Reservation confirmed for ${args.guestName}, party of ${args.partySize} on ${args.date} at ${args.timeSlot}. Confirmation code: ${reservation.confirmationCode}`,
      };
    },
  },

  captureLead: {
    description: "Save a qualified lead to the CRM and Google Sheets",
    parameters: z.object({
      name: z.string().optional().describe("Lead's full name"),
      email: z.string().email().optional().describe("Lead's email address"),
      phone: z.string().optional().describe("Lead's phone number"),
      inquiry: z.string().describe("What the lead is interested in"),
      conversationId: z.string().describe("Current conversation ID"),
      restaurantId: z.string().describe("Restaurant ID"),
      score: z.number().min(0).max(100).optional().describe("Lead qualification score"),
    }),
    execute: async (args: {
      name?: string;
      email?: string;
      phone?: string;
      inquiry: string;
      conversationId: string;
      restaurantId: string;
      score?: number;
    }) => {
      const lead = await prisma.lead.upsert({
        where: { conversationId: args.conversationId },
        update: {
          name: args.name,
          email: args.email,
          phone: args.phone,
          inquiry: args.inquiry,
          score: args.score || 50,
        },
        create: {
          restaurantId: args.restaurantId,
          conversationId: args.conversationId,
          name: args.name,
          email: args.email,
          phone: args.phone,
          inquiry: args.inquiry,
          score: args.score || 50,
          source: "chatbot",
        },
      });

      try {
        await saveLeadToSheets({
          restaurantId: args.restaurantId,
          name: args.name || "Unknown",
          email: args.email || "",
          phone: args.phone || "",
          inquiry: args.inquiry,
          timestamp: new Date().toISOString(),
          score: args.score || 50,
        });
      } catch {
        // Sheets save is non-critical
      }

      return {
        success: true,
        leadId: lead.id,
        message: "Thank you! I've saved your information and someone from our team will be in touch shortly.",
      };
    },
  },

  escalateToHuman: {
    description: "Escalate the conversation to a human staff member",
    parameters: z.object({
      reason: z.string().describe("Reason for escalation"),
      conversationId: z.string().describe("Current conversation ID"),
      restaurantId: z.string().describe("Restaurant ID"),
      guestName: z.string().optional().describe("Guest's name if known"),
      guestEmail: z.string().optional().describe("Guest's email if known"),
    }),
    execute: async (args: {
      reason: string;
      conversationId: string;
      restaurantId: string;
      guestName?: string;
      guestEmail?: string;
    }) => {
      await prisma.conversation.update({
        where: { id: args.conversationId },
        data: { isEscalated: true, escalatedAt: new Date() },
      });

      const restaurant = await prisma.restaurant.findUnique({
        where: { id: args.restaurantId },
        include: { settings: true },
      });

      const adminEmail = restaurant?.settings?.emailNotifications
        ? (restaurant.settings.emailNotifications as { adminEmail: string }).adminEmail
        : restaurant?.email;

      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: "Chat Escalation Alert — Guest Needs Assistance",
          html: `<p>A guest has requested human assistance.</p>
                 <p><strong>Reason:</strong> ${args.reason}</p>
                 <p><strong>Guest:</strong> ${args.guestName || "Unknown"}</p>
                 <p><strong>Email:</strong> ${args.guestEmail || "Not provided"}</p>
                 <p><strong>Conversation ID:</strong> ${args.conversationId}</p>`,
          restaurantId: args.restaurantId,
          template: "escalation_alert",
        });
      }

      return {
        success: true,
        message: "I've notified our team and someone will be with you shortly! Is there anything else I can help you with in the meantime?",
      };
    },
  },

  checkAvailability: {
    description: "Check table availability for a specific date and time",
    parameters: z.object({
      date: z.string().describe("Date to check (YYYY-MM-DD)"),
      timeSlot: z.string().describe("Time slot to check"),
      partySize: z.number().describe("Number of guests"),
      restaurantId: z.string().describe("Restaurant ID"),
    }),
    execute: async (args: {
      date: string;
      timeSlot: string;
      partySize: number;
      restaurantId: string;
    }) => {
      const dateObj = new Date(args.date);
      const startOfDay = new Date(dateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateObj);
      endOfDay.setHours(23, 59, 59, 999);

      const existingReservations = await prisma.reservation.count({
        where: {
          restaurantId: args.restaurantId,
          date: { gte: startOfDay, lte: endOfDay },
          timeSlot: args.timeSlot,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });

      const settings = await prisma.adminSettings.findUnique({
        where: { restaurantId: args.restaurantId },
      });

      const maxTables = 20;
      const isAvailable = existingReservations < maxTables;

      return {
        available: isAvailable,
        message: isAvailable
          ? `Great news! We have availability for ${args.partySize} guests on ${args.date} at ${args.timeSlot}.`
          : `Unfortunately, ${args.timeSlot} on ${args.date} is fully booked. Would you like to try a different time?`,
        alternativeSlots: isAvailable ? [] : ["6:00 PM", "6:30 PM", "8:00 PM", "8:30 PM"],
      };
    },
  },

  getMenuRecommendations: {
    description: "Get personalized dish recommendations based on preferences",
    parameters: z.object({
      preferences: z.string().describe("Dietary preferences or restrictions"),
      occasion: z.string().optional().describe("Special occasion if any"),
      priceRange: z.enum(["budget", "mid", "premium"]).optional(),
    }),
    execute: async (args: {
      preferences: string;
      occasion?: string;
      priceRange?: string;
    }) => {
      return {
        message: `Based on your preferences (${args.preferences}), I'll pull our best recommendations from our menu knowledge base.`,
        recommendations: [],
        note: "Specific recommendations will be provided via RAG from your menu documents.",
      };
    },
  },
};

export type RestaurantToolName = keyof typeof restaurantTools;

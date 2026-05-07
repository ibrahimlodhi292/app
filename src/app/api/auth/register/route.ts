import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { signToken, setAuthCookie } from "@/lib/auth/jwt";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  restaurantName: z.string().min(2, "Restaurant name is required"),
  restaurantSlug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { name, email, password, restaurantName, restaurantSlug } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const slug =
    restaurantSlug ||
    restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);

  const slugExists = await prisma.restaurant.findUnique({ where: { slug } });
  if (slugExists) {
    return NextResponse.json(
      { error: "Restaurant slug already taken. Try a different name." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: restaurantName,
        slug,
      },
    });

    const user = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "OWNER",
        restaurantId: restaurant.id,
      },
    });

    await tx.adminSettings.create({
      data: {
        restaurantId: restaurant.id,
        welcomeMessage: `Welcome to ${restaurantName}! I'm your AI assistant. How can I help you today?`,
        businessHours: {
          monday: { isOpen: true, open: "11:00", close: "22:00" },
          tuesday: { isOpen: true, open: "11:00", close: "22:00" },
          wednesday: { isOpen: true, open: "11:00", close: "22:00" },
          thursday: { isOpen: true, open: "11:00", close: "22:00" },
          friday: { isOpen: true, open: "11:00", close: "23:00" },
          saturday: { isOpen: true, open: "10:00", close: "23:00" },
          sunday: { isOpen: true, open: "10:00", close: "21:00" },
        },
        reservationSettings: {
          maxPartySize: 12,
          minPartySize: 1,
          slotDurationMinutes: 90,
          advanceBookingDays: 30,
          timeSlots: [
            "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
            "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
          ],
        },
      },
    });

    return { user, restaurant };
  });

  const token = await signToken({
    sub: result.user.id,
    email: result.user.email,
    name: result.user.name,
    role: result.user.role,
    restaurantId: result.restaurant.id,
  });

  const cookieConfig = setAuthCookie(token);
  const response = NextResponse.json(
    {
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        restaurantId: result.restaurant.id,
        restaurant: result.restaurant,
      },
      token,
    },
    { status: 201 }
  );

  response.cookies.set(
    cookieConfig.name,
    cookieConfig.value,
    cookieConfig.options as Parameters<typeof response.cookies.set>[2]
  );

  return response;
}

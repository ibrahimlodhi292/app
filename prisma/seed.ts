import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 12);

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "bella-cucina" },
    update: {},
    create: {
      name: "Bella Cucina",
      slug: "bella-cucina",
      description: "Authentic Italian cuisine in the heart of the city",
      phone: "+1 (555) 123-4567",
      email: "info@bellacucina.com",
      address: "123 Main Street, New York, NY 10001",
      website: "https://bellacucina.com",
      timezone: "America/New_York",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "owner@bellacucina.com" },
    update: {},
    create: {
      name: "Marco Rossi",
      email: "owner@bellacucina.com",
      password,
      role: "OWNER",
      restaurantId: restaurant.id,
    },
  });

  await prisma.adminSettings.upsert({
    where: { restaurantId: restaurant.id },
    update: {},
    create: {
      restaurantId: restaurant.id,
      welcomeMessage:
        "Benvenuti! Welcome to Bella Cucina! I'm your AI assistant. How can I help you today — would you like to make a reservation or hear about our menu?",
      aiPersonality:
        "You are a warm, knowledgeable Italian restaurant host. You're passionate about food and hospitality. You speak in a friendly, welcoming tone with occasional Italian phrases. You know the menu inside and out.",
      businessHours: {
        monday: { isOpen: false, open: "11:00", close: "22:00" },
        tuesday: { isOpen: true, open: "12:00", close: "22:00" },
        wednesday: { isOpen: true, open: "12:00", close: "22:00" },
        thursday: { isOpen: true, open: "12:00", close: "22:00" },
        friday: { isOpen: true, open: "12:00", close: "23:00" },
        saturday: { isOpen: true, open: "11:00", close: "23:00" },
        sunday: { isOpen: true, open: "11:00", close: "21:00" },
      },
      reservationSettings: {
        maxPartySize: 12,
        minPartySize: 1,
        slotDurationMinutes: 90,
        advanceBookingDays: 30,
        timeSlots: [
          "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
          "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM",
        ],
      },
      emailNotifications: {
        reservationConfirmation: true,
        reservationReminder: true,
        leadNotification: true,
        escalationAlert: true,
        adminEmail: "owner@bellacucina.com",
      },
    },
  });

  console.log(`✅ Seeded restaurant: ${restaurant.name}`);
  console.log(`✅ Seeded user: ${user.email} (password: password123)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

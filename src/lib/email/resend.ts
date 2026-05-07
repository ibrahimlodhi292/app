import { Resend } from "resend";
import prisma from "@/lib/db/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  restaurantId: string;
  template: string;
  reservationId?: string;
  metadata?: Record<string, unknown>;
}

export async function sendEmail(params: SendEmailParams): Promise<{ id: string } | null> {
  const log = await prisma.emailLog.create({
    data: {
      restaurantId: params.restaurantId,
      reservationId: params.reservationId,
      to: params.to,
      subject: params.subject,
      template: params.template,
      status: "PENDING",
      metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
    },
  });

  const maxAttempts = 3;
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          attempts: attempt,
          lastAttemptAt: new Date(),
        },
      });

      return { id: result.data?.id || "" };
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          attempts: attempt,
          lastAttemptAt: new Date(),
          errorMessage: lastError,
        },
      });

      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }

  await prisma.emailLog.update({
    where: { id: log.id },
    data: { status: "FAILED", errorMessage: lastError },
  });

  return null;
}

export async function sendAdminAlert(
  subject: string,
  html: string,
  restaurantId: string
): Promise<void> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { settings: true },
  });

  const adminEmail =
    (restaurant?.settings?.emailNotifications as { adminEmail?: string })?.adminEmail ||
    restaurant?.email ||
    process.env.ADMIN_EMAIL;

  if (!adminEmail) return;

  await sendEmail({
    to: adminEmail,
    subject,
    html,
    restaurantId,
    template: "admin_alert",
  });
}

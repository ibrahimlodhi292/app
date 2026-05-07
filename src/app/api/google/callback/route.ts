import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google/drive";
import { getAuthUser } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/knowledge-base?error=${error}`, req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard/knowledge-base?error=missing_code", req.url)
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const user = await getAuthUser();

    if (user?.restaurantId) {
      await prisma.integration.upsert({
        where: {
          restaurantId_type: {
            restaurantId: user.restaurantId,
            type: "google_drive",
          },
        },
        update: {
          config: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date,
          },
          isActive: true,
        },
        create: {
          restaurantId: user.restaurantId,
          type: "google_drive",
          name: "Google Drive",
          isActive: true,
          config: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date,
          },
        },
      });
    }

    return NextResponse.redirect(
      new URL("/dashboard/knowledge-base?connected=true", req.url)
    );
  } catch (err) {
    return NextResponse.redirect(
      new URL("/dashboard/knowledge-base?error=exchange_failed", req.url)
    );
  }
}

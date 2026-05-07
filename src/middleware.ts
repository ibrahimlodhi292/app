import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/google",
  "/api/auth/callback",
  "/api/chat",
];

const ADMIN_PATHS = ["/dashboard", "/admin"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";

  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    if (isPublicPath(pathname)) {
      return response;
    }

    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth-token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.sub as string);
      requestHeaders.set("x-user-role", payload.role as string);
      requestHeaders.set("x-restaurant-id", (payload.restaurantId as string) || "");

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const cookieToken = request.cookies.get("auth-token")?.value;

  if (!cookieToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(cookieToken, JWT_SECRET);

    if (isAdminPath(pathname)) {
      const role = payload.role as string;
      if (!["SUPER_ADMIN", "ADMIN", "OWNER"].includes(role)) {
        return NextResponse.redirect(new URL("/chat", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth-token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { NextResponse, type NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function shouldRateLimit(pathname: string) {
  return (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/business") ||
    pathname.startsWith("/api/me")
  );
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Serve the favicon from /brand/favicon.png when browsers request /favicon.ico
  if (pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/brand/favicon.png", request.url));
  }

  if (shouldRateLimit(pathname)) {
    const ip = getClientIp(request);
    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.set(ip, { count: 1, windowStart: now });
    } else {
      entry.count += 1;
      if (entry.count > RATE_LIMIT_MAX) {
        return new NextResponse("Too many requests", { status: 429 });
      }
      rateLimitStore.set(ip, entry);
    }
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  response.headers.set("X-DNS-Prefetch-Control", "on");

  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

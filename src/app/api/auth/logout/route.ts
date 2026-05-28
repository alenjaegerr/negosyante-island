import { NextResponse } from "next/server";
import { clearAuthCookie, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: null },
    });
  }

  await clearAuthCookie();
  const headers = request.headers;
  const forwardedHost = headers.get("x-forwarded-host");
  const host = forwardedHost ?? headers.get("host");
  const proto = headers.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : new URL(request.url).origin;

  return NextResponse.redirect(new URL("/login", origin), { status: 303 });
}

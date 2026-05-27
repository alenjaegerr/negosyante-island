import { NextResponse } from "next/server";
import { clearAuthCookie, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function deletedEmail(userId: string) {
  return `deleted-${userId}@deleted.negosyante.local`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { password?: unknown; confirmation?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.confirmation !== "DELETE") {
    return NextResponse.json({ error: "Type DELETE to confirm account deletion." }, { status: 400 });
  }

  if (typeof body.password !== "string" || body.password.length === 0) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  const matches = await verifyPassword(body.password, user.passwordHash);
  if (!matches) return NextResponse.json({ error: "Password is incorrect." }, { status: 403 });

  const now = new Date();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: "Deleted User",
      email: deletedEmail(user.id),
      passwordHash: await hashPassword(`deleted-${user.id}-${now.getTime()}`),
      businessName: null,
      businessTagline: null,
      businessCategory: null,
      businessLocation: null,
      avatarUrl: null,
      backgroundPhotoUrl: null,
      failedLoginAttempts: 0,
      loginCooldownUntil: null,
      loginThrottleStage: 0,
      membershipCycle: null,
      membershipStatus: "deleted",
      membershipStartedAt: null,
      membershipEndsAt: null,
      billingProvider: null,
      role: "user",
      deletedAt: now,
      anonymizedAt: now,
      isDeleted: true,
    },
  });

  await clearAuthCookie();

  return NextResponse.json({ ok: true, redirectTo: "/trending" });
}

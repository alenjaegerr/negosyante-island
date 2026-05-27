import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginCooldownDurations = [
  10 * 60 * 1000,
  60 * 60 * 1000,
  6 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
];

function getCooldownDuration(stage: number) {
  return loginCooldownDurations[Math.min(stage, loginCooldownDurations.length - 1)];
}

function formatCooldownMessage(until: Date) {
  const minutesLeft = Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60000));
  if (minutesLeft < 60) {
    return `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`;
  }

  const hoursLeft = Math.ceil(minutesLeft / 60);
  return `Too many failed attempts. Try again in about ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}.`;
}

function getRedirectPath(role: Role) {
  if (role === Role.admin) return "/admin";
  if (role === Role.publisher_verified) return "/publisher/dashboard";
  if (role === Role.business_pending) return "/business/home";
  if (role === Role.business_verified) return "/business/home";
  if (role === Role.marketing_pending) return "/business/home";
  if (role === Role.marketing_verified) return "/business/home";
  return "/feed";
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isSecureRequest = forwardedProto === "https" || requestUrl.protocol === "https:";

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (!user.passwordHash) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  if (user.isDeleted) return NextResponse.json({ error: "This account has been deleted." }, { status: 403 });

  if (user.loginCooldownUntil && user.loginCooldownUntil.getTime() > Date.now()) {
    return NextResponse.json(
      {
        error: formatCooldownMessage(user.loginCooldownUntil),
        cooldownUntil: user.loginCooldownUntil.toISOString(),
      },
      { status: 429 },
    );
  }

  if (user.loginCooldownUntil && user.loginCooldownUntil.getTime() <= Date.now() && user.failedLoginAttempts === 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { loginCooldownUntil: null },
    });
  }

    const matches = await verifyPassword(password, user.passwordHash);

  if (!matches) {
    const attempts = user.failedLoginAttempts + 1;

    if (attempts < 10) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts },
      });

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const cooldownDuration = getCooldownDuration(user.loginThrottleStage);
    const cooldownUntil = new Date(Date.now() + cooldownDuration);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        loginThrottleStage: Math.min(user.loginThrottleStage + 1, loginCooldownDurations.length - 1),
        loginCooldownUntil: cooldownUntil,
      },
    });

    return NextResponse.json(
      {
        error: formatCooldownMessage(cooldownUntil),
        cooldownUntil: cooldownUntil.toISOString(),
      },
      { status: 429 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      loginThrottleStage: 0,
      loginCooldownUntil: null,
      lastSeenAt: new Date(),
    },
  });

    const token = await createToken(user);
    await setAuthCookie(token, isSecureRequest);

    return NextResponse.json({ ok: true, redirectTo: getRedirectPath(user.role) });
  } catch (err) {
    // Log the error server-side for debugging and return a generic 500
    // eslint-disable-next-line no-console
    console.error("/api/auth/login error:", err);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

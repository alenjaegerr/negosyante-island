import { AuthOtpPurpose, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword, normalizeEmail, createToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyOtpCode } from "@/lib/auth-otp";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  if (!email || !code || !password) {
    return NextResponse.json({ error: "Email, code, and password are required" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.isDeleted) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const verification = await verifyOtpCode({ email, purpose: AuthOtpPurpose.password_reset, code });
  if (!verification.ok) {
    return NextResponse.json({ error: verification.error }, { status: 400 });
  }

  if (verification.otp.userId && verification.otp.userId !== user.id) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      failedLoginAttempts: 0,
      loginThrottleStage: 0,
      loginCooldownUntil: null,
    },
  });

  // sign the user in automatically after resetting password
  try {
    const requestUrl = new URL(request.url);
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const isSecureRequest = forwardedProto === "https" || requestUrl.protocol === "https:";

    const token = await createToken(user);
    await setAuthCookie(token, isSecureRequest);

    function getRedirectPath(role?: Role) {
      if (role === Role.admin) return "/admin";
      if (role === Role.publisher_verified) return "/publisher/dashboard";
      if (role === Role.business_pending) return "/business/home";
      if (role === Role.business_verified) return "/business/home";
      if (role === Role.marketing_pending) return "/business/home";
      if (role === Role.marketing_verified) return "/business/home";
      return "/feed";
    }

    return NextResponse.json({ ok: true, redirectTo: getRedirectPath(user.role) });
  } catch (err) {
    console.error("/api/auth/reset-password cookie set error:", err);
    return NextResponse.json({ ok: true });
  }
}

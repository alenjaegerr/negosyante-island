import { AuthOtpPurpose } from "@prisma/client";
import { NextResponse } from "next/server";
import { buildVerificationEmailArgs, issueAndSendOtpEmail } from "@/lib/auth-otp";
import { normalizeEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.isDeleted) {
    return NextResponse.json({ ok: true });
  }

  if (user.emailVerifiedAt) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const emailArgs = await buildVerificationEmailArgs({ id: user.id, email: user.email, name: user.name });
  await issueAndSendOtpEmail({ ...emailArgs, userId: user.id, purpose: AuthOtpPurpose.email_verification });

  return NextResponse.json({ ok: true });
}

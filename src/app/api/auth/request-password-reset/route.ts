import { AuthOtpPurpose } from "@prisma/client";
import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth";
import { buildPasswordResetEmailArgs, issueAndSendOtpEmail } from "@/lib/auth-otp";
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

  const emailArgs = await buildPasswordResetEmailArgs({ id: user.id, email: user.email, name: user.name });
  await issueAndSendOtpEmail({ ...emailArgs, userId: user.id, purpose: AuthOtpPurpose.password_reset });

  return NextResponse.json({ ok: true });
}

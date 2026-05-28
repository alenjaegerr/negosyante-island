import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword, normalizeEmail } from "@/lib/auth";
import { buildVerificationEmailArgs, issueAndSendOtpEmail } from "@/lib/auth-otp";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, confirmPassword, accountType, businessName, acceptedPolicies } = body;
  const normalizedAccountType = accountType === Role.business_pending || accountType === Role.marketing_pending ? accountType : Role.user;
  const normalizedEmail = typeof email === "string" ? normalizeEmail(email) : "";

  if (!name || !normalizedEmail || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  if (acceptedPolicies !== true) {
    return NextResponse.json({ error: "You must agree to the Terms of Use and Privacy Policy" }, { status: 400 });
  }

  if ((normalizedAccountType === Role.business_pending || normalizedAccountType === Role.marketing_pending) && !businessName) {
    return NextResponse.json({ error: "Business or agency name is required for pro accounts" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role: normalizedAccountType,
      businessName: normalizedAccountType === Role.user ? null : businessName,
      emailVerifiedAt: null,
    },
  });

  try {
    const emailArgs = await buildVerificationEmailArgs({ id: user.id, email: user.email, name: user.name });
    await issueAndSendOtpEmail({ ...emailArgs, email: user.email, userId: user.id });
  } catch (error) {
    console.error("/api/auth/signup verification email error:", error);
  }

  return NextResponse.json({ ok: true, email: normalizedEmail, verifyEmailPath: `/verify-email?email=${encodeURIComponent(normalizedEmail)}` });
}

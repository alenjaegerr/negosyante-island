import crypto from "node:crypto";
import { type AuthOtpPurpose, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 15;
const OTP_MAX_ATTEMPTS = 5;
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export function generateOtpCode() {
  return String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashOtpCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function expiryDate() {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}

function formatOtpHtml(options: {
  headline: string;
  body: string;
  code: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; background: #f8fafc; padding: 24px;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 28px;">
        <p style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #0891b2; font-weight: 700; margin: 0 0 12px;">Negosyante Island</p>
        <h1 style="font-size: 24px; line-height: 1.25; margin: 0 0 12px;">${options.headline}</h1>
        <p style="margin: 0 0 20px; color: #334155;">${options.body}</p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 0.2em; text-align: center; padding: 18px; background: #f1f5f9; border-radius: 16px; margin: 0 0 20px;">${options.code}</div>
        <p style="margin: 0 0 20px; color: #475569; font-size: 14px;">This code expires in ${OTP_TTL_MINUTES} minutes. If you didn’t request this, you can ignore this email.</p>
        <p style="margin: 0;">
          <a href="${options.ctaHref}" style="display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 700;">${options.ctaLabel}</a>
        </p>
      </div>
    </div>
  `;
}

async function createOtpRecord(options: { email: string; userId?: string | null; purpose: AuthOtpPurpose }) {
  const code = generateOtpCode();
  const codeHash = hashOtpCode(code);
  const expiresAt = expiryDate();

  await prisma.authOtp.deleteMany({
    where: {
      email: options.email,
      purpose: options.purpose,
      consumedAt: null,
    },
  });

  const otp = await prisma.authOtp.create({
    data: {
      email: options.email,
      userId: options.userId ?? null,
      purpose: options.purpose,
      codeHash,
      expiresAt,
    },
  });

  return { otp, code };
}

export async function issueAndSendOtpEmail(options: {
  email: string;
  userId?: string | null;
  purpose: AuthOtpPurpose;
  headline: string;
  body: string;
  subject: string;
  ctaLabel: string;
  ctaPath: string;
}) {
  const { otp, code } = await createOtpRecord(options);
  const ctaHref = new URL(options.ctaPath, appUrl).toString();
  const html = formatOtpHtml({
    headline: options.headline,
    body: options.body,
    code,
    ctaLabel: options.ctaLabel,
    ctaHref,
  });
  const text = `${options.headline}\n\n${options.body}\n\nYour code: ${code}\n\nThis code expires in ${OTP_TTL_MINUTES} minutes. Open ${ctaHref} to continue.`;

  await sendTransactionalEmail({
    to: options.email,
    subject: options.subject,
    text,
    html,
  });

  return otp;
}

async function getActiveOtp(email: string, purpose: AuthOtpPurpose) {
  return prisma.authOtp.findFirst({
    where: {
      email,
      purpose,
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function verifyOtpCode(options: { email: string; purpose: AuthOtpPurpose; code: string }) {
  const otp = await getActiveOtp(options.email, options.purpose);
  if (!otp) {
    return { ok: false as const, error: "Invalid or expired code" };
  }

  const matches = otp.codeHash === hashOtpCode(options.code.trim());
  if (!matches) {
    const attempts = otp.attempts + 1;
    await prisma.authOtp.update({
      where: { id: otp.id },
      data: {
        attempts,
        consumedAt: attempts >= OTP_MAX_ATTEMPTS ? new Date() : null,
      },
    });

    return { ok: false as const, error: attempts >= OTP_MAX_ATTEMPTS ? "Code expired. Please request a new one." : "Invalid or expired code" };
  }

  await prisma.authOtp.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  return { ok: true as const, otp };
}

export async function buildVerificationEmailArgs(user: Pick<User, "id" | "email" | "name">) {
  return {
    email: user.email,
    userId: user.id,
    purpose: "email_verification" as AuthOtpPurpose,
    headline: "Verify your Negosyante Island email",
    body: `Hi ${user.name}, use the code below to verify your email address and finish activating your account.`,
    subject: "Verify your Negosyante Island email",
    ctaLabel: "Open verification page",
    ctaPath: `/verify-email?email=${encodeURIComponent(user.email)}`,
  };
}

export async function buildPasswordResetEmailArgs(user: Pick<User, "id" | "email" | "name">) {
  return {
    email: user.email,
    userId: user.id,
    purpose: "password_reset" as AuthOtpPurpose,
    headline: "Reset your Negosyante Island password",
    body: `Hi ${user.name}, use the code below to reset your password. If you didn’t ask for this, ignore this message.`,
    subject: "Reset your Negosyante Island password",
    ctaLabel: "Open reset page",
    ctaPath: `/reset-password?email=${encodeURIComponent(user.email)}`,
  };
}

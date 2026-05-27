import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, confirmPassword, accountType, businessName } = body;
  const normalizedAccountType = accountType === Role.business_pending || accountType === Role.marketing_pending ? accountType : Role.user;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  if ((normalizedAccountType === Role.business_pending || normalizedAccountType === Role.marketing_pending) && !businessName) {
    return NextResponse.json({ error: "Business or agency name is required for pro accounts" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: normalizedAccountType,
      businessName: normalizedAccountType === Role.user ? null : businessName,
    },
  });

  return NextResponse.json({ ok: true });
}

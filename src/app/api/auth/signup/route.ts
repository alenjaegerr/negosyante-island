import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, confirmPassword, accountType, businessName } = body;

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  if (accountType === Role.business_pending && !businessName) {
    return NextResponse.json({ error: "Business name is required for business accounts" }, { status: 400 });
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
      role: accountType === Role.business_pending ? Role.business_pending : Role.user,
      businessName: accountType === Role.business_pending ? businessName : null,
    },
  });

  return NextResponse.json({ ok: true });
}

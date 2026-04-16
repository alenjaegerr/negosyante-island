import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getRedirectPath(role: Role) {
  if (role === Role.admin) return "/admin";
  if (role === Role.business_pending) return "/business/pending";
  if (role === Role.business_verified) return "/business/dashboard";
  return "/feed";
}

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const matches = await verifyPassword(password, user.passwordHash);
  if (!matches) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await createToken(user);
  await setAuthCookie(token);

  return NextResponse.json({ ok: true, redirectTo: getRedirectPath(user.role) });
}

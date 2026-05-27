import { Role, type User } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AUTH_COOKIE = "negosyante_token";
const jwtSecret =
  process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length > 0
    ? process.env.JWT_SECRET
    : process.env.NODE_ENV === "production"
      ? ""
      : "dev-only-secret";
const secret = new TextEncoder().encode(jwtSecret);

if (process.env.NODE_ENV === "production" && !jwtSecret) {
  throw new Error("JWT_SECRET is required in production");
}

export type AuthPayload = {
  sub: string;
  role: Role;
  name: string;
  businessName?: string | null;
};

export function isProRole(role?: Role | null) {
  return role === Role.business_verified || role === Role.marketing_verified || role === Role.admin;
}

export function isPublisherRole(role?: Role | null) {
  return role === Role.publisher_verified || role === Role.publisher;
}

export function isBusinessOrMarketingPending(role?: Role | null) {
  return role === Role.business_pending || role === Role.marketing_pending;
}

export function getInsightAccessLevel(role?: Role | null) {
  if (!role) return "guest";
  if (isProRole(role)) return "pro";
  return "basic";
}

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createToken(user: User) {
  return new SignJWT({
    role: user.role,
    name: user.name,
    businessName: user.businessName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function setAuthCookie(token: string, secure = process.env.NODE_ENV === "production") {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireRole(roles: Role[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    return null;
  }
  return user;
}

export function authError(message = "Unauthorized", status = 401) {
  return NextResponse.json({ error: message }, { status });
}

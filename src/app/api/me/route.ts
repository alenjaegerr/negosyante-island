import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    name?: unknown;
    businessName?: unknown;
    avatarUrl?: unknown;
    backgroundPhotoUrl?: unknown;
    businessTagline?: unknown;
    businessCategory?: unknown;
    businessLocation?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: {
    name?: string;
    businessName?: string;
    avatarUrl?: string;
    businessTagline?: string;
    businessCategory?: string;
    businessLocation?: string;
  } = {};
  if (typeof body.name === "string") updates.name = body.name;
  if (typeof body.businessName === "string") updates.businessName = body.businessName;
  if (typeof body.avatarUrl === "string") updates.avatarUrl = body.avatarUrl;
  if (typeof body.businessTagline === "string") updates.businessTagline = body.businessTagline;
  if (typeof body.businessCategory === "string") updates.businessCategory = body.businessCategory;
  if (typeof body.businessLocation === "string") updates.businessLocation = body.businessLocation;

  try {
    await prisma.user.update({ where: { id: user.id }, data: updates });
    const backgroundPhotoUrl = typeof body.backgroundPhotoUrl === "string" ? body.backgroundPhotoUrl : undefined;
    if (backgroundPhotoUrl !== undefined) {
      await prisma.$executeRaw`
        UPDATE "User"
        SET "backgroundPhotoUrl" = ${backgroundPhotoUrl}
        WHERE id = ${user.id}
      `;
    }

    const [freshUser] = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      businessName: string | null;
      avatarUrl: string | null;
      backgroundPhotoUrl: string | null;
      businessTagline: string | null;
      businessCategory: string | null;
      businessLocation: string | null;
    }>>`
      SELECT
        id,
        name,
        "businessName" AS "businessName",
        "avatarUrl" AS "avatarUrl",
        "backgroundPhotoUrl" AS "backgroundPhotoUrl",
        "businessTagline" AS "businessTagline",
        "businessCategory" AS "businessCategory",
        "businessLocation" AS "businessLocation"
      FROM "User"
      WHERE id = ${user.id}
      LIMIT 1
    `;

    return NextResponse.json({ user: freshUser });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [freshUser] = await prisma.$queryRaw<Array<{
    id: string;
    name: string;
    businessName: string | null;
    avatarUrl: string | null;
    backgroundPhotoUrl: string | null;
    businessTagline: string | null;
    businessCategory: string | null;
    businessLocation: string | null;
  }>>`
    SELECT
      id,
      name,
      "businessName" AS "businessName",
      "avatarUrl" AS "avatarUrl",
      "backgroundPhotoUrl" AS "backgroundPhotoUrl",
      "businessTagline" AS "businessTagline",
      "businessCategory" AS "businessCategory",
      "businessLocation" AS "businessLocation"
    FROM "User"
    WHERE id = ${user.id}
    LIMIT 1
  `;

  return NextResponse.json({ user: freshUser });
}

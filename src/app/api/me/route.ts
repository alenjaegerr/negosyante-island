import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: any = {};
  if (typeof body.name === "string") updates.name = body.name;
  if (typeof body.businessName === "string") updates.businessName = body.businessName;
  if (typeof body.avatarUrl === "string") updates.avatarUrl = body.avatarUrl;

  try {
    const updated = await prisma.user.update({ where: { id: user.id }, data: updates });
    return NextResponse.json({ user: { id: updated.id, name: updated.name, businessName: updated.businessName, avatarUrl: updated.avatarUrl } });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, name: user.name, businessName: user.businessName, avatarUrl: user.avatarUrl } });
}

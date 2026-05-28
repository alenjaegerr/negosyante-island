import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertContact } from "@/lib/contacts";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.userContact.findMany({
    where: { ownerUserId: user.id },
    orderBy: [{ lastInteractionAt: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({ contacts });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await request.json();
  const contactKey = String(payload.contactKey ?? "").trim();
  const displayName = String(payload.displayName ?? "").trim();
  const profileType = String(payload.profileType ?? "person").trim();

  if (!contactKey || !displayName) {
    return NextResponse.json({ error: "contactKey and displayName are required" }, { status: 400 });
  }

  const contact = await upsertContact(user.id, {
    contactKey,
    profileType,
    displayName,
    avatarUrl: typeof payload.avatarUrl === "string" ? payload.avatarUrl : null,
    role: typeof payload.role === "string" ? payload.role : null,
    businessSlug: typeof payload.businessSlug === "string" ? payload.businessSlug : null,
    businessCategory: typeof payload.businessCategory === "string" ? payload.businessCategory : null,
    businessLocation: typeof payload.businessLocation === "string" ? payload.businessLocation : null,
    businessTagline: typeof payload.businessTagline === "string" ? payload.businessTagline : null,
    profileHref: typeof payload.profileHref === "string" ? payload.profileHref : null,
    sourceConversationId: typeof payload.sourceConversationId === "string" ? payload.sourceConversationId : null,
    sourceBusinessMessageId: typeof payload.sourceBusinessMessageId === "string" ? payload.sourceBusinessMessageId : null,
  });

  return NextResponse.json({ contact }, { status: 201 });
}

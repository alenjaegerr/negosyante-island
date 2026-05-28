import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertContact } from "@/lib/contacts";

const roleGroupFor = (role: string | null | undefined) => {
  if (!role) return "other";
  if (role === "user") return "user";
  if (role.startsWith("marketing")) return "marketing";
  if (role.startsWith("business") || role === "admin") return "business";
  if (role.startsWith("publisher")) return "other";
  return "other";
};

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const roleFilter = searchParams.get("roleFilter") ?? "all";

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: user.id } },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: 50,
    include: {
      participants: { include: { user: { select: { id: true, name: true, avatarUrl: true, businessName: true, businessTagline: true, businessCategory: true, businessLocation: true, role: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const filtered = conversations.filter((conversation) => {
    if (roleFilter === "all") return true;
    const otherParticipant = conversation.participants.find((participant) => participant.user.id !== user.id)?.user ?? conversation.participants[0]?.user;
    const group = roleGroupFor(otherParticipant?.role);
    return group === roleFilter;
  });

  return NextResponse.json({ conversations: filtered });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { participantIds = [], initialMessage } = await request.json();
  const ids = Array.isArray(participantIds) ? participantIds.map(String) : [];

  // Ensure the creator is included
  if (!ids.includes(user.id)) ids.push(user.id);

  if (ids.length < 2) {
    return NextResponse.json({ error: "At least two participants are required" }, { status: 400 });
  }

  let conversationId: string | null = null;

  if (ids.length === 2) {
    const existing = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: ids },
          },
        },
      },
      include: { participants: true },
    });

    if (existing?.participants.length === 2) {
      conversationId = existing.id;
    }
  }

  if (!conversationId) {
    const conversation = await prisma.conversation.create({
      data: {
        lastMessageAt: initialMessage && String(initialMessage).trim() ? new Date() : null,
      },
    });

    conversationId = conversation.id;

    const participantCreates = ids.map((uid: string) => ({ conversationId: conversation.id, userId: uid }));
    await prisma.conversationParticipant.createMany({ data: participantCreates, skipDuplicates: true });
  }

  if (!conversationId) {
    return NextResponse.json({ error: "Unable to create conversation" }, { status: 500 });
  }

  const resolvedConversationId = conversationId;

  const targetUsers = await prisma.user.findMany({
    where: { id: { in: ids.filter((id) => id !== user.id) } },
    select: { id: true, name: true, avatarUrl: true, businessName: true, businessTagline: true, businessCategory: true, businessLocation: true, role: true },
  });

  await Promise.all(
    targetUsers.map((targetUser) =>
      upsertContact(user.id, {
        contactKey: `user:${targetUser.id}`,
        profileType: targetUser.role,
        displayName: targetUser.businessName?.trim() || targetUser.name,
        avatarUrl: targetUser.avatarUrl,
        role: targetUser.role,
        businessTagline: targetUser.businessTagline,
        businessCategory: targetUser.businessCategory,
        businessLocation: targetUser.businessLocation,
        profileHref: `/profile/${targetUser.id}`,
        sourceConversationId: resolvedConversationId,
      }),
    ),
  );

  let message = null;
  if (initialMessage && String(initialMessage).trim()) {
    message = await prisma.message.create({
      data: {
        conversationId: resolvedConversationId,
        senderId: user.id,
        body: String(initialMessage),
      },
    });
  }

  if (message) {
    await prisma.conversation.update({ where: { id: resolvedConversationId }, data: { lastMessageAt: message.createdAt } });
  }

  const conversation = await prisma.conversation.findUnique({ where: { id: resolvedConversationId } });
  return NextResponse.json({ conversation, message }, { status: 201 });
}

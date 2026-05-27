import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertContact } from "@/lib/contacts";
import { buildMessagingShellHref } from "@/lib/messaging";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isParticipant = await prisma.conversationParticipant.findFirst({
    where: { conversationId: id, userId: user.id },
  });
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true, businessName: true, businessTagline: true, role: true } },
    },
  });
  return NextResponse.json({ messages });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isParticipant = await prisma.conversationParticipant.findFirst({ where: { conversationId: id, userId: user.id } });
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const payload = await request.json();
  const safeBody = String(payload.body ?? "").trim();
  if (!safeBody) return NextResponse.json({ error: "Message body required" }, { status: 400 });

  const kind = typeof payload.kind === "string" ? String(payload.kind) : "text";
  const mediaUrl = typeof payload.mediaUrl === "string" ? String(payload.mediaUrl) : null;
  const mediaType = typeof payload.mediaType === "string" ? String(payload.mediaType) : null;
  const appointmentAt = typeof payload.appointmentAt === "string" && payload.appointmentAt
    ? new Date(payload.appointmentAt)
    : null;

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: user.id,
      body: safeBody,
      kind,
      mediaUrl,
      mediaType,
      appointmentAt,
    },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true, businessName: true, businessTagline: true, role: true } },
    },
  });

  await prisma.conversation.update({ where: { id }, data: { lastMessageAt: message.createdAt } });

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId: id },
    include: { user: { select: { id: true, name: true, avatarUrl: true, businessName: true, businessTagline: true, businessCategory: true, businessLocation: true, role: true } } },
  });

  const recipientParticipants = participants.filter((participant) => participant.userId !== user.id);

  await Promise.all(
    recipientParticipants.map((participant) =>
        upsertContact(user.id, {
          contactKey: `user:${participant.user.id}`,
          profileType: participant.user.role,
          displayName: participant.user.businessName?.trim() || participant.user.name,
          avatarUrl: participant.user.avatarUrl,
          role: participant.user.role,
          businessTagline: participant.user.businessTagline,
          businessCategory: participant.user.businessCategory,
          businessLocation: participant.user.businessLocation,
          profileHref: `/profile/${participant.user.id}`,
          sourceConversationId: id,
        }),
      ),
  );

  await Promise.all(
    recipientParticipants.map((participant) =>
      prisma.notification.create({
        data: {
          userId: participant.user.id,
          type: "message",
          title: `New message from ${user.businessName ?? user.name}`,
          body: safeBody.slice(0, 180),
          href: buildMessagingShellHref({ conversationId: id }),
        },
      }),
    ),
  );

  return NextResponse.json({ message }, { status: 201 });
}

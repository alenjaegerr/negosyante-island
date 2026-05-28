import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const comments = await prisma.forumComment.findMany({
    where: { threadId: id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, role: true, businessName: true, avatarUrl: true } } },
  });

  return NextResponse.json({ comments });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const payload = await request.json();
  const safeContent = String(payload.content ?? "").trim();
  const mediaUrl = typeof payload.mediaUrl === "string" ? String(payload.mediaUrl).trim() : null;
  const mediaType = typeof payload.mediaType === "string" ? String(payload.mediaType).trim() : null;

  if (!safeContent) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }

  const comment = await prisma.forumComment.create({
    data: {
      content: safeContent,
      mediaUrl,
      mediaType,
      threadId: id,
      authorId: user.id,
    },
    include: { author: { select: { id: true, name: true, role: true, businessName: true, avatarUrl: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}

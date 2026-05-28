import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTags } from "@/lib/tags";

export async function GET() {
  const threads = await prisma.forumThread.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { id: true, name: true, role: true, businessName: true, avatarUrl: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json({ threads });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await request.json();
  const safeTitle = String(payload.title ?? "").trim();
  const safeBody = String(payload.body ?? "").trim();
  const mediaUrl = typeof payload.mediaUrl === "string" ? String(payload.mediaUrl).trim() : null;
  const mediaType = typeof payload.mediaType === "string" ? String(payload.mediaType).trim() : null;

  if (!safeTitle || !safeBody) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  const thread = await prisma.forumThread.create({
    data: {
      title: safeTitle,
      body: safeBody,
      mediaUrl,
      mediaType,
      tags: extractTags(`${safeTitle} ${safeBody}`),
      authorId: user.id,
    },
    include: { author: { select: { id: true, name: true, role: true, businessName: true, avatarUrl: true } } },
  });

  return NextResponse.json({ thread }, { status: 201 });
}

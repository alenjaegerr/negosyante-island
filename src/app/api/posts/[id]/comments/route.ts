import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const comments = await prisma.postComment.findMany({ where: { postId: id }, orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, name: true, avatarUrl: true, businessName: true } } } });
  return NextResponse.json({ comments });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { content, parentId } = await request.json();
  const safe = String(content ?? "").trim();
  if (!safe) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const comment = await prisma.postComment.create({ data: { postId: id, content: safe, parentId: parentId ?? null, authorId: user.id }, include: { author: { select: { id: true, name: true, avatarUrl: true, businessName: true } } } });

  // increment comment count on Post
  await prisma.post.update({ where: { id }, data: { comments: { increment: 1 } } }).catch(() => null);

  return NextResponse.json({ comment }, { status: 201 });
}

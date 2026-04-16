import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTags } from "@/lib/tags";

export async function GET() {
  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Post content is required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      content: content.trim(),
      tags: extractTags(content),
      authorId: user.id,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}

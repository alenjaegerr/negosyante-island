import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getPayload(slug: string, postId: string, userId?: string) {
  const [likes, comments, userLike] = await Promise.all([
    prisma.businessFeedLike.count({ where: { businessSlug: slug, postId } }),
    prisma.businessFeedComment.findMany({
      where: { businessSlug: slug, postId },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { id: true, authorName: true, content: true },
    }),
    userId
      ? prisma.businessFeedLike.findUnique({
          where: {
            userId_businessSlug_postId: {
              userId,
              businessSlug: slug,
              postId,
            },
          },
        })
      : Promise.resolve(null),
  ]);

  return {
    likes,
    comments,
    isLiked: Boolean(userLike),
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string; postId: string }> },
) {
  const user = await getCurrentUser();
  const { slug, postId } = await context.params;
  const payload = await getPayload(slug, postId, user?.id);
  return NextResponse.json(payload);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string; postId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, postId } = await context.params;
  const { type, content } = await request.json();

  if (type === "like") {
    await prisma.businessFeedLike.upsert({
      where: {
        userId_businessSlug_postId: {
          userId: user.id,
          businessSlug: slug,
          postId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        businessSlug: slug,
        postId,
      },
    });
  } else if (type === "unlike") {
    await prisma.businessFeedLike.deleteMany({
      where: {
        userId: user.id,
        businessSlug: slug,
        postId,
      },
    });
  } else if (type === "comment") {
    const text = String(content ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    await prisma.businessFeedComment.create({
      data: {
        businessSlug: slug,
        postId,
        content: text,
        userId: user.id,
        authorName: user.businessName ?? user.name,
      },
    });
  } else {
    return NextResponse.json({ error: "Invalid interaction type" }, { status: 400 });
  }

  const payload = await getPayload(slug, postId, user.id);
  return NextResponse.json(payload);
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { type } = await request.json();

  const post = await prisma.post.update({
    where: { id },
    data:
      type === "like"
        ? { likes: { increment: 1 } }
        : type === "comment"
          ? { comments: { increment: 1 } }
          : type === "share"
            ? { shares: { increment: 1 } }
            : { views: { increment: 1 } },
    select: { likes: true, comments: true, shares: true, views: true },
  });

  return NextResponse.json({ post });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocalBusinessBySlug } from "@/lib/local-businesses";

function getBaseFollowers(slug: string) {
  return getLocalBusinessBySlug(slug)?.followers ?? 0;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const user = await getCurrentUser();

  const dbCount = await prisma.businessFollow.count({ where: { businessSlug: slug } });
  const baseFollowers = getBaseFollowers(slug);

  if (!user) {
    return NextResponse.json({ isFollowing: false, followers: baseFollowers + dbCount });
  }

  const existing = await prisma.businessFollow.findUnique({
    where: {
      userId_businessSlug: {
        userId: user.id,
        businessSlug: slug,
      },
    },
  });

  return NextResponse.json({ isFollowing: Boolean(existing), followers: baseFollowers + dbCount });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await context.params;
  const { action } = await request.json();

  if (action !== "follow" && action !== "unfollow") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "follow") {
    await prisma.businessFollow.upsert({
      where: {
        userId_businessSlug: {
          userId: user.id,
          businessSlug: slug,
        },
      },
      update: {},
      create: {
        userId: user.id,
        businessSlug: slug,
      },
    });
  } else {
    await prisma.businessFollow.deleteMany({
      where: {
        userId: user.id,
        businessSlug: slug,
      },
    });
  }

  const dbCount = await prisma.businessFollow.count({ where: { businessSlug: slug } });
  const baseFollowers = getBaseFollowers(slug);

  return NextResponse.json({
    isFollowing: action === "follow",
    followers: baseFollowers + dbCount,
  });
}

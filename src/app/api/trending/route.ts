import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [trends, topTags] = await Promise.all([
    prisma.trend.findMany({
      orderBy: { engagementPercent: "desc" },
      take: 10,
    }),
    prisma.post.findMany({
      select: { tags: true },
      take: 200,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const frequencies = new Map<string, number>();
  for (const post of topTags) {
    for (const tag of post.tags) {
      frequencies.set(tag, (frequencies.get(tag) ?? 0) + 1);
    }
  }

  const topKeywords = [...frequencies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([keyword, count]) => ({ keyword, count }));

  return NextResponse.json({ trends, topKeywords });
}

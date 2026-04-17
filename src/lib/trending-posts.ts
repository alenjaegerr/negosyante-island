import { Prisma, type TrendCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TrendingPostCard = {
  id: string;
  title: string;
  category: TrendCategory;
  snippet: string;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  videoLoopSeconds: number;
  isInsightReady: boolean;
  createdAt: Date;
};

export async function getPublishedTrendingPosts(limit = 24): Promise<TrendingPostCard[]> {
  const prismaAny = prisma as unknown as {
    trendingPost?: {
      findMany: (args: {
        where: { isDraft: false };
        orderBy: { createdAt: "desc" };
        take: number;
        select: {
          id: true;
          title: true;
          category: true;
          snippet: true;
          content: true;
          imageUrl: true;
          videoUrl: true;
          videoLoopSeconds: true;
          isInsightReady: true;
          createdAt: true;
        };
      }) => Promise<TrendingPostCard[]>;
    };
  };

  if (prismaAny.trendingPost?.findMany) {
    return prismaAny.trendingPost.findMany({
      where: { isDraft: false },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        category: true,
        snippet: true,
        content: true,
        imageUrl: true,
        videoUrl: true,
        videoLoopSeconds: true,
        isInsightReady: true,
        createdAt: true,
      },
    });
  }

  const fallbackRows = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    category: string;
    snippet: string;
    content: string;
    imageUrl: string | null;
    videoUrl: string | null;
    videoLoopSeconds: number;
    isInsightReady: boolean;
    createdAt: Date;
  }>>(Prisma.sql`
    SELECT
      "id",
      "title",
      CAST("category" AS TEXT) AS "category",
      "snippet",
      "content",
      "imageUrl",
      "videoUrl",
      "videoLoopSeconds",
      "isInsightReady",
      "createdAt"
    FROM "TrendingPost"
    WHERE "isDraft" = false
    ORDER BY "createdAt" DESC
    LIMIT ${limit}
  `);

  return fallbackRows.map((row) => ({
    ...row,
    category: row.category as TrendCategory,
  }));
}
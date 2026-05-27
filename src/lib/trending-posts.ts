import { Prisma, type TrendCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { InsightStat } from "@/lib/site-settings";

export type TrendingPostCard = {
  id: string;
  title: string;
  category: TrendCategory;
  snippet: string;
  content: string;
  imageUrl: string | null;
  gifUrl: string | null;
  videoUrl: string | null;
  videoLoopSeconds: number;
  isInsightReady: boolean;
  insightTitle?: string | null;
  insightBody?: string | null;
  insightStats?: InsightStat[] | null;
  insightSignals?: string[] | null;
  insightUpdatedAt?: Date | null;
  createdAt: Date;
};

export async function getPublishedTrendingPosts(limit = 24): Promise<TrendingPostCard[]> {
  const fallbackRows = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    category: string;
    snippet: string;
    content: string;
    imageUrl: string | null;
    gifUrl: string | null;
    videoUrl: string | null;
    videoLoopSeconds: number;
    isInsightReady: boolean;
    insightTitle: string | null;
    insightBody: string | null;
    insightStats: unknown;
    insightSignals: string[] | null;
    insightUpdatedAt: Date | null;
    createdAt: Date;
  }>>(Prisma.sql`
    SELECT
      "id",
      "title",
      CAST("category" AS TEXT) AS "category",
      "snippet",
      "content",
      "imageUrl",
      "gifUrl",
      "videoUrl",
      "videoLoopSeconds",
      "isInsightReady",
      "insightTitle",
      "insightBody",
      "insightStats",
      "insightSignals",
      "insightUpdatedAt",
      "createdAt"
    FROM "TrendingPost"
    WHERE "isDraft" = false
    ORDER BY "createdAt" DESC
    LIMIT ${limit}
  `);

  return fallbackRows.map((row) => ({
    ...row,
    insightTitle: row.insightTitle ?? null,
    insightBody: row.insightBody ?? null,
    insightStats: (row.insightStats as InsightStat[] | null) ?? null,
    insightSignals: row.insightSignals ?? null,
    insightUpdatedAt: row.insightUpdatedAt ?? null,
    category: row.category as TrendCategory,
  }));
}
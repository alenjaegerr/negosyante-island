import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const staticRoutes = [
    "/",
    "/trending",
    "/theinternet",
    "/feed",
    "/what-we-do",
    "/about",
    "/data-analytic-process",
    "/advertising",
    "/contact-us",
    "/legal",
    "/privacy-policy",
    "/membership-program",
    "/international",
    "/select-region",
  ];

  const trendingPosts = await prisma.trendingPost.findMany({
    where: { isDraft: false },
    select: { id: true, updatedAt: true, createdAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...trendingPosts.map((post) => ({
      url: `${siteUrl}/trending/${post.id}`,
      lastModified: post.updatedAt ?? post.createdAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}

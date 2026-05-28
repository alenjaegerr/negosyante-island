import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultTrendingInsightSignals, defaultTrendingInsightStats } from "@/lib/trending-insight";
import type { InsightStat } from "@/lib/site-settings";

const allowedCategories = new Set([
  "tiktok",
  "the_internet",
  "youtube",
  "facebook",
  "reddit",
  "x",
  "instagram",
] as const);

type TrendCategory = (typeof allowedCategories extends Set<infer T> ? T : never) | never;

type TrendingPostCreateData = {
  title: string;
  category: TrendCategory;
  snippet: string;
  content: string;
  imageUrl: string | null;
  gifUrl: string | null;
  videoUrl: string | null;
  videoLoopSeconds: number;
  isDraft: boolean;
  isInsightReady: boolean;
  insightTitle: string | null;
  insightBody: string | null;
  insightStats: InsightStat[];
  insightSignals: string[];
  insightUpdatedAt: Date;
};

const getRequestOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin) return origin;

  const host = request.headers.get("host");
  if (host) return `http://${host}`;

  return new URL(request.url).origin;
};

const parseDelimitedText = (value: FormDataEntryValue | null) => {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return [];

  return rawValue
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const parseInsightStats = (formData: FormData): InsightStat[] =>
  defaultTrendingInsightStats.map((fallback, index) => {
    const statNumber = index + 1;
    const label = String(formData.get(`insightStat${statNumber}Label`) ?? "").trim() || fallback.label;
    const parsedValue = Number.parseInt(String(formData.get(`insightStat${statNumber}Value`) ?? "").trim(), 10);
    const value = Number.isFinite(parsedValue) ? Math.max(0, Math.min(100, parsedValue)) : fallback.value;
    const color = String(formData.get(`insightStat${statNumber}Color`) ?? "").trim() || fallback.color;
    const note = String(formData.get(`insightStat${statNumber}Note`) ?? "").trim() || undefined;

    return { label, value, color, note };
  });

async function storeTrendingImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("invalid_image_type");
  }

  const uploadDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "trending");
  await mkdir(uploadDir, { recursive: true });

  const originalName = file.name || "upload";
  const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extMatch ? extMatch[1].toLowerCase() : "bin";
  const fileName = `${randomUUID()}.${extension}`;
  const destination = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(destination, Buffer.from(arrayBuffer));

  return `/uploads/trending/${fileName}`;
}

async function storeTrendingGif(file: File): Promise<string> {
  if (file.type !== "image/gif") {
    throw new Error("invalid_gif_type");
  }

  const uploadDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "trending", "gifs");
  await mkdir(uploadDir, { recursive: true });

  const originalName = file.name || "upload";
  const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extMatch ? extMatch[1].toLowerCase() : "gif";
  const fileName = `${randomUUID()}.${extension}`;
  const destination = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(destination, Buffer.from(arrayBuffer));

  return `/uploads/trending/gifs/${fileName}`;
}

async function storeTrendingVideo(file: File): Promise<string> {
  if (file.type !== "video/mp4") {
    throw new Error("invalid_video_type");
  }

  const uploadDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "trending", "videos");
  await mkdir(uploadDir, { recursive: true });

  const originalName = file.name || "upload";
  const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extMatch ? extMatch[1].toLowerCase() : "mp4";
  const fileName = `${randomUUID()}.${extension}`;
  const destination = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(destination, Buffer.from(arrayBuffer));

  return `/uploads/trending/videos/${fileName}`;
}

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  // Allow admin and publisher roles to create/update trending posts
  if (
    !admin ||
    !(admin.role === Role.admin || admin.role === Role.publisher || admin.role === Role.publisher_verified)
  ) {
    return NextResponse.redirect(new URL("/login", getRequestOrigin(request)), 303);
  }

  const prismaAny = prisma as unknown as {
    trendingPost?: {
      create: (args: {
        data: TrendingPostCreateData;
      }) => Promise<unknown>;
      update: (args: {
        where: { id: string };
        data: TrendingPostCreateData;
      }) => Promise<unknown>;
    };
  };

  const saveTrendingPost = async (data: TrendingPostCreateData, editId?: string) => {
    if (editId) {
      if (prismaAny.trendingPost?.update) {
        await prismaAny.trendingPost.update({ where: { id: editId }, data });
        return;
      }

      await prisma.$executeRaw(
        Prisma.sql`
          UPDATE "TrendingPost"
          SET
            "title" = ${data.title},
            "category" = CAST(${data.category} AS "TrendCategory"),
            "snippet" = ${data.snippet},
            "content" = ${data.content},
            "imageUrl" = ${data.imageUrl},
            "gifUrl" = ${data.gifUrl},
            "videoUrl" = ${data.videoUrl},
            "videoLoopSeconds" = ${data.videoLoopSeconds},
            "isDraft" = ${data.isDraft},
            "isInsightReady" = ${data.isInsightReady},
            "insightTitle" = ${data.insightTitle},
            "insightBody" = ${data.insightBody},
            "insightStats" = CAST(${JSON.stringify(data.insightStats)} AS JSONB),
            "insightSignals" = ARRAY[${Prisma.join(data.insightSignals.map((signal) => Prisma.sql`${signal}`))}],
            "insightUpdatedAt" = ${data.insightUpdatedAt},
            "updatedAt" = ${new Date()}
          WHERE "id" = ${editId}
        `,
      );
      return;
    }

    if (prismaAny.trendingPost?.create) {
      await prismaAny.trendingPost.create({ data });
      return;
    }

    // Fallback path for stale Prisma client delegates in long-lived dev sessions.
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "TrendingPost" (
          "id", "title", "category", "snippet", "content", "imageUrl", "gifUrl", "videoUrl",
          "videoLoopSeconds", "isDraft", "isInsightReady", "insightTitle", "insightBody", "insightStats", "insightSignals", "insightUpdatedAt",
          "createdAt", "updatedAt"
        ) VALUES (
          ${randomUUID()}, ${data.title}, CAST(${data.category} AS "TrendCategory"), ${data.snippet}, ${data.content}, ${data.imageUrl}, ${data.gifUrl}, ${data.videoUrl},
          ${data.videoLoopSeconds}, ${data.isDraft}, ${data.isInsightReady}, ${data.insightTitle}, ${data.insightBody}, CAST(${JSON.stringify(data.insightStats)} AS JSONB), ARRAY[${Prisma.join(data.insightSignals.map((signal) => Prisma.sql`${signal}`))}], ${data.insightUpdatedAt},
          ${new Date()}, ${new Date()}
        )
      `,
    );
  };

  const formData = await request.formData();
  const action = String(formData.get("action") ?? "publish");
  const editIdRaw = String(formData.get("editId") ?? "").trim();
  const editId = editIdRaw || undefined;

  const title = String(formData.get("title") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim() as TrendCategory;
  const snippet = String(formData.get("snippet") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const existingImageUrlRaw = String(formData.get("existingImageUrl") ?? "").trim();
  const existingGifUrlRaw = String(formData.get("existingGifUrl") ?? "").trim();
  const existingVideoUrlRaw = String(formData.get("existingVideoUrl") ?? "").trim();
  const imageFile = formData.get("imageFile");
  const gifFile = formData.get("gifFile");
  const videoFile = formData.get("videoFile");
  let videoUrlRaw = existingVideoUrlRaw || "";
  const videoLoopSeconds = Math.max(3, Math.min(6, Number(formData.get("videoLoopSeconds") ?? 5) || 5));
  const insightTitleRaw = String(formData.get("insightTitle") ?? "").trim();
  const insightBodyRaw = String(formData.get("insightBody") ?? "").trim();
  const insightSignals = parseDelimitedText(formData.get("insightSignals"));
  const insightStats = parseInsightStats(formData);
  const isInsightReady = String(formData.get("isInsightReady") ?? "") === "on";
  const isDraftAction = action === "draft";
  const insightUpdatedAt = new Date();

  let imageUrlRaw = existingImageUrlRaw || "";
  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrlRaw = await storeTrendingImage(imageFile);
  }

  let gifUrlRaw = existingGifUrlRaw || "";
  if (gifFile instanceof File && gifFile.size > 0) {
    gifUrlRaw = await storeTrendingGif(gifFile);
  }

  if (videoFile instanceof File && videoFile.size > 0) {
    videoUrlRaw = await storeTrendingVideo(videoFile);
  }

  const safeCategory = allowedCategories.has(categoryRaw) ? categoryRaw : "the_internet";

  const buildDraftData = () => ({
    title: title || "Untitled Draft",
    category: safeCategory,
    snippet: snippet || "Draft saved before publishing.",
    content: content || "Draft saved before publishing.",
    imageUrl: imageUrlRaw || null,
    gifUrl: gifUrlRaw || null,
    videoUrl: videoUrlRaw || null,
    videoLoopSeconds,
    isDraft: true,
    isInsightReady,
    insightTitle: insightTitleRaw || null,
    insightBody: insightBodyRaw || null,
    insightStats,
    insightSignals: insightSignals.length ? insightSignals : defaultTrendingInsightSignals,
    insightUpdatedAt,
  });

  try {
    if (isDraftAction) {
      await saveTrendingPost(buildDraftData(), editId);

      return NextResponse.redirect(
        new URL(`/admin?trendingSuccess=${editId ? "trend_updated" : "draft_saved"}`, getRequestOrigin(request)),
        303,
      );
    }

    if (!title || !snippet || !content || !allowedCategories.has(categoryRaw)) {
      throw new Error("invalid_trending_post");
    }

    await saveTrendingPost({
      title,
      category: categoryRaw,
      snippet,
      content,
      imageUrl: imageUrlRaw || null,
      gifUrl: gifUrlRaw || null,
      videoUrl: videoUrlRaw || null,
      videoLoopSeconds,
      isDraft: false,
      isInsightReady,
      insightTitle: insightTitleRaw || null,
      insightBody: insightBodyRaw || null,
      insightStats,
      insightSignals: insightSignals.length ? insightSignals : defaultTrendingInsightSignals,
      insightUpdatedAt,
    }, editId);

    return NextResponse.redirect(
      new URL(`/admin?trendingSuccess=${editId ? "trend_updated" : "story_published"}`, getRequestOrigin(request)),
      303,
    );
  } catch (publishError) {
    console.error("Trending publish failed", publishError);
    try {
      await saveTrendingPost(buildDraftData(), editId);
      return NextResponse.redirect(new URL("/admin?trendingError=publish_failed_saved_draft", getRequestOrigin(request)), 303);
    } catch (draftError) {
      console.error("Trending draft fallback failed", draftError);
      return NextResponse.redirect(new URL("/admin?trendingError=publish_failed", getRequestOrigin(request)), 303);
    }
  }
}

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  videoUrl: string | null;
  videoLoopSeconds: number;
  isDraft: boolean;
  isInsightReady: boolean;
  insightTitle: string | null;
  insightBody: string | null;
};

async function storeTrendingImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("invalid_image_type");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "trending");
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

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== Role.admin) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
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
            "videoUrl" = ${data.videoUrl},
            "videoLoopSeconds" = ${data.videoLoopSeconds},
            "isDraft" = ${data.isDraft},
            "isInsightReady" = ${data.isInsightReady},
            "insightTitle" = ${data.insightTitle},
            "insightBody" = ${data.insightBody},
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
          "id", "title", "category", "snippet", "content", "imageUrl", "videoUrl",
          "videoLoopSeconds", "isDraft", "isInsightReady", "insightTitle", "insightBody",
          "createdAt", "updatedAt"
        ) VALUES (
          ${randomUUID()}, ${data.title}, CAST(${data.category} AS "TrendCategory"), ${data.snippet}, ${data.content}, ${data.imageUrl}, ${data.videoUrl},
          ${data.videoLoopSeconds}, ${data.isDraft}, ${data.isInsightReady}, ${data.insightTitle}, ${data.insightBody},
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
  const imageFile = formData.get("imageFile");
  const videoUrlRaw = String(formData.get("videoUrl") ?? "").trim();
  const videoLoopSeconds = Math.max(3, Math.min(6, Number(formData.get("videoLoopSeconds") ?? 5) || 5));
  const insightTitleRaw = String(formData.get("insightTitle") ?? "").trim();
  const insightBodyRaw = String(formData.get("insightBody") ?? "").trim();
  const isInsightReady = String(formData.get("isInsightReady") ?? "") === "on";
  const isDraftAction = action === "draft";

  let imageUrlRaw = existingImageUrlRaw || "";
  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrlRaw = await storeTrendingImage(imageFile);
  }

  const safeCategory = allowedCategories.has(categoryRaw) ? categoryRaw : "the_internet";

  const buildDraftData = () => ({
    title: title || "Untitled Draft",
    category: safeCategory,
    snippet: snippet || "Draft saved before publishing.",
    content: content || "Draft saved before publishing.",
    imageUrl: imageUrlRaw || null,
    videoUrl: videoUrlRaw || null,
    videoLoopSeconds,
    isDraft: true,
    isInsightReady,
    insightTitle: insightTitleRaw || null,
    insightBody: insightBodyRaw || null,
  });

  try {
    if (isDraftAction) {
      await saveTrendingPost(buildDraftData(), editId);

      return NextResponse.redirect(
        new URL(`/admin?trendingSuccess=${editId ? "trend_updated" : "draft_saved"}`, request.url),
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
      videoUrl: videoUrlRaw || null,
      videoLoopSeconds,
      isDraft: false,
      isInsightReady,
      insightTitle: insightTitleRaw || null,
      insightBody: insightBodyRaw || null,
    }, editId);

    return NextResponse.redirect(
      new URL(`/admin?trendingSuccess=${editId ? "trend_updated" : "story_published"}`, request.url),
      303,
    );
  } catch (publishError) {
    console.error("Trending publish failed", publishError);
    try {
      await saveTrendingPost(buildDraftData(), editId);
      return NextResponse.redirect(new URL("/admin?trendingError=publish_failed_saved_draft", request.url), 303);
    } catch (draftError) {
      console.error("Trending draft fallback failed", draftError);
      return NextResponse.redirect(new URL("/admin?trendingError=publish_failed", request.url), 303);
    }
  }
}

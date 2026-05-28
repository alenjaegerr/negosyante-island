import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTags } from "@/lib/tags";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

async function storePostMedia(file: File, kind: "image" | "gif" | "video") {
  const mimeChecks = {
    image: (mime: string) => mime.startsWith("image/") && mime !== "image/gif",
    gif: (mime: string) => mime === "image/gif",
    video: (mime: string) => mime === "video/mp4",
  } as const;

  if (!mimeChecks[kind](file.type)) {
    throw new Error(`invalid_${kind}_type`);
  }

  const folder = kind === "gif" ? ["public", "uploads", "posts", "gifs"] : kind === "video" ? ["public", "uploads", "posts", "videos"] : ["public", "uploads", "posts", "images"];
  const uploadDir = path.join(/*turbopackIgnore: true*/ process.cwd(), ...folder);
  await mkdir(uploadDir, { recursive: true });

  const originalName = file.name || "upload";
  const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extMatch ? extMatch[1].toLowerCase() : kind === "video" ? "mp4" : kind === "gif" ? "gif" : "bin";
  const fileName = `${randomUUID()}.${extension}`;
  const destination = path.join(uploadDir, fileName);

  await writeFile(destination, Buffer.from(await file.arrayBuffer()));
  return `/uploads/posts/${kind === "gif" ? "gifs" : kind === "video" ? "videos" : "images"}/${fileName}`;
}

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

  const contentType = request.headers.get("content-type") || "";
  let content = "";
  let hashtags = "";
  let imageUrl: string | null = null;
  let gifUrl: string | null = null;
  let videoUrl: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    content = String(formData.get("content") ?? "").trim();
    hashtags = String(formData.get("hashtags") ?? "").trim();

    const imageFile = formData.get("imageFile");
    const gifFile = formData.get("gifFile");
    const videoFile = formData.get("videoFile");

    if (imageFile instanceof File && imageFile.size > 0) {
      imageUrl = await storePostMedia(imageFile, "image");
    }

    if (gifFile instanceof File && gifFile.size > 0) {
      gifUrl = await storePostMedia(gifFile, "gif");
    }

    if (videoFile instanceof File && videoFile.size > 0) {
      videoUrl = await storePostMedia(videoFile, "video");
    }
  } else {
    const body = await request.json();
    content = String(body.content ?? "").trim();
    hashtags = String(body.hashtags ?? "").trim();
  }

  if (!content && !imageUrl && !gifUrl && !videoUrl) {
    return NextResponse.json({ error: "Post content or media is required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      content,
      imageUrl,
      gifUrl,
      videoUrl,
      tags: extractTags(`${content} ${hashtags}`),
      authorId: user.id,
    },
  });

  const recipients = await prisma.user.findMany({
    where: { id: { not: user.id } },
    select: { id: true },
    take: 500,
  });

  if (recipients.length > 0) {
    await prisma.notification.createMany({
      data: recipients.map((recipient) => ({
        userId: recipient.id,
        type: "culture_feed",
        title: "New Negosyante culture feed update",
        body: `${user.businessName ?? user.name} posted a new culture feed update.`,
        href: "/feed",
      })),
    });
  }

  return NextResponse.json({ post }, { status: 201 });
}

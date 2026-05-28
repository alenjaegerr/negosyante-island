import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

async function storeUserImage(file: File, subdir: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("invalid_image_type");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("file_too_large");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "users", subdir);
  await mkdir(uploadDir, { recursive: true });

  const originalName = file.name || "upload";
  const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extMatch ? extMatch[1].toLowerCase() : "png";
  const fileName = `${randomUUID()}.${extension}`;
  const destination = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(destination, Buffer.from(arrayBuffer));

  return `/uploads/users/${subdir}/${fileName}`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const kind = String(formData.get("kind") ?? "").trim(); // "avatar" or "background"
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const subdir = kind === "background" ? "backgrounds" : "avatars";
    const url = await storeUserImage(file, subdir);
    return NextResponse.json({ url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "invalid_image_type") {
      return NextResponse.json({ error: "invalid_image_type" }, { status: 400 });
    }
    if (msg === "file_too_large") {
      return NextResponse.json({ error: "file_too_large", limit: MAX_BYTES }, { status: 400 });
    }
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "node:path";

const MAX_FILE_SIZE = 512 * 1024;
const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ avatarUrl: user.avatarUrl });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (typeof body.avatarUrl !== "string") {
        return NextResponse.json({ error: "avatarUrl is required" }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: body.avatarUrl }
      });
      return NextResponse.json({ ok: true, avatarUrl: updated.avatarUrl });
    } 
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("avatar");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Avatar file is required" }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Avatar must be 512KB or less" }, { status: 400 });
      }

      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json({ error: "Unsupported avatar format" }, { status: 400 });
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || "image/png";
      const avatarUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;

      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
      });

      return NextResponse.json({ avatarUrl });
    }

    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  } catch (e) {
    console.error("Avatar update error:", e);
    return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 });
  }
}

import { DocumentType, Role } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".pdf", ".webp"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || (user.role !== Role.business_pending && user.role !== Role.marketing_pending)) {
    redirect("/login");
  }

  const formData = await request.formData();
  const businessName = String(formData.get("businessName") ?? "");
  const portfolioUrl = String(formData.get("portfolioUrl") ?? "").trim();
  const documentType = String(formData.get("documentType") ?? "");
  const file = formData.get("document");
  const isDocumentTypeValid =
    documentType === DocumentType.portfolio || documentType === DocumentType.bir_tin || documentType === DocumentType.mayor_permit;
  const isFileValid = file instanceof File;

  if (!businessName || !isDocumentTypeValid || !isFileValid) {
    redirect("/business/pending?error=invalid_submission");
  }

  if (file.size > MAX_FILE_SIZE) {
    redirect("/business/pending?error=file_too_large");
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    redirect("/business/pending?error=invalid_file_type");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeFilename = `${Date.now()}-${user.id}-${Math.random().toString(36).slice(2)}${ext}`;

  const uploadDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, safeFilename), buffer);

  await prisma.user.update({
    where: { id: user.id },
    data: { businessName },
  });

  await prisma.verificationRequest.create({
    data: {
      userId: user.id,
      businessName,
      documentType,
      documentUrl: safeFilename,
      verificationType: user.role === Role.marketing_pending ? "marketing" : "business",
      portfolioUrl: portfolioUrl || null,
    },
  });

  redirect("/business/pending");
}

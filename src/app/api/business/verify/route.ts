import { DocumentType, Role } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== Role.business_pending) {
    redirect("/login");
  }

  const formData = await request.formData();
  const businessName = String(formData.get("businessName") ?? "");
  const documentType = String(formData.get("documentType") ?? "");
  const file = formData.get("document");

  if (!businessName || (documentType !== DocumentType.bir_tin && documentType !== DocumentType.mayor_permit) || !(file instanceof File)) {
    redirect("/business/pending");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
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
      documentUrl: `/uploads/${safeFilename}`,
    },
  });

  redirect("/business/pending");
}

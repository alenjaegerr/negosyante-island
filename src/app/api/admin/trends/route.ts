import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== Role.admin) {
    redirect("/login");
  }

  const formData = await request.formData();
  const rawKeyword = String(formData.get("keyword") ?? "").trim();
  const keyword = rawKeyword.startsWith("#") ? rawKeyword : `#${rawKeyword}`;
  const engagementPercent = Number(formData.get("engagementPercent") ?? 0);
  const views = Number(formData.get("views") ?? 0);
  const growthPercent = Number(formData.get("growthPercent") ?? 0);

  if (!keyword || !Number.isFinite(engagementPercent) || !Number.isFinite(views) || !Number.isFinite(growthPercent)) {
    redirect("/admin?error=invalid_trend");
  }

  await prisma.trend.upsert({
    where: { keyword },
    update: { engagementPercent, views, growthPercent },
    create: { keyword, engagementPercent, views, growthPercent },
  });

  redirect("/admin");
}

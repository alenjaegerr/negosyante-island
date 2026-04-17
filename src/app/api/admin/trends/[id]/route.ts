import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== Role.admin) {
    redirect("/login");
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "");

  if (action === "delete") {
    await prisma.trend.delete({ where: { id } });
    redirect("/admin");
  }

  const engagementPercent = Number(formData.get("engagementPercent") ?? 0);
  const views = Number(formData.get("views") ?? 0);
  const growthPercent = Number(formData.get("growthPercent") ?? 0);

  if (!Number.isFinite(engagementPercent) || !Number.isFinite(views) || !Number.isFinite(growthPercent)) {
    redirect("/admin?error=invalid_trend_update");
  }

  await prisma.trend.update({
    where: { id },
    data: {
      engagementPercent,
      views,
      growthPercent,
    },
  });

  redirect("/admin");
}

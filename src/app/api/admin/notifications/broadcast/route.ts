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
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim();
  const audience = String(formData.get("audience") ?? "all");

  if (!title || !body) {
    redirect("/admin?error=invalid_notification");
  }

  const where =
    audience === "verified_business"
      ? { role: { in: [Role.business_verified, Role.marketing_verified] as Role[] } }
      : audience === "business_all"
        ? { role: { in: [Role.business_pending, Role.business_verified, Role.marketing_pending, Role.marketing_verified] as Role[] } }
        : audience === "verified_pro"
          ? { role: { in: [Role.business_verified, Role.marketing_verified] as Role[] } }
          : audience === "pro_all"
            ? { role: { in: [Role.business_pending, Role.business_verified, Role.marketing_pending, Role.marketing_verified] as Role[] } }
        : audience === "b2c"
          ? { role: Role.user }
          : {};

  const recipients = await prisma.user.findMany({ where, select: { id: true } });

  if (recipients.length > 0) {
    await prisma.notification.createMany({
      data: recipients.map((recipient) => ({
        userId: recipient.id,
        type: "broadcast",
        title,
        body,
        href: href || null,
      })),
    });
  }

  redirect("/admin");
}

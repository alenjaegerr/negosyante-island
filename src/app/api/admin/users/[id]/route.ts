import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = new Set([Role.user, Role.business_pending, Role.business_verified, Role.admin]);

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
  const role = String(formData.get("role") ?? "");
  const businessName = String(formData.get("businessName") ?? "").trim();

  if (!ALLOWED_ROLES.has(role as Role)) {
    redirect("/admin?error=invalid_role");
  }

  if (admin.id === id && role !== Role.admin) {
    redirect("/admin?error=self_demotion");
  }

  await prisma.user.update({
    where: { id },
    data: {
      role: role as Role,
      businessName: role === Role.business_pending || role === Role.business_verified ? businessName || null : null,
    },
  });

  redirect("/admin");
}

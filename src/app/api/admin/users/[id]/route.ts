import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = new Set([
  Role.user,
  Role.business_pending,
  Role.business_verified,
  Role.marketing_pending,
  Role.marketing_verified,
  Role.publisher_verified,
  Role.publisher,
  Role.admin,
]);

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
  const membershipCycle = String(formData.get("membershipCycle") ?? "").trim();
  const membershipStatus = String(formData.get("membershipStatus") ?? "").trim();
  const membershipEndsAt = String(formData.get("membershipEndsAt") ?? "").trim();

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
      businessName:
        role === Role.business_pending ||
        role === Role.business_verified ||
        role === Role.marketing_pending ||
        role === Role.marketing_verified
          ? businessName || null
          : null,
      membershipCycle:
        role === Role.business_pending ||
        role === Role.business_verified ||
        role === Role.marketing_pending ||
        role === Role.marketing_verified
          ? membershipCycle || null
          : null,
      membershipStatus:
        role === Role.business_pending ||
        role === Role.business_verified ||
        role === Role.marketing_pending ||
        role === Role.marketing_verified
          ? membershipStatus || null
          : null,
      membershipEndsAt:
        role === Role.business_pending ||
        role === Role.business_verified ||
        role === Role.marketing_pending ||
        role === Role.marketing_verified
          ? membershipEndsAt
            ? new Date(membershipEndsAt)
            : null
          : null,
      membershipStartedAt:
        role === Role.business_pending ||
        role === Role.business_verified ||
        role === Role.marketing_pending ||
        role === Role.marketing_verified
          ? membershipEndsAt
            ? new Date()
            : null
          : null,
      billingProvider:
        role === Role.business_verified || role === Role.marketing_verified ? "gcash" : null,
    },
  });

  redirect("/admin");
}

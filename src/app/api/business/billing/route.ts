import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== Role.business_verified && user.role !== Role.marketing_verified && user.role !== Role.admin)) {
    redirect("/login");
  }

  const formData = await request.formData();
  const membershipCycle = String(formData.get("membershipCycle") ?? "").trim();
  if (membershipCycle !== "monthly" && membershipCycle !== "annual") {
    redirect("/business/billing?error=invalid_plan");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      membershipCycle,
      membershipStatus: "active",
      billingProvider: "gcash",
    },
  });

  redirect("/business/billing?success=plan_saved");
}

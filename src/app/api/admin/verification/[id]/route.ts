import { Role, VerificationStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.admin) {
    redirect("/login");
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const decision = String(formData.get("decision") ?? "");
  const rejectionNote = String(formData.get("rejectionNote") ?? "");
  const membershipCycle = String(formData.get("membershipCycle") ?? "").trim();

  const status = decision === "approved" ? VerificationStatus.approved : VerificationStatus.rejected;
  const requestRecord = await prisma.verificationRequest.update({
    where: { id },
    data: {
      status,
      rejectionNote: status === VerificationStatus.rejected ? rejectionNote : null,
      reviewerId: user.id,
      reviewedAt: new Date(),
    },
  });

  if (status === VerificationStatus.approved) {
    const verifiedRole = requestRecord.verificationType === "marketing" ? Role.marketing_verified : Role.business_verified;
    await prisma.user.update({
      where: { id: requestRecord.userId },
      data: {
        role: verifiedRole,
        membershipCycle: membershipCycle || "annual",
        membershipStatus: "trial",
        membershipStartedAt: new Date(),
        membershipEndsAt: addMonths(new Date(), 3),
        billingProvider: "gcash",
      },
    });
  }

  if (status === VerificationStatus.rejected) {
    await prisma.user.update({
      where: { id: requestRecord.userId },
      data: {
        role: requestRecord.verificationType === "marketing" ? Role.marketing_pending : Role.business_pending,
      },
    });
  }

  redirect("/admin");
}

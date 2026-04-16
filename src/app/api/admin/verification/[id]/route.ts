import { Role, VerificationStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    await prisma.user.update({
      where: { id: requestRecord.userId },
      data: { role: Role.business_verified },
    });
  }

  if (status === VerificationStatus.rejected) {
    await prisma.user.update({
      where: { id: requestRecord.userId },
      data: { role: Role.business_pending },
    });
  }

  redirect("/admin");
}

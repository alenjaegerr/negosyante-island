import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.admin) {
    redirect("/login");
  }

  const formData = await request.formData();
  const entries = [
    ["insightBarEyebrow", String(formData.get("insightBarEyebrow") ?? "").trim()],
    ["insightBarTitle", String(formData.get("insightBarTitle") ?? "").trim()],
    ["insightBarCtaLabel", String(formData.get("insightBarCtaLabel") ?? "").trim()],
    ["insightPrimaryButtonLabel", String(formData.get("insightPrimaryButtonLabel") ?? "").trim()],
    ["insightBarFootnote", String(formData.get("insightBarFootnote") ?? "").trim()],
    ["insightSignals", String(formData.get("insightSignals") ?? "").trim()],
    ["insightStat1Label", String(formData.get("insightStat1Label") ?? "").trim()],
    ["insightStat1Value", String(formData.get("insightStat1Value") ?? "").trim()],
    ["insightStat1Color", String(formData.get("insightStat1Color") ?? "").trim()],
    ["insightStat1Note", String(formData.get("insightStat1Note") ?? "").trim()],
    ["insightStat2Label", String(formData.get("insightStat2Label") ?? "").trim()],
    ["insightStat2Value", String(formData.get("insightStat2Value") ?? "").trim()],
    ["insightStat2Color", String(formData.get("insightStat2Color") ?? "").trim()],
    ["insightStat2Note", String(formData.get("insightStat2Note") ?? "").trim()],
    ["insightStat3Label", String(formData.get("insightStat3Label") ?? "").trim()],
    ["insightStat3Value", String(formData.get("insightStat3Value") ?? "").trim()],
    ["insightStat3Color", String(formData.get("insightStat3Color") ?? "").trim()],
    ["insightStat3Note", String(formData.get("insightStat3Note") ?? "").trim()],
    ["insightStat4Label", String(formData.get("insightStat4Label") ?? "").trim()],
    ["insightStat4Value", String(formData.get("insightStat4Value") ?? "").trim()],
    ["insightStat4Color", String(formData.get("insightStat4Color") ?? "").trim()],
    ["insightStat4Note", String(formData.get("insightStat4Note") ?? "").trim()],
    ["billingPaymentLabel", String(formData.get("billingPaymentLabel") ?? "").trim()],
    ["billingPaymentDetails", String(formData.get("billingPaymentDetails") ?? "").trim()],
    ["billingPaymentQrUrl", String(formData.get("billingPaymentQrUrl") ?? "").trim()],
    ["billingPaymentNote", String(formData.get("billingPaymentNote") ?? "").trim()],
  ] as const;

  for (const [key, value] of entries) {
    if (!value) continue;
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  redirect("/admin?trendingSuccess=site_settings_saved");
}

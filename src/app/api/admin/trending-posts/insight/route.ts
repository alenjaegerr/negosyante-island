import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(user.role === "admin" || user.role === "publisher" || user.role === "publisher_verified")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { editId, insightTitle, insightBody, insightSignals, insightStats } = body ?? {};
  if (!editId) return NextResponse.json({ error: "Missing editId" }, { status: 400 });

  try {
    await prisma.trendingPost.update({
      where: { id: editId },
      data: {
        insightTitle: insightTitle ?? null,
        insightBody: insightBody ?? null,
        insightSignals: Array.isArray(insightSignals) ? insightSignals : [],
        insightStats: Array.isArray(insightStats) ? insightStats : [],
        isInsightReady: true,
        insightUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to save insight", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

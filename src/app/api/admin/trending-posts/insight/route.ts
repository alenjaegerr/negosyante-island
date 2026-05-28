import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(user.role === "admin" || user.role === "publisher" || user.role === "publisher_verified")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const editId = typeof body.editId === "string" ? body.editId : undefined;
  const insightTitle = typeof body.insightTitle === "string" ? body.insightTitle : undefined;
  const insightBody = typeof body.insightBody === "string" ? body.insightBody : undefined;
  const insightSignals = Array.isArray(body.insightSignals) ? body.insightSignals : [];
  const insightStats = Array.isArray(body.insightStats) ? body.insightStats : [];
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

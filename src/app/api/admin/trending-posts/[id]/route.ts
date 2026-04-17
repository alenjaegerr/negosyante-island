import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== Role.admin) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "");

  const prismaAny = prisma as unknown as {
    trendingPost?: {
      delete: (args: { where: { id: string } }) => Promise<unknown>;
      update: (args: { where: { id: string }; data: { isDraft: boolean; isInsightReady: boolean } }) => Promise<unknown>;
    };
  };

  const deleteTrendingPost = async (targetId: string) => {
    if (prismaAny.trendingPost?.delete) {
      await prismaAny.trendingPost.delete({ where: { id: targetId } });
      return;
    }

    await prisma.$executeRaw(
      Prisma.sql`DELETE FROM "TrendingPost" WHERE "id" = ${targetId}`,
    );
  };

  const updateTrendingPost = async (targetId: string, isDraft: boolean, isInsightReady: boolean) => {
    if (prismaAny.trendingPost?.update) {
      await prismaAny.trendingPost.update({
        where: { id: targetId },
        data: { isDraft, isInsightReady },
      });
      return;
    }

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE "TrendingPost"
        SET "isDraft" = ${isDraft}, "isInsightReady" = ${isInsightReady}, "updatedAt" = ${new Date()}
        WHERE "id" = ${targetId}
      `,
    );
  };

  if (action === "delete") {
    await deleteTrendingPost(id);
    return NextResponse.redirect(new URL("/admin?trendingSuccess=trend_deleted", request.url), 303);
  }

  const isInsightReady = String(formData.get("isInsightReady") ?? "") === "on";
  const isDraft = String(formData.get("isDraft") ?? "") === "on";
  await updateTrendingPost(id, isDraft, isInsightReady);

  return NextResponse.redirect(new URL("/admin?trendingSuccess=trend_updated", request.url), 303);
}

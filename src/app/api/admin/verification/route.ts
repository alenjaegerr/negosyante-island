import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.verificationRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return NextResponse.json({ requests });
}

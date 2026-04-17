import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const user = await getCurrentUser();
  const { name, age, option, note } = await request.json();

  const senderName = String(name ?? "").trim();
  const senderAge = Number(age ?? 0);
  const actionOption = String(option ?? "").trim();
  const messageNote = String(note ?? "").trim();

  if (!senderName || !actionOption || !messageNote || !Number.isFinite(senderAge) || senderAge < 13 || senderAge > 99) {
    return NextResponse.json({ error: "Invalid form values" }, { status: 400 });
  }

  await prisma.businessMessage.create({
    data: {
      businessSlug: slug,
      senderName,
      senderAge,
      actionOption,
      note: messageNote,
      senderUserId: user?.id ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}

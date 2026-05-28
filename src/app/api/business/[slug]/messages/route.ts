import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertContact } from "@/lib/contacts";
import { getBusinessBySlug, getBusinessUserBySlug } from "@/lib/businesses";

const allowedRoles = new Set([
  "user",
  "business_pending",
  "business_verified",
  "marketing_pending",
  "marketing_verified",
  "publisher",
  "publisher_verified",
  "admin",
]);

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!allowedRoles.has(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, age, option, note } = await request.json();

  const senderName = String(name ?? user.name ?? "").trim();
  const senderAge = Number(age ?? 18);
  const actionOption = String(option ?? "").trim();
  const messageNote = String(note ?? "").trim();
  const business = await getBusinessBySlug(slug);
  const businessOwner = await getBusinessUserBySlug(slug);

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

  await upsertContact(user.id, {
    contactKey: `business:${slug}`,
    profileType: "business",
    displayName: business?.name ?? slug,
    avatarUrl: business?.avatarUrl ?? null,
    role: user.role,
    businessSlug: slug,
    businessCategory: business?.category ?? null,
    businessLocation: business?.location ?? null,
    businessTagline: business?.tagline ?? null,
    profileHref: `/business/message/${slug}`,
    sourceBusinessMessageId: slug,
  });

  if (businessOwner) {
    await prisma.notification.create({
      data: {
        userId: businessOwner.id,
        type: "message",
        title: `New message for ${business?.name ?? slug}`,
        body: `${senderName} sent a ${actionOption} request.`,
        href: `/business/message/${slug}`,
      },
    });
  }

  return NextResponse.json({ ok: true });
}

import { prisma } from "@/lib/prisma";

export type ContactPayload = {
  contactKey: string;
  profileType: string;
  displayName: string;
  avatarUrl?: string | null;
  role?: string | null;
  businessSlug?: string | null;
  businessCategory?: string | null;
  businessLocation?: string | null;
  businessTagline?: string | null;
  profileHref?: string | null;
  sourceConversationId?: string | null;
  sourceBusinessMessageId?: string | null;
};

export async function upsertContact(ownerUserId: string, payload: ContactPayload) {
  return prisma.userContact.upsert({
    where: {
      ownerUserId_contactKey: {
        ownerUserId,
        contactKey: payload.contactKey,
      },
    },
    create: {
      ownerUserId,
      contactKey: payload.contactKey,
      profileType: payload.profileType,
      displayName: payload.displayName,
      avatarUrl: payload.avatarUrl ?? null,
      role: payload.role ?? null,
      businessSlug: payload.businessSlug ?? null,
      businessCategory: payload.businessCategory ?? null,
      businessLocation: payload.businessLocation ?? null,
      businessTagline: payload.businessTagline ?? null,
      profileHref: payload.profileHref ?? null,
      sourceConversationId: payload.sourceConversationId ?? null,
      sourceBusinessMessageId: payload.sourceBusinessMessageId ?? null,
      lastInteractionAt: new Date(),
    },
    update: {
      profileType: payload.profileType,
      displayName: payload.displayName,
      avatarUrl: payload.avatarUrl ?? null,
      role: payload.role ?? null,
      businessSlug: payload.businessSlug ?? null,
      businessCategory: payload.businessCategory ?? null,
      businessLocation: payload.businessLocation ?? null,
      businessTagline: payload.businessTagline ?? null,
      profileHref: payload.profileHref ?? null,
      sourceConversationId: payload.sourceConversationId ?? null,
      sourceBusinessMessageId: payload.sourceBusinessMessageId ?? null,
      lastInteractionAt: new Date(),
    },
  });
}

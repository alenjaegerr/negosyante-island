import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBusinessBySlug, getBusinessUserBySlug } from "@/lib/businesses";
import BusinessMessagePlatform from "@/components/business-message-platform";

type BusinessMessagePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ conversationId?: string; targetUserId?: string }>;
};

const allowedRoles = new Set([
  Role.user,
  Role.business_pending,
  Role.business_verified,
  Role.marketing_pending,
  Role.marketing_verified,
  Role.publisher,
  Role.publisher_verified,
  Role.admin,
]);
export default async function BusinessMessagePage({ params, searchParams }: BusinessMessagePageProps) {
  const { slug } = await params;
  const { conversationId, targetUserId } = await searchParams;
  const [user, business, routeParticipant, directTargetParticipant] = await Promise.all([
    getCurrentUser(),
    getBusinessBySlug(slug),
    getBusinessUserBySlug(slug),
    targetUserId
      ? prisma.user.findUnique({
          where: { id: targetUserId },
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            businessName: true,
            businessTagline: true,
            businessCategory: true,
            businessLocation: true,
            role: true,
          },
        })
      : Promise.resolve(null),
  ]);

  if (!user) redirect("/login");
  if (!allowedRoles.has(user.role)) redirect("/feed");
  if (!business) notFound();

  return (
    <BusinessMessagePlatform
      viewer={{
        id: user.id,
        name: user.name,
        businessName: user.businessName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      }}
      initialConversationId={conversationId ?? null}
      targetParticipant={
        directTargetParticipant
          ? {
              id: directTargetParticipant.id,
              name: directTargetParticipant.name,
              avatarUrl: directTargetParticipant.avatarUrl,
              businessName: directTargetParticipant.businessName,
              businessTagline: directTargetParticipant.businessTagline,
              businessCategory: directTargetParticipant.businessCategory,
              businessLocation: directTargetParticipant.businessLocation,
              role: directTargetParticipant.role,
            }
          : routeParticipant
          ? {
              id: routeParticipant.id,
              name: routeParticipant.name,
              avatarUrl: routeParticipant.avatarUrl,
              businessName: routeParticipant.businessName,
              businessTagline: routeParticipant.businessTagline,
              businessCategory: routeParticipant.businessCategory,
              businessLocation: routeParticipant.businessLocation,
              role: routeParticipant.role,
            }
          : null
      }
      businessContext={{
        slug: business.slug,
        name: business.name,
        avatarUrl: business.avatarUrl,
        tagline: business.tagline,
        category: business.category,
        location: business.location,
      }}
    />
  );
}

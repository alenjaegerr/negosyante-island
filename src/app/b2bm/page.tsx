import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import B2bmDiscoveryPanel from "@/components/b2bm-discovery-panel";
import B2bmDirectory from "@/components/b2bm-directory";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default async function B2bmPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profiles, contacts, follows] = await Promise.all([
    prisma.$queryRaw<Array<{
      id: string;
      name: string;
      avatarUrl: string | null;
      backgroundPhotoUrl: string | null;
      role: Role;
      businessName: string | null;
      businessTagline: string | null;
      businessCategory: string | null;
      businessLocation: string | null;
    }>>`
      SELECT
        id,
        name,
        "avatarUrl" AS "avatarUrl",
        "backgroundPhotoUrl" AS "backgroundPhotoUrl",
        role,
        "businessName" AS "businessName",
        "businessTagline" AS "businessTagline",
        "businessCategory" AS "businessCategory",
        "businessLocation" AS "businessLocation"
      FROM "User"
      WHERE id <> ${user.id}
        AND role IN (
          ${Role.user}::"Role",
          ${Role.business_pending}::"Role",
          ${Role.business_verified}::"Role",
          ${Role.marketing_pending}::"Role",
          ${Role.marketing_verified}::"Role"
        )
      ORDER BY "businessName" ASC, name ASC
    `,
    prisma.userContact.findMany({
      where: { ownerUserId: user.id },
      orderBy: [{ lastInteractionAt: "desc" }, { updatedAt: "desc" }],
      take: 100,
    }),
    prisma.businessFollow.findMany({
      where: { userId: user.id },
      select: { businessSlug: true },
    }),
  ]);

  const followSet = new Set(follows.map((follow) => follow.businessSlug));
  const contactSet = new Set(contacts.map((contact) => contact.contactKey));

  const enrichedProfiles = profiles.map((profile) => {
    const isBusiness = profile.role === Role.business_pending || profile.role === Role.business_verified || profile.role === Role.marketing_pending || profile.role === Role.marketing_verified;
    const businessSlug = isBusiness ? slugify(profile.businessName?.trim() || profile.name) : undefined;
    return {
      id: profile.id,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      backgroundPhotoUrl: profile.backgroundPhotoUrl,
      role: profile.role,
      businessName: profile.businessName,
      businessTagline: profile.businessTagline,
      businessCategory: profile.businessCategory,
      businessLocation: profile.businessLocation,
      businessSlug,
      isFollowed: Boolean(businessSlug && followSet.has(businessSlug)),
      isContact: contactSet.has(`user:${profile.id}`) || (businessSlug ? contactSet.has(`business:${businessSlug}`) : false),
    };
  });

  const relevantContacts = contacts.map((contact) => ({
    id: contact.id,
    displayName: contact.displayName,
    avatarUrl: contact.avatarUrl,
    profileHref: contact.profileHref,
    profileType: contact.profileType,
    businessSlug: contact.businessSlug,
    businessCategory: contact.businessCategory,
    businessLocation: contact.businessLocation,
    businessTagline: contact.businessTagline,
    role: contact.role,
  }));

  return (
    <>
      <section className="mx-auto w-full max-w-screen-2xl space-y-4 px-3 py-6 sm:px-4">
        <B2bmDiscoveryPanel viewerRole={user.role} profiles={enrichedProfiles} />
      </section>
      <B2bmDirectory
        viewerRole={user.role}
        viewerName={user.businessName?.trim() || user.name}
        profiles={enrichedProfiles}
        contacts={relevantContacts}
      />
    </>
  );
}

import { localBusinesses, type LocalBusiness } from "./local-businesses";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { isRecentlyActive } from "@/lib/presence";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const slugifyBusinessName = slugify;

function initialsFromName(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "NI";
}

export async function getBusinesses(): Promise<LocalBusiness[]> {
  const businessUsers = await prisma.$queryRaw<Array<{
    businessName: string | null;
    name: string;
    role: string;
    avatarUrl: string | null;
    backgroundPhotoUrl: string | null;
    businessTagline: string | null;
    businessCategory: string | null;
    businessLocation: string | null;
    lastSeenAt: Date | null;
  }>>(Prisma.sql`
    SELECT
      "businessName" AS "businessName",
      name,
      role,
      "avatarUrl" AS "avatarUrl",
      "backgroundPhotoUrl" AS "backgroundPhotoUrl",
      "businessTagline" AS "businessTagline",
      "businessCategory" AS "businessCategory",
      "businessLocation" AS "businessLocation",
      "lastSeenAt" AS "lastSeenAt"
    FROM "User"
    WHERE role IN ('business_pending', 'business_verified', 'marketing_pending', 'marketing_verified')
    LIMIT 200
  `);

  const derived = businessUsers
    .map((user) => {
      const displayName = user.businessName?.trim() || user.name.trim();
      const slug = slugify(displayName);
      const verified = user.role === "business_verified" || user.role === "marketing_verified";
      const online = isRecentlyActive(user.lastSeenAt);

      return {
        slug,
        name: displayName,
        category: user.businessCategory ?? "Local Business",
        location: user.businessLocation ?? "Philippines",
        tagline: user.businessTagline ?? "This business has not completed its public profile yet.",
        role: user.role,
        avatarUrl: user.avatarUrl,
        backgroundPhotoUrl: user.backgroundPhotoUrl,
        online,
        verified,
        followers: 0,
        initials: initialsFromName(displayName),
        contactOptions: ["Inquire", "Book a visit", "Request partnership"],
        posts: [],
      } as LocalBusiness;
    })
    .filter((business) => !localBusinesses.some((local) => local.slug === business.slug));

  return [...localBusinesses, ...derived];
}

export async function getBusinessBySlug(slug: string): Promise<LocalBusiness | undefined> {
  const all = await getBusinesses();
  return all.find((business) => business.slug === slug);
}

export async function getBusinessUserBySlug(slug: string) {
  const businessUsers = await prisma.$queryRaw<Array<{
    id: string;
    name: string;
    avatarUrl: string | null;
    backgroundPhotoUrl: string | null;
    businessName: string | null;
    businessTagline: string | null;
    businessCategory: string | null;
    businessLocation: string | null;
    lastSeenAt: Date | null;
    role: string;
  }>>(Prisma.sql`
    SELECT
      id,
      name,
      "avatarUrl" AS "avatarUrl",
      "backgroundPhotoUrl" AS "backgroundPhotoUrl",
      "businessName" AS "businessName",
      "businessTagline" AS "businessTagline",
      "businessCategory" AS "businessCategory",
      "businessLocation" AS "businessLocation",
      "lastSeenAt" AS "lastSeenAt",
      role
    FROM "User"
    WHERE role IN ('business_pending', 'business_verified', 'marketing_pending', 'marketing_verified')
    LIMIT 200
  `);

  return businessUsers.find((user) => slugify(user.businessName?.trim() || user.name.trim()) === slug) ?? null;
}

export { LocalBusiness };

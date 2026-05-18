import { prisma } from "@/lib/prisma";
import { localBusinesses, type LocalBusiness } from "./local-businesses";

export async function getBusinesses(): Promise<LocalBusiness[]> {
  try {
    // Try to read a Business table if it exists. Use a raw query so this file
    // doesn't depend on a generated Prisma model being present yet.
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Business" ORDER BY "name"');
    if (!rows || rows.length === 0) return localBusinesses;

    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      category: r.category,
      location: r.location,
      tagline: r.tagline,
      online: Boolean(r.online),
      verified: Boolean(r.verified),
      followers: Number(r.followers || 0),
      initials: r.initials || (r.name || "").split(" ").map((p: string) => p[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "B",
      contactOptions: (() => {
        try {
          return typeof r.contactOptions === "string" ? JSON.parse(r.contactOptions) : r.contactOptions ?? [];
        } catch {
          return [];
        }
      })(),
      posts: (() => {
        try {
          return typeof r.posts === "string" ? JSON.parse(r.posts) : r.posts ?? [];
        } catch {
          return [];
        }
      })(),
    }));
  } catch (e) {
    return localBusinesses;
  }
}

export async function getBusinessBySlug(slug: string): Promise<LocalBusiness | undefined> {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "Business" WHERE "slug" = $1 LIMIT 1', slug);
    if (!rows || rows.length === 0) return localBusinesses.find((b) => b.slug === slug);
    const r = rows[0];
    return {
      slug: r.slug,
      name: r.name,
      category: r.category,
      location: r.location,
      tagline: r.tagline,
      online: Boolean(r.online),
      verified: Boolean(r.verified),
      followers: Number(r.followers || 0),
      initials: r.initials || (r.name || "").split(" ").map((p: string) => p[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "B",
      contactOptions: (() => {
        try {
          return typeof r.contactOptions === "string" ? JSON.parse(r.contactOptions) : r.contactOptions ?? [];
        } catch {
          return [];
        }
      })(),
      posts: (() => {
        try {
          return typeof r.posts === "string" ? JSON.parse(r.posts) : r.posts ?? [];
        } catch {
          return [];
        }
      })(),
    };
  } catch (e) {
    return localBusinesses.find((b) => b.slug === slug);
  }
}

export { LocalBusiness };

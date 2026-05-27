import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { localBusinesses } from "@/lib/local-businesses";
import { isRecentlyActive } from "@/lib/presence";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const location = url.searchParams.get("location");
  const verified = url.searchParams.get("verified"); // 'true'|'false' or null

  const users = await prisma.user.findMany({
    where: { role: { in: ["business_pending", "business_verified", "marketing_pending", "marketing_verified"] } },
    select: { businessName: true, name: true, role: true, businessTagline: true, businessCategory: true, businessLocation: true, lastSeenAt: true },
    take: 200,
  });

  const derived = users.map((user) => {
    const displayName = user.businessName?.trim() || user.name.trim();
    const slug = slugify(displayName);
    const isVerified = user.role === "business_verified" || user.role === "marketing_verified";
    const online = isRecentlyActive(user.lastSeenAt);
    return {
      slug,
      name: displayName,
      category: user.businessCategory ?? "Local Business",
      location: user.businessLocation ?? "Philippines",
      tagline: user.businessTagline ?? "This business has not completed its public profile yet.",
      online,
      verified: isVerified,
      followers: 0,
    };
  });

  let all = [...localBusinesses, ...derived];
  if (location) {
    all = all.filter((b) => String(b.location ?? "").toLowerCase().includes(String(location).toLowerCase()));
  }
  if (verified === "true") all = all.filter((b) => b.verified);
  if (verified === "false") all = all.filter((b) => !b.verified);

  return NextResponse.json({ businesses: all });
}

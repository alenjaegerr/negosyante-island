import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBusinesses } from "@/lib/businesses";
import { getPublishedTrendingPosts } from "@/lib/trending-posts";
import { TrendingFeedGrid } from "@/components/trending-feed-grid";

export default async function BusinessDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== Role.business_verified && user.role !== Role.business_pending) redirect("/feed");

  const isVerified = user.role === Role.business_verified;
  const dashboardName = user.businessName ?? user.name;
  const dashboardInitials = dashboardName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "B";

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const totals = posts.reduce(
    (acc, post) => {
      acc.likes += post.likes;
      acc.views += post.views;
      return acc;
    },
    { likes: 0, views: 0 },
  );

  const trends = await prisma.trend.findMany({
    take: 5,
    orderBy: { growthPercent: "desc" },
  });

  const allBusinesses = await getBusinesses();
  const similarBusinesses = allBusinesses.slice(0, 10);
  const trendingPosts = await getPublishedTrendingPosts(8);

  return (
    <section className="space-y-4">
      <div className="rounded-xl bg-[color:var(--ni-surface-1)] p-5 shadow-sm border border-[color:var(--ni-border)]">
        <h1 className="text-2xl font-semibold text-[color:var(--ni-text-strong)]">Good day, {dashboardName}</h1>
        <p className="text-sm text-[color:var(--ni-text)]">{isVerified ? "Verified Business Dashboard" : "Business Dashboard Preview (Pending Verification)"}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[color:var(--ni-surface-1)] p-4 border border-[color:var(--ni-border)]">Total Posts: <strong>{posts.length}</strong></div>
        <div className="rounded-xl bg-[color:var(--ni-surface-1)] p-4 border border-[color:var(--ni-border)]">Total Likes: <strong>{totals.likes}</strong></div>
        <div className="rounded-xl bg-[color:var(--ni-surface-1)] p-4 border border-[color:var(--ni-border)]">Total Views: <strong>{totals.views}</strong></div>
      </div>

      <div className="rounded-xl border border-cyan-500/50 bg-[color:var(--ni-surface-1)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="font-reddit flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-700 bg-cyan-100 text-sm font-extrabold text-cyan-900">
              {dashboardInitials}
            </div>
            <div>
              <p className="font-flex-bold text-base text-[color:var(--ni-text-strong)]">{dashboardName}</p>
              <p className="text-xs font-semibold text-[color:var(--ni-text)]">
                {isVerified ? "Verified Business ✅" : "Unverified Business"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/business/account" className="rounded border border-[color:var(--ni-border)] px-2 py-1 text-xs font-semibold text-[color:var(--ni-text-strong)]">
              Account Settings
            </Link>
            {!isVerified ? (
              <Link href="/business/pending" className="rounded border border-amber-500 px-2 py-1 text-xs font-semibold text-amber-800">
                Complete Verification
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
        <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Trending tags for your market</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {trends.map((trend) => (
            <Link
              key={trend.id}
              href={`/theinternet?tag=${encodeURIComponent(trend.keyword.replace(/^#/, ""))}`}
              className="rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm transition hover:border-cyan-500 hover:bg-cyan-100"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-reddit text-cyan-900">#{trend.keyword.replace(/^#/, "")}</span>
                <span className="text-xs font-semibold text-emerald-700">+{trend.growthPercent}%</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
                <span>{trend.views.toLocaleString()} views</span>
                <span>{trend.engagementPercent}% engagement</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
        <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Similar Businesses</h2>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {similarBusinesses.map((business) => (
            <Link key={business.slug} href={`/business/${business.slug}`} className="group shrink-0 text-center">
              <div className="relative mx-auto">
                <div className="font-reddit flex h-14 w-14 items-center justify-center rounded-full border-2 border-cyan-700 bg-cyan-100 text-sm font-extrabold text-cyan-900 transition group-hover:scale-105">
                  {business.initials}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border border-white ${business.online ? "bg-emerald-500" : "bg-red-500"}`}
                  aria-hidden
                />
              </div>
              <p className="mt-1 w-20 truncate text-[11px] text-[color:var(--ni-text)]">{business.name}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
        <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Culture Feed</h2>
        <div className="mt-3">
          {/* Trending feed grid reused here */}
          <TrendingFeedGrid posts={trendingPosts} />
        </div>
      </div>
    </section>
  );
}

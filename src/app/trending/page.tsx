import Link from "next/link";
import { Role } from "@prisma/client";
import { getPublishedTrendingPosts } from "@/lib/trending-posts";
import { getBusinesses } from "@/lib/businesses";
import { getCurrentUser } from "@/lib/auth";
import { TrendingFeedGrid } from "@/components/trending-feed-grid";
import InsightStatsPanel from "@/components/insight-stats-panel";
import { LocalBusinessesPanel } from "@/components/local-businesses-panel";
import { LiveIndicator } from "@/components/live-indicator";
import { AdPlacementCard } from "@/components/ad-placement-card";
import { getAdPlacementConfig, getInsightBarConfig, getSiteSettingMap } from "@/lib/site-settings";

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export default async function TrendingPage() {
  const [posts, businesses, user, siteSettings] = await Promise.all([
    getPublishedTrendingPosts(12),
    getBusinesses(),
    getCurrentUser(),
    getSiteSettingMap(),
  ]);

  const uniqueCategories = new Set(posts.map((post) => post.category)).size;
  const stats = [
    { label: "Stories tracked", value: clampPercent(30 + posts.length * 4), color: "bg-cyan-500", note: `${posts.length} live` },
    { label: "Signal velocity", value: clampPercent(38 + uniqueCategories * 9), color: "bg-amber-400", note: `${uniqueCategories} platforms` },
    { label: "Creator momentum", value: clampPercent(46 + posts.length * 2), color: "bg-rose-500" },
    { label: "Buyer intent", value: clampPercent(32 + uniqueCategories * 8), color: "bg-emerald-400" },
  ];

  const categorySignals: Record<string, string> = {
    tiktok: "Short-form spike",
    the_internet: "Cross-platform remix",
    youtube: "Long-form explainers",
    facebook: "Community sharing",
    reddit: "Thread debates",
    x: "Breaking chatter",
    instagram: "Reels momentum",
  };

  const signals = Array.from(
    new Set(posts.map((post) => categorySignals[post.category] ?? "Signal discovery")),
  ).slice(0, 3);

  const insightBarConfig = getInsightBarConfig(siteSettings, {
    eyebrow: "Negosyante Insight",
    title: "Signal overview",
    footnote: "Signals update every 6 hours",
    ctaLabel: "Create business account",
    buttonLabel: "Open Insight Brief",
    stats,
    signals,
  });
  const hasProAccess =
    user?.role === Role.business_verified ||
    user?.role === Role.marketing_verified ||
    user?.role === Role.publisher ||
    user?.role === Role.publisher_verified ||
    user?.role === Role.admin;
  const sponsorName = siteSettings.get("sponsorName")?.trim();
  const sponsorTagline = siteSettings.get("sponsorTagline")?.trim();
  const adPlacementConfig = getAdPlacementConfig(siteSettings);
  const showAds = !user || user.role === "user";
  const insightCta = hasProAccess
    ? { href: "/business/dashboard", label: "Open Business Dashboard" }
    : user
      ? { href: "/membership-program", label: "Upgrade to Pro" }
      : { href: "/signup?accountType=business_pending", label: "Create business account" };

  return (
    <section className="mx-auto w-full max-w-screen-2xl px-3 py-6 sm:px-4">
      <LiveIndicator />

      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full lg:max-w-[72%]">
          <h1 className="whitespace-nowrap font-flex-bold text-[clamp(2.4rem,11vw,5rem)] leading-[0.88] tracking-tight text-[var(--ni-text-strong)] sm:text-[clamp(3rem,14vw,6rem)]">
            TRENDING <span className="align-middle">🔥</span>
          </h1>
        </div>

        {sponsorName ? (
          <aside className="w-full rounded border-2 border-cyan-600 bg-[color:var(--ni-surface-1)] px-3 py-2.5 sm:max-w-[280px] sm:p-3">
            <h2 className="font-reddit text-base font-extrabold tracking-tight text-[color:var(--ni-text-strong)] sm:text-2xl">TODAY&apos;S SPONSOR</h2>
            <p className="mt-0.5 text-center text-[1.6rem] font-black leading-none text-red-600 sm:mt-1 sm:text-3xl">{sponsorName}</p>
            {sponsorTagline ? (
              <p className="font-reddit text-center text-[10px] font-bold tracking-[0.14em] text-red-500 sm:text-xs sm:tracking-[0.16em]">{sponsorTagline}</p>
            ) : null}
          </aside>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <AdPlacementCard config={adPlacementConfig} show={showAds} compact />
          <TrendingFeedGrid posts={posts} viewerRole={user?.role ?? null} insightButtonLabel="Negosyante Insight" />
        </div>

        <div className="space-y-4">
          {user ? (
            <div className="relative overflow-hidden rounded-2xl">
              <div className={hasProAccess ? "" : "pointer-events-none blur-sm"}>
                <InsightStatsPanel
                  eyebrow={insightBarConfig.eyebrow}
                  title={insightBarConfig.title}
                  stats={insightBarConfig.stats}
                  signals={insightBarConfig.signals}
                  footnote={insightBarConfig.footnote}
                  cta={hasProAccess ? insightCta : null}
                />
              </div>
              {!hasProAccess ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]/55 p-4 text-center backdrop-blur-[2px]">
                  <div className="max-w-xs rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]/90 p-4 shadow-lg">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Locked Insight</p>
                    <p className="mt-2 text-sm text-[color:var(--ni-text)]">
                      Upgrade to a verified business or marketing expert account to unlock Negosyante Insight.
                    </p>
                    <Link href="/membership-program" className="mt-3 inline-flex rounded-full bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white">
                        Upgrade now
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          <LocalBusinessesPanel businesses={businesses} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[color:var(--ni-border)] bg-[linear-gradient(135deg,rgba(14,116,144,0.18),rgba(59,130,246,0.12),rgba(255,255,255,0.6))] p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">TRENDING INSIGHT</p>
            <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">🔥 Trending Signal Feed</h1>
            <p className="mt-2 text-sm text-[color:var(--ni-text)]">
              Live story cards, platform signals, and business-ready insights. Track what the island is
              talking about and convert the moment into action.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/data-analytic-process"
              className="rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]"
            >
              Data Analytic Process
            </Link>
            <Link
              href="/advertising"
              className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Advertise on Insight
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

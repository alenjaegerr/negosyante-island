import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { FaFacebookF, FaGlobe, FaInstagram, FaRedditAlien, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildTrendingMediaPreview } from "@/lib/trending-media";
import InsightStatsPanel from "@/components/insight-stats-panel";
import { TrendingMediaBlock } from "@/components/trending-media-block";
import { defaultTrendingInsightSignals, defaultTrendingInsightStats, formatInsightDate, normalizeInsightSignals, normalizeInsightStats } from "@/lib/trending-insight";
import SponsorAd from "@/components/sponsor-ad";
import AdsenseSlot from "@/components/adsense-slot";

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function linkify(text: string) {
  // Convert markdown links [text](url)
  let out = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, u) => {
    const safeText = escapeHtml(t);
    const safeUrl = escapeHtml(u);
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeText}</a>`;
  });
  // Convert bare URLs
  out = out.replace(/(https?:\/\/[^\s]+)/g, (m) => `<a href="${escapeHtml(m)}" target="_blank" rel="noopener noreferrer">${escapeHtml(m)}</a>`);
  return out;
}

function titleFromSlug(slug: string) {
  return decodeURIComponent(slug).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const insightCategoryMeta = {
  tiktok: { label: "Tiktok", icon: FaTiktok },
  the_internet: { label: "🏝️ ISLAND FORUMS", icon: FaGlobe },
  youtube: { label: "Youtube", icon: FaYoutube },
  facebook: { label: "Facebook", icon: FaFacebookF },
  reddit: { label: "Reddit", icon: FaRedditAlien },
  x: { label: "X", icon: FaXTwitter },
  instagram: { label: "Instagram", icon: FaInstagram },
} as const;

const insightSignalsByCategory: Record<string, string[]> = {
  tiktok: ["Short-form hooks", "Creator remixes", "Weekend spike"],
  the_internet: ["Cross-platform remix", "Meme acceleration", "Global chatter"],
  youtube: ["Explainer demand", "Deep-dive views", "Save-for-later lift"],
  facebook: ["Community shares", "Local group buzz", "High comment threads"],
  reddit: ["Thread debates", "Upvote momentum", "Niche community lift"],
  x: ["Breaking chatter", "Reply velocity", "Realtime coverage"],
  instagram: ["Reels momentum", "Story resharing", "Visual product focus"],
};

export default async function TrendingPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  // First try to look up a post by id. If found, render the insight page for that post.
  const post = await prisma.trendingPost.findUnique({ where: { id } });

  if (post && post.isDraft) {
    notFound();
  }

  if (post) {
    const user = await getCurrentUser();
    const categoryMeta = insightCategoryMeta[post.category as keyof typeof insightCategoryMeta] ?? { label: post.category.replaceAll("_", " "), icon: FaGlobe };
    const CategoryIcon = categoryMeta.icon;
    const preview = post.videoUrl ? buildTrendingMediaPreview(post.videoUrl, post.videoLoopSeconds) : null;
    const insightStats = normalizeInsightStats(post.insightStats, defaultTrendingInsightStats);
    const insightSignals = normalizeInsightSignals(post.insightSignals, insightSignalsByCategory[post.category] ?? defaultTrendingInsightSignals);
    const insightUpdatedLabel = formatInsightDate(post.insightUpdatedAt ?? post.updatedAt);
    const hasProAccess =
      user?.role === Role.business_verified ||
      user?.role === Role.marketing_verified ||
      user?.role === Role.publisher ||
      user?.role === Role.publisher_verified ||
      user?.role === Role.admin;
    const insightCta = hasProAccess
      ? { href: "/business/inbox", label: "Open Business Inbox" }
      : user
        ? { href: "/membership-program", label: "Upgrade to Pro" }
        : { href: "/signup?accountType=business_pending", label: "Create Business Account" };

    if (!hasProAccess && post.isInsightReady) {
      return (
        <section className="mx-auto w-full max-w-screen-2xl overflow-x-clip px-3 py-6 sm:px-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
            <main className="min-w-0 space-y-4">
              <div className="rounded-2xl bg-transparent p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Negosyante Island</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ni-muted)]">
                  {categoryMeta.label} · {new Date(post.createdAt).toLocaleDateString()} · {new Date(post.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-[color:var(--ni-text-strong)] sm:text-[48px]">{post.snippet?.trim() || post.title}</h1>
              </div>

              <TrendingMediaBlock
                title={post.title}
                imageUrl={post.imageUrl}
                gifUrl={post.gifUrl}
                videoUrl={post.videoUrl}
                className="rounded-2xl bg-[color:var(--ni-surface-1)] shadow-sm"
                mediaClassName="h-72"
              />

              <article className="break-words rounded-2xl bg-transparent p-4 text-lg font-normal leading-relaxed text-[color:var(--ni-text-strong)] font-article-serif sm:p-5 sm:text-[24px]">
                <div className="prose prose-p:break-words max-w-none">
                  {((post.content || "").split(/\n\n+/)).flatMap((para, idx, arr) => {
                    const trimmed = para.trim();
                    const nodes: ReactNode[] = [];

                    if (trimmed === "[[SPONSOR]]") {
                      nodes.push(<SponsorAd key={`sponsor-${idx}`} />);
                      return nodes;
                    }

                    const html = linkify(escapeHtml(trimmed)).replace(/\n/g, "<br />");
                    nodes.push(
                      <p key={`para-${idx}`} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />
                    );

                    if (idx === 0) {
                      nodes.push(<AdsenseSlot key="adsense-primary" />);
                    }

                    return nodes;
                  })}
                </div>
              </article>

              {post.isInsightReady ? (
                <div id="negosyante-insight" className="min-w-0 rounded-2xl border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-4 py-4 text-sm text-[color:var(--ni-text)] shadow-sm sm:px-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Negosyante Insight</p>
                  <h2 className="mt-2 font-medium text-[color:var(--ni-text-strong)]">{post.insightTitle?.trim() || post.title}</h2>
                  <p className="mt-3 text-sm text-[color:var(--ni-text)]">
                    {hasProAccess
                      ? "Unlocked for verified business and marketing expert accounts."
                      : "Create a verified business or marketing expert account to unlock this Negosyante Insight brief."}
                  </p>
                  {!hasProAccess ? (
                    <Link href={user ? "/membership-program" : "/signup?accountType=business_pending"} className="mt-4 inline-flex rounded-full bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white">
                      {user ? "Upgrade to Pro" : "Create verified business/marketing expert account"}
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {post.isInsightReady ? (
                <div className="relative min-w-0 overflow-hidden rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-3 shadow-sm sm:p-4">
                  <div className={hasProAccess ? "min-w-0" : "pointer-events-none min-w-0 blur-sm"}>
                    <InsightStatsPanel
                      title="Insight scorecard"
                      stats={insightStats}
                      signals={insightSignals}
                      footnote="Signals aggregated from this story's public signal scan"
                      meta={insightUpdatedLabel ? `Last updated ${insightUpdatedLabel}` : undefined}
                      cta={hasProAccess ? insightCta : null}
                    />
                    <article className="mt-4 break-words rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4 text-sm leading-relaxed text-[color:var(--ni-text)] shadow-sm">
                      <p className="whitespace-pre-wrap">{post.insightBody?.trim() || post.content}</p>
                    </article>
                  </div>
                  {hasProAccess ? null : (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]/60 p-3 text-center backdrop-blur-[2px] sm:p-4">
                      <div className="max-w-xs rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]/90 p-3 shadow-lg sm:p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Locked Insight</p>
                        <p className="mt-2 text-sm text-[color:var(--ni-text)]">Negosyante Insight is available to verified business and marketing expert accounts only.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </main>

            <aside className="min-w-0 space-y-4">
              <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-3 shadow-sm sm:p-4">
                <h3 className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Activation paths</h3>
                <div className="mt-3 space-y-2 text-sm text-[color:var(--ni-text)]">
                  <div className="rounded-lg border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2">
                    Bundle an offer tied to the story, then publish to your business feed.
                  </div>
                  <div className="rounded-lg border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2">
                    Recruit a creator partner and capture short-form testimonials.
                  </div>
                  <div className="rounded-lg border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2">
                    Launch a limited-time promo to convert the trend into sales.
                  </div>
                </div>
                <Link href="/membership-program" className="mt-3 inline-flex rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
                  View Membership Plans
                </Link>
              </div>
            </aside>
          </div>
        </section>
      );
    }
    return (
      <section className="mx-auto w-full max-w-screen-2xl overflow-x-clip px-3 py-6 sm:px-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <main className="min-w-0 space-y-4">
            <div className="rounded-2xl bg-transparent p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Negosyante Island</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ni-muted)]">
                {categoryMeta.label} · {new Date(post.createdAt).toLocaleDateString()} · {new Date(post.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-[color:var(--ni-text-strong)] sm:text-[48px]">{post.snippet?.trim() || post.title}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.isInsightReady ? (
                  <Link
                    href="#negosyante-insight"
                    className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Negosyante Insight
                  </Link>
                ) : (
                  <span className="rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text)]">
                    Insight analysis in progress
                  </span>
                )}
                <Link
                  href="/trending"
                  className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]"
                >
                  Back to Feed
                </Link>
              </div>
            </div>

            <TrendingMediaBlock
              title={post.title}
              imageUrl={post.imageUrl}
              gifUrl={post.gifUrl}
              videoUrl={post.videoUrl}
              className="rounded-2xl bg-[color:var(--ni-surface-1)] shadow-sm"
              mediaClassName="h-72"
            />

            {preview && preview.provider !== "direct" ? (
              <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
                <div className={`relative overflow-hidden rounded-xl ${preview.aspectClass}`}>
                  <iframe
                    title={`${post.title} ${preview.label}`}
                    src={preview.embedUrl}
                    allow="autoplay; fullscreen; picture-in-picture"
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                <p className="mt-2 text-xs text-[color:var(--ni-muted)]">Source preview: {preview.label}</p>
              </div>
            ) : null}

            {post.videoUrl && !preview ? (
              <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 text-sm text-[color:var(--ni-text)] shadow-sm">
                Video link saved, but this platform could not be embedded. Open it from the source link.
              </div>
            ) : null}

            <article className="break-words rounded-2xl bg-transparent p-4 text-lg font-normal leading-relaxed text-[color:var(--ni-text-strong)] font-article-serif sm:p-5 sm:text-[24px]">
              <div className="prose prose-p:break-words max-w-none">
                {((post.content || "").split(/\n\n+/)).flatMap((para, idx) => {
                  const trimmed = para.trim();
                  const nodes: ReactNode[] = [];

                  if (trimmed === "[[SPONSOR]]") {
                    nodes.push(<SponsorAd key={`sponsor-${idx}`} />);
                    return nodes;
                  }

                  const html = linkify(escapeHtml(trimmed)).replace(/\n/g, "<br />");
                  nodes.push(
                    <p key={`para-${idx}`} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />
                  );

                  if (idx === 0) {
                    nodes.push(<AdsenseSlot key="adsense-primary" />);
                  }

                  return nodes;
                })}
              </div>
            </article>

            {post.isInsightReady ? (
              <div id="negosyante-insight" className="rounded-2xl border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-5 py-4 text-sm text-[color:var(--ni-text)] shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Negosyante Insight</p>
                <h2 className="mt-2 font-medium text-[color:var(--ni-text-strong)]">{post.insightTitle?.trim() || post.title}</h2>
                <p className="mt-3 text-sm text-[color:var(--ni-text)]">Unlocked for verified business and marketing expert accounts.</p>
              </div>
            ) : null}

            {post.isInsightReady ? (
              <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
                <InsightStatsPanel title="Insight scorecard" stats={insightStats} signals={insightSignals} footnote="Signals aggregated from this story's public signal scan" meta={insightUpdatedLabel ? `Last updated ${insightUpdatedLabel}` : undefined} cta={hasProAccess ? insightCta : null} />
                <article className="mt-4 rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4 text-sm leading-relaxed text-[color:var(--ni-text)] shadow-sm">
                  <p className="whitespace-pre-wrap">{post.insightBody?.trim() || post.content}</p>
                </article>
              </div>
            ) : null}
          </main>

          <aside className="min-w-0 space-y-4">
            <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-3 shadow-sm sm:p-4">
              <h3 className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Activation paths</h3>
              <div className="mt-3 space-y-2 text-sm text-[color:var(--ni-text)]">
                <div className="rounded-lg border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2">
                  Bundle an offer tied to the story, then publish to your business feed.
                </div>
                <div className="rounded-lg border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2">
                  Recruit a creator partner and capture short-form testimonials.
                </div>
                <div className="rounded-lg border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2">
                  Launch a limited-time promo to convert the trend into sales.
                </div>
              </div>
              <Link href="/advertising" className="mt-3 inline-flex rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
                Plan an Insight Feature
              </Link>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  // If no DB post matches the id, treat the segment as a slug and render a generic page using the slug as title.
  const title = titleFromSlug(id);

  const fallbackStats = defaultTrendingInsightStats;
  const fallbackSignals = defaultTrendingInsightSignals;
  const insightStats = normalizeInsightStats(undefined, fallbackStats);
  const insightSignals = normalizeInsightSignals(undefined, fallbackSignals);
  const user = await getCurrentUser();
  const hasProAccess =
    user?.role === Role.business_verified ||
    user?.role === Role.marketing_verified ||
    user?.role === Role.publisher ||
    user?.role === Role.publisher_verified ||
    user?.role === Role.admin;

  return (
    <section className="mx-auto w-full max-w-screen-2xl overflow-x-clip px-3 py-6 sm:px-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        <main className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Negosyante Insight</p>
            <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ni-text-strong)]">{title}</h1>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-text)]">
              <FaFacebookF className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Facebook</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 text-sm text-[color:var(--ni-text)] shadow-sm">
            Video link saved, but this platform could not be embedded. Open it from the source link.
          </div>

          <article className="break-words rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 text-sm font-normal leading-relaxed text-[color:var(--ni-text)] shadow-sm sm:p-5">
            <p className="whitespace-pre-wrap">Brands are hopping into the trend related to {title.toLowerCase()}.</p>
          </article>

          <Link href="/trending" className="inline-flex rounded-full border border-[color:var(--ni-border)] px-4 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)] hover:bg-[color:var(--ni-surface-2)]">
            Back to Feed
          </Link>
        </main>

        <aside className="min-w-0 space-y-4">
          <div className="relative overflow-hidden rounded-2xl">
            <div className={hasProAccess ? "min-w-0" : "pointer-events-none min-w-0 blur-sm"}>
              <InsightStatsPanel title="Insight preview" stats={insightStats} signals={insightSignals} footnote="Preview data only" />
            </div>
            {!hasProAccess ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]/60 p-3 text-center backdrop-blur-[2px] sm:p-4">
                <div className="max-w-xs rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]/90 p-3 shadow-lg sm:p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Locked Insight</p>
                  <p className="mt-2 text-sm text-[color:var(--ni-text)]">Create a verified business or marketing expert account to unlock this insight preview.</p>
                  <Link href={user ? "/membership-program" : "/signup?accountType=business_pending"} className="mt-3 inline-flex rounded-full bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white">
                    {user ? "Upgrade now" : "Create business account"}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}

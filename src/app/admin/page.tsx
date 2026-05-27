import { redirect } from "next/navigation";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInsightBarConfig, getSiteSettings } from "@/lib/site-settings";
import { defaultTrendingInsightSignals, defaultTrendingInsightStats, formatInsightDate, normalizeInsightSignals, normalizeInsightStats } from "@/lib/trending-insight";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== Role.admin) redirect("/feed");

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const trendingError = typeof resolvedSearchParams?.trendingError === "string" ? resolvedSearchParams.trendingError : undefined;
  const trendingSuccess = typeof resolvedSearchParams?.trendingSuccess === "string" ? resolvedSearchParams.trendingSuccess : undefined;
  const editTrendingId = typeof resolvedSearchParams?.editId === "string" ? resolvedSearchParams.editId : undefined;

  const prismaAny = prisma as unknown as {
    businessMessage?: { count: () => Promise<number> };
    notification?: { count: () => Promise<number> };
    businessFollow?: { count: () => Promise<number> };
    trendingPost?: { findMany: (args: { orderBy: { createdAt: "desc" }; take: number }) => Promise<Array<{ id: string; title: string; category: string; snippet: string; content: string; imageUrl?: string | null; gifUrl?: string | null; isInsightReady: boolean; isDraft: boolean; insightTitle?: string | null; insightBody?: string | null; insightStats?: unknown; insightSignals?: string[] | null; insightUpdatedAt?: Date | null; videoUrl?: string | null; videoLoopSeconds?: number }>> };
  };

  const fetchTrendingPosts = async () => {
    if (prismaAny.trendingPost?.findMany) {
      return prismaAny.trendingPost.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }

    return prisma.$queryRaw<Array<{
      id: string;
      title: string;
      category: string;
      snippet: string;
      content: string;
      imageUrl?: string | null;
      gifUrl?: string | null;
      isInsightReady: boolean;
      isDraft: boolean;
      insightTitle?: string | null;
      insightBody?: string | null;
      insightStats?: unknown;
      insightSignals?: string[] | null;
      insightUpdatedAt?: Date | null;
      videoUrl: string | null;
      videoLoopSeconds: number;
    }>>(Prisma.sql`
      SELECT
        "id",
        "title",
        CAST("category" AS TEXT) AS "category",
        "snippet",
        "content",
        "imageUrl",
        "gifUrl",
        "isInsightReady",
        "isDraft",
        "insightTitle",
        "insightBody",
        "insightStats",
        "insightSignals",
        "insightUpdatedAt",
        "videoUrl",
        "videoLoopSeconds"
      FROM "TrendingPost"
      ORDER BY "createdAt" DESC
      LIMIT 20
    `);
  };

  const [requests, users, trends, trendingPosts, siteSettings, postCount, messageCount, notificationCount, followsCount] = await Promise.all([
    prisma.verificationRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
      take: 30,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.trend.findMany({
      orderBy: { growthPercent: "desc" },
      take: 20,
    }),
    fetchTrendingPosts(),
    getSiteSettings(),
    prisma.post.count(),
    prismaAny.businessMessage?.count ? prismaAny.businessMessage.count() : Promise.resolve(0),
    prismaAny.notification?.count ? prismaAny.notification.count() : Promise.resolve(0),
    prismaAny.businessFollow?.count ? prismaAny.businessFollow.count() : Promise.resolve(0),
  ]);

  const pendingRequests = requests.filter((request) => request.status === "pending").length;
  const verifiedBusinesses = users.filter((account) => account.role === Role.business_verified || account.role === Role.marketing_verified).length;
  const marketingExperts = users.filter((account) => account.role === Role.marketing_verified).length;
  const draftTrendingPosts = trendingPosts.filter((item) => item.isDraft);
  const publishedTrendingPosts = trendingPosts.filter((item) => !item.isDraft);
  const editingPost = editTrendingId ? trendingPosts.find((item) => item.id === editTrendingId) : undefined;
  const editingInsightStats = normalizeInsightStats(editingPost?.insightStats, defaultTrendingInsightStats);
  const editingInsightSignals = normalizeInsightSignals(editingPost?.insightSignals, defaultTrendingInsightSignals);
  const editingInsightUpdatedLabel = formatInsightDate(editingPost?.insightUpdatedAt ?? null);
  const insightSettings = new Map(siteSettings.map((setting) => [setting.key, setting.value]));
  const insightBarEyebrow = insightSettings.get("insightBarEyebrow") ?? "Negosyante Insight";
  const insightBarTitle = insightSettings.get("insightBarTitle") ?? "Trend statistics";
  const insightBarCtaLabel = insightSettings.get("insightBarCtaLabel") ?? "Create business account";
  const insightBarFootnote = insightSettings.get("insightBarFootnote") ?? "Signals refresh from public engagement";
  const insightBarConfig = getInsightBarConfig(insightSettings, {
    eyebrow: insightBarEyebrow,
    title: insightBarTitle,
    footnote: insightBarFootnote,
    ctaLabel: insightBarCtaLabel,
    buttonLabel: insightSettings.get("insightPrimaryButtonLabel") ?? "Open Insight Brief",
    stats: [
      { label: "Stories tracked", value: 34, color: "bg-cyan-500", note: "1 live" },
      { label: "Signal velocity", value: 47, color: "bg-amber-400", note: "1 platform" },
      { label: "Creator momentum", value: 48, color: "bg-rose-500" },
      { label: "Buyer intent", value: 40, color: "bg-emerald-400" },
    ],
    signals: ["Breaking chatter", "Cross-platform remix", "Buyer-ready audience"],
  });
  const billingPaymentLabel = insightSettings.get("billingPaymentLabel") ?? "GCash payment channel";
  const billingPaymentDetails = insightSettings.get("billingPaymentDetails") ?? "Add your official GCash number or payment instructions here.";
  const billingPaymentQrUrl = insightSettings.get("billingPaymentQrUrl") ?? "";
  const billingPaymentNote = insightSettings.get("billingPaymentNote") ?? "Use the admin panel to keep the payment details current.";

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--ni-text-strong)]">Admin Control Center</h1>
        <p className="mt-1 text-sm text-[var(--ni-text)]">
          Trust operations, growth analytics, and platform controls for Negosyante Island.
        </p>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--ni-text-strong)]">Publisher Accounts</h2>
          <span className="text-xs text-[var(--ni-text)]">Create or manage Cultured Authors</span>
        </div>

        <p className="mt-2 text-sm text-[var(--ni-text)]">Create publisher accounts for curated authors and bloggers who will contribute to the Trending feed.</p>
        <div className="mt-3 flex gap-2">
          <Link href="/admin/publishers/create" className="rounded bg-[var(--ni-brand)] px-3 py-2 text-sm font-semibold text-[var(--ni-surface-1)]">Create Publisher Account</Link>
          <Link href="/publisher/dashboard" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-sm font-semibold text-[var(--ni-text-strong)]">Open Publisher Dashboard</Link>
        </div>
      </div>

      {trendingError ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-[var(--ni-text-strong)]">
          {trendingError === "publish_failed_saved_draft"
            ? "Publishing failed, so the story was saved as a draft instead."
            : trendingError === "client_not_ready"
              ? "Publishing is temporarily unavailable because the Prisma client is not ready. Restart the dev server and try again."
              : trendingError === "publish_failed_write"
                ? "Trend story publish and draft fallback both failed due to a write error. Check database connection and server logs."
                : "Trend story could not be published. You can save it as a draft and try again later."}
        </div>
      ) : null}

      {trendingSuccess ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-[var(--ni-text-strong)]">
          {trendingSuccess === "draft_saved"
            ? "Draft saved successfully."
            : trendingSuccess === "trend_updated"
              ? "Trending story updated successfully."
              : trendingSuccess === "trend_deleted"
                ? "Trending story deleted successfully."
              : "Trend story published successfully."}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
          <p className="text-sm text-[var(--ni-text)]">Pending Verifications</p>
          <p className="text-2xl font-semibold text-amber-500">{pendingRequests}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
          <p className="text-sm text-[var(--ni-text)]">Verified Pro Accounts</p>
          <p className="text-2xl font-semibold text-emerald-500">{verifiedBusinesses}</p>
          <p className="mt-1 text-xs text-[var(--ni-text)]">Business + Marketing Expert</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
          <p className="text-sm text-[var(--ni-text)]">Total Posts</p>
          <p className="text-2xl font-semibold text-[var(--ni-text-strong)]">{postCount}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
          <p className="text-sm text-[var(--ni-text)]">Business Messages</p>
          <p className="text-2xl font-semibold text-[var(--ni-brand)]">{messageCount}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
          <p className="text-sm text-[var(--ni-text)]">Marketing Experts</p>
          <p className="text-2xl font-semibold text-fuchsia-500">{marketingExperts}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--ni-text-strong)]">Negosyante Insight Customization</h2>
          <span className="text-xs text-[var(--ni-text)]">Update the guest lock copy and CTA shown on Trending</span>
        </div>

        <p className="mt-3 text-sm text-[var(--ni-text)]">Use the insight bars panel below to edit the shared metrics, button label, and lock copy in one place.</p>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--ni-text-strong)]">Negosyante Insight Bars</h2>
          <span className="text-xs text-[var(--ni-text)]">Shared on Trending and Insight article pages</span>
        </div>

        <form action="/api/admin/site-settings" method="post" className="mt-3 space-y-4">
          <div className="grid gap-2 md:grid-cols-2">
            <input name="insightPrimaryButtonLabel" defaultValue={insightBarConfig.buttonLabel} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Insight button label" />
            <textarea name="insightSignals" defaultValue={insightBarConfig.signals.join("\n")} rows={3} className="md:col-span-2 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="One signal per line" />
          </div>

          <div className="grid gap-3">
            {insightBarConfig.stats.map((stat, index) => {
              const statNumber = index + 1;
              return (
                <div key={stat.label} className="grid gap-2 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3 md:grid-cols-[1.2fr_0.5fr_0.8fr_1.2fr]">
                  <input name={`insightStat${statNumber}Label`} defaultValue={stat.label} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder={`Stat ${statNumber} label`} />
                  <input name={`insightStat${statNumber}Value`} defaultValue={String(stat.value)} type="number" min={0} max={100} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Value" />
                  <select name={`insightStat${statNumber}Color`} defaultValue={stat.color} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 text-sm text-[var(--ni-text-strong)]">
                    <option value="bg-cyan-500">Cyan</option>
                    <option value="bg-amber-400">Amber</option>
                    <option value="bg-rose-500">Rose</option>
                    <option value="bg-emerald-400">Emerald</option>
                    <option value="bg-indigo-500">Indigo</option>
                    <option value="bg-fuchsia-500">Fuchsia</option>
                    <option value="bg-sky-500">Sky</option>
                    <option value="bg-orange-500">Orange</option>
                  </select>
                  <input name={`insightStat${statNumber}Note`} defaultValue={stat.note ?? ""} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder={`Stat ${statNumber} note (optional)`} />
                </div>
              );
            })}
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <input name="insightBarEyebrow" defaultValue={insightBarConfig.eyebrow} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Eyebrow text" />
            <input name="insightBarTitle" defaultValue={insightBarConfig.title} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Panel title" />
            <textarea name="insightBarFootnote" defaultValue={insightBarConfig.footnote} rows={2} className="md:col-span-2 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Footnote" />
            <input name="insightBarCtaLabel" defaultValue={insightBarConfig.ctaLabel} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Locked CTA label" />
          </div>

          <button type="submit" className="rounded bg-[var(--ni-brand)] px-3 py-2 text-sm font-semibold text-[var(--ni-surface-1)]">Save Insight Bars</button>
        </form>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--ni-text-strong)]">Billing Payment Details</h2>
          <span className="text-xs text-[var(--ni-text)]">Shown on the business billing page</span>
        </div>

        <form action="/api/admin/site-settings" method="post" className="mt-3 grid gap-2 md:grid-cols-2">
          <input name="billingPaymentLabel" defaultValue={billingPaymentLabel} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Channel label" />
          <input name="billingPaymentDetails" defaultValue={billingPaymentDetails} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Payment instructions" />
          <input name="billingPaymentQrUrl" defaultValue={billingPaymentQrUrl} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="QR code image URL (optional)" />
          <input name="billingPaymentNote" defaultValue={billingPaymentNote} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Billing note" />
          <button type="submit" className="rounded bg-[var(--ni-brand)] px-3 py-2 text-sm font-semibold text-[var(--ni-surface-1)] md:col-span-2">Save Billing Details</button>
        </form>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 id="trending-feed-publisher" className="text-lg font-semibold text-[var(--ni-text-strong)]">
            {editingPost ? "Trending Feed Editor" : "Trending Feed Publisher"}
          </h2>
          <span className="text-xs text-[var(--ni-text)]">Create culture feed cards with image and insight article</span>
        </div>

        <p className="mt-2 text-xs text-[var(--ni-muted)]">
          {editingInsightUpdatedLabel ? `Insight bars last updated ${editingInsightUpdatedLabel}` : "New stories will save their own Negosyante Insight bars when published."}
        </p>

        {editingPost ? (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-sky-400/30 bg-sky-500/10 p-3 text-sm text-[var(--ni-text-strong)]">
            <p>
              Editing: <strong>{editingPost.title}</strong>
            </p>
            <Link href="/admin" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1 text-xs font-semibold text-[var(--ni-text-strong)]">
              Cancel Edit
            </Link>
          </div>
        ) : null}

        <form
          key={editingPost?.id ?? "new-trending-post"}
          action="/api/admin/trending-posts"
          method="post"
          encType="multipart/form-data"
          className="mt-3 grid gap-2 md:grid-cols-2"
        >
          <input type="hidden" name="editId" defaultValue={editingPost?.id ?? ""} />
          <input type="hidden" name="existingImageUrl" defaultValue={editingPost?.imageUrl ?? ""} />
          <input type="hidden" name="existingGifUrl" defaultValue={editingPost?.gifUrl ?? ""} />
          <input type="hidden" name="existingVideoUrl" defaultValue={editingPost?.videoUrl ?? ""} />
          <input name="title" required defaultValue={editingPost?.title ?? ""} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Card title" />
          <select name="category" required defaultValue={editingPost?.category ?? "the_internet"} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)]">
            <option value="tiktok">Tiktok</option>
            <option value="the_internet">The Internet</option>
            <option value="youtube">Youtube</option>
            <option value="facebook">Facebook</option>
            <option value="reddit">Reddit</option>
            <option value="x">X</option>
            <option value="instagram">Instagram</option>
          </select>
          <div className="grid gap-2 md:col-span-2 md:grid-cols-2">
            <label className="group rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm">
              <span className="mb-1 block text-xs font-semibold text-[var(--ni-text-strong)]">Upload image (all image types supported)</span>
              <input name="imageFile" type="file" accept="image/*" className="block w-full text-xs text-[var(--ni-text)]" />
              {editingPost?.imageUrl ? (
                <span className="mt-1 block text-[11px] text-[var(--ni-text)]">Current image: {editingPost.imageUrl}</span>
              ) : null}
              <div className="mt-2 overflow-hidden rounded border border-dashed border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 text-[11px] text-[var(--ni-text)] opacity-0 transition-all duration-200 group-hover:opacity-100">
                <span className="mb-1 block text-xs font-semibold text-[var(--ni-text-strong)]">Upload GIF (reveals on hover)</span>
                <input name="gifFile" type="file" accept="image/gif" className="block w-full text-xs text-[var(--ni-text)]" />
                {editingPost?.gifUrl ? (
                  <span className="mt-1 block text-[11px] text-[var(--ni-text)]">Current GIF: {editingPost.gifUrl}</span>
                ) : null}
              </div>
            </label>
            <label className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm">
              <span className="mb-1 block text-xs font-semibold text-[var(--ni-text-strong)]">Upload MP4 video</span>
              <input name="videoFile" type="file" accept="video/mp4" className="block w-full text-xs text-[var(--ni-text)]" />
              {editingPost?.videoUrl ? (
                <span className="mt-1 block text-[11px] text-[var(--ni-text)]">Current video: {editingPost.videoUrl}</span>
              ) : null}
            </label>
          </div>
          <input name="videoLoopSeconds" type="number" min={3} max={6} defaultValue={editingPost?.videoLoopSeconds ?? 5} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)] md:col-span-2" placeholder="Loop seconds (3-6, default 5)" />
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-[var(--ni-text-strong)]">Story Title</span>
            <textarea name="snippet" required defaultValue={editingPost?.snippet ?? ""} rows={2} className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Story Title shown in locked insight teaser" />
          </label>
          <textarea name="content" required defaultValue={editingPost?.content ?? ""} rows={4} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)] md:col-span-2" placeholder="Full story used when Read More expands" />
          <input name="insightTitle" defaultValue={editingPost?.insightTitle ?? ""} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)] md:col-span-2" placeholder="Negosyante Insight title (optional)" />
          <textarea name="insightBody" defaultValue={editingPost?.insightBody ?? ""} rows={4} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)] md:col-span-2" placeholder="Negosyante Insight body (optional; falls back to full story)" />
          <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[var(--ni-text-strong)]">Negosyante Insight Bars</h3>
              <span className="text-[11px] text-[var(--ni-muted)]">Stored with each post</span>
            </div>
            <div className="mt-3 grid gap-3">
              {editingInsightStats.map((stat, index) => {
                const statNumber = index + 1;
                return (
                  <div key={statNumber} className="grid gap-2 rounded-lg border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-3 md:grid-cols-[1.2fr_0.5fr_0.8fr_1.2fr]">
                    <input name={`insightStat${statNumber}Label`} defaultValue={stat.label} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder={`Stat ${statNumber} label`} />
                    <input name={`insightStat${statNumber}Value`} type="number" min={0} max={100} defaultValue={String(stat.value)} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Value" />
                    <select name={`insightStat${statNumber}Color`} defaultValue={stat.color} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)]">
                      <option value="bg-cyan-500">Cyan</option>
                      <option value="bg-amber-400">Amber</option>
                      <option value="bg-rose-500">Rose</option>
                      <option value="bg-emerald-400">Emerald</option>
                      <option value="bg-indigo-500">Indigo</option>
                      <option value="bg-fuchsia-500">Fuchsia</option>
                      <option value="bg-sky-500">Sky</option>
                      <option value="bg-orange-500">Orange</option>
                    </select>
                    <input name={`insightStat${statNumber}Note`} defaultValue={stat.note ?? ""} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder={`Stat ${statNumber} note (optional)`} />
                  </div>
                );
              })}
            </div>
            <textarea name="insightSignals" defaultValue={editingInsightSignals.join("\n")} rows={3} className="mt-3 w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="One signal per line" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="isInsightReady" defaultChecked={editingPost ? editingPost.isInsightReady : true} />
            Enable Negosyante Insight button for this post
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button
              type="submit"
              name="action"
              value="draft"
              formNoValidate
              className="rounded bg-[var(--ni-surface-3)] px-3 py-1.5 text-sm font-semibold text-[var(--ni-text-strong)]"
            >
              {editingPost ? "Save Draft Changes" : "Save as Draft"}
            </button>
            <button type="submit" name="action" value="publish" className="rounded bg-[var(--ni-brand)] px-3 py-1.5 text-sm font-semibold text-[var(--ni-surface-1)]">
              {editingPost ? "Publish Changes" : "Publish Trend Story"}
            </button>
          </div>
        </form>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--ni-text-strong)]">Draft Stories</h3>
              <span className="rounded-full bg-[var(--ni-surface-3)] px-2 py-0.5 text-xs font-semibold text-[var(--ni-text-strong)]">
                {draftTrendingPosts.length}
              </span>
            </div>
            <div className="space-y-2">
              {draftTrendingPosts.length ? draftTrendingPosts.map((item) => (
                <form key={item.id} action={`/api/admin/trending-posts/${item.id}`} method="post" className="grid items-center gap-2 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-3 md:grid-cols-[1.5fr_1fr_auto_auto]">
                  <div>
                    <p className="font-semibold text-[var(--ni-text-strong)]">{item.title}</p>
                    <p className="text-xs uppercase tracking-wide text-[var(--ni-text)]">{item.category.replaceAll("_", " ")}</p>
                    {formatInsightDate(item.insightUpdatedAt) ? (
                      <p className="text-[11px] text-[var(--ni-muted)]">Insight updated {formatInsightDate(item.insightUpdatedAt)}</p>
                    ) : null}
                    {item.videoUrl ? (
                      <p className="text-xs text-[var(--ni-text)]">Video linked · {item.videoLoopSeconds ?? 5}s loop</p>
                    ) : null}
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-[var(--ni-text)]">
                    <input type="checkbox" name="isInsightReady" defaultChecked={item.isInsightReady} />
                    Insight enabled
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-[var(--ni-text)]">
                    <input type="checkbox" name="isDraft" defaultChecked={item.isDraft} />
                    Draft
                  </label>
                  <div className="flex gap-2">
                    <Link href={`/admin?editId=${item.id}#trending-feed-publisher`} className="rounded bg-[var(--ni-brand)] px-2 py-1.5 text-xs font-semibold text-[var(--ni-surface-1)]">Edit</Link>
                    <button type="submit" name="action" value="delete" className="rounded bg-rose-600 px-2 py-1.5 text-xs font-semibold text-white">Delete</button>
                  </div>
                </form>
              )) : (
                <p className="rounded border border-dashed border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-3 text-xs text-[var(--ni-text)]">No drafts yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--ni-text-strong)]">Published Stories</h3>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                {publishedTrendingPosts.length}
              </span>
            </div>
            <div className="space-y-2">
              {publishedTrendingPosts.length ? publishedTrendingPosts.map((item) => (
                <form key={item.id} action={`/api/admin/trending-posts/${item.id}`} method="post" className="grid items-center gap-2 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-3 md:grid-cols-[1.5fr_1fr_auto_auto]">
                  <div>
                    <p className="font-semibold text-[var(--ni-text-strong)]">{item.title}</p>
                    <p className="text-xs uppercase tracking-wide text-[var(--ni-text)]">{item.category.replaceAll("_", " ")}</p>
                    {formatInsightDate(item.insightUpdatedAt) ? (
                      <p className="text-[11px] text-[var(--ni-muted)]">Insight updated {formatInsightDate(item.insightUpdatedAt)}</p>
                    ) : null}
                    {item.videoUrl ? (
                      <p className="text-xs text-[var(--ni-text)]">Video linked · {item.videoLoopSeconds ?? 5}s loop</p>
                    ) : null}
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-[var(--ni-text)]">
                    <input type="checkbox" name="isInsightReady" defaultChecked={item.isInsightReady} />
                    Insight enabled
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-[var(--ni-text)]">
                    <input type="checkbox" name="isDraft" defaultChecked={item.isDraft} />
                    Draft
                  </label>
                  <div className="flex gap-2">
                    <Link href={`/admin?editId=${item.id}#trending-feed-publisher`} className="rounded bg-[var(--ni-brand)] px-2 py-1.5 text-xs font-semibold text-[var(--ni-surface-1)]">Edit</Link>
                    <button type="submit" name="action" value="delete" className="rounded bg-rose-600 px-2 py-1.5 text-xs font-semibold text-white">Delete</button>
                  </div>
                </form>
              )) : (
                <p className="rounded border border-dashed border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-3 text-xs text-[var(--ni-text)]">No published stories yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--ni-text-strong)]">Broadcast Notification</h2>
          <form action="/api/admin/notifications/broadcast" method="post" className="mt-3 space-y-2">
            <select name="audience" className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)]">
              <option value="all">All accounts</option>
              <option value="b2c">B2C users only</option>
              <option value="business_all">All business accounts</option>
              <option value="verified_business">Verified business accounts</option>
              <option value="pro_all">All pro accounts</option>
              <option value="verified_pro">Verified pro accounts</option>
            </select>
            <input name="title" required className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Notification title" />
            <textarea name="body" required className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" rows={3} placeholder="Notification message" />
            <input name="href" className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Link target (optional), e.g. /trending" />
            <button type="submit" className="rounded bg-[var(--ni-brand)] px-3 py-1.5 text-sm font-semibold text-[var(--ni-surface-1)]">Send Broadcast</button>
          </form>
          <p className="mt-2 text-xs text-[var(--ni-text)]">Total notifications stored: {notificationCount}</p>
        </div>

        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--ni-text-strong)]">Community Signals</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between text-[var(--ni-text)]"><span>Total Follows</span><strong className="text-[var(--ni-text-strong)]">{followsCount}</strong></li>
            <li className="flex justify-between text-[var(--ni-text)]"><span>Unread Verification Cases</span><strong className="text-[var(--ni-text-strong)]">{pendingRequests}</strong></li>
            <li className="flex justify-between text-[var(--ni-text)]"><span>Total User Accounts</span><strong className="text-[var(--ni-text-strong)]">{users.length}</strong></li>
            <li className="flex justify-between text-[var(--ni-text)]"><span>Trend Keywords Tracked</span><strong className="text-[var(--ni-text-strong)]">{trends.length}</strong></li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--ni-text-strong)]">Trend Management</h2>
          <span className="text-xs text-[var(--ni-text)]">Create, adjust, or remove trend telemetry</span>
        </div>

        <form action="/api/admin/trends" method="post" className="mt-3 grid gap-2 md:grid-cols-4">
          <input name="keyword" required className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="#YourTag" />
          <input name="engagementPercent" required type="number" step="0.1" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Engagement %" />
          <input name="views" required type="number" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Views" />
          <div className="flex gap-2">
            <input name="growthPercent" required type="number" step="0.1" className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Growth %" />
            <button type="submit" className="rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">Save</button>
          </div>
        </form>

        <div className="mt-4 space-y-2">
          {trends.map((trend) => (
            <form key={trend.id} action={`/api/admin/trends/${trend.id}`} method="post" className="grid items-center gap-2 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto_auto]">
              <p className="font-semibold text-[var(--ni-text-strong)]">{trend.keyword}</p>
              <input name="engagementPercent" defaultValue={trend.engagementPercent} type="number" step="0.1" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-1.5 text-sm text-[var(--ni-text-strong)]" />
              <input name="views" defaultValue={trend.views} type="number" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-1.5 text-sm text-[var(--ni-text-strong)]" />
              <input name="growthPercent" defaultValue={trend.growthPercent} type="number" step="0.1" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-1.5 text-sm text-[var(--ni-text-strong)]" />
              <button type="submit" className="rounded bg-[var(--ni-brand)] px-2 py-1.5 text-xs font-semibold text-[var(--ni-surface-1)]">Update</button>
              <button type="submit" name="action" value="delete" className="rounded bg-rose-600 px-2 py-1.5 text-xs font-semibold text-white">Delete</button>
            </form>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--ni-text-strong)]">Business Verification Queue</h2>
        <div className="mt-3 space-y-3">
          {requests.map((request) => (
            <article key={request.id} className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-4">
              <p className="font-medium text-[var(--ni-text-strong)]">{request.businessName} ({request.user.email})</p>
              <p className="text-sm text-[var(--ni-text)]">Document: {request.documentType} · Type: {request.verificationType} · Status: <strong className="text-[var(--ni-text-strong)]">{request.status}</strong></p>
              <a className="text-sm text-[var(--ni-brand)] underline" href={`/api/business/documents/${request.id}`}>View uploaded document</a>
              {request.portfolioUrl ? <p className="text-xs text-[var(--ni-text)]">Portfolio: <a className="text-[var(--ni-brand)] underline" href={request.portfolioUrl}>{request.portfolioUrl}</a></p> : null}
              {request.status === "pending" ? (
                <div className="mt-3 flex gap-2">
                  <form action={`/api/admin/verification/${request.id}`} method="post" className="flex items-center gap-2">
                    <input type="hidden" name="decision" value="approved" />
                    <select name="membershipCycle" defaultValue="annual" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1 text-sm text-[var(--ni-text-strong)]">
                      <option value="monthly">monthly</option>
                      <option value="annual">annual</option>
                    </select>
                    <button className="rounded bg-emerald-600 px-3 py-1 text-sm text-white" type="submit">Approve</button>
                  </form>
                  <form action={`/api/admin/verification/${request.id}`} method="post" className="flex gap-2">
                    <input type="hidden" name="decision" value="rejected" />
                    <input type="text" name="rejectionNote" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Reason (optional)" />
                    <button className="rounded bg-rose-600 px-3 py-1 text-sm text-white" type="submit">Reject</button>
                  </form>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--ni-text-strong)]">User & Role Management</h2>
        <div className="mt-3 space-y-2">
          {users.map((account) => (
            <form key={account.id} action={`/api/admin/users/${account.id}`} method="post" className="grid items-center gap-2 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3 md:grid-cols-[1.1fr_1fr_1fr_1fr_1fr_auto]">
              <div>
                <p className="font-medium text-[var(--ni-text-strong)]">{account.name}</p>
                <p className="text-xs text-[var(--ni-text)]">{account.email}</p>
              </div>
              <select name="role" defaultValue={account.role} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 text-sm text-[var(--ni-text-strong)]">
                <option value="user">user</option>
                <option value="business_pending">business_pending</option>
                <option value="business_verified">business_verified</option>
                <option value="marketing_pending">marketing_pending</option>
                <option value="marketing_verified">marketing_verified</option>
                <option value="admin">admin</option>
              </select>
              <input name="businessName" defaultValue={account.businessName ?? ""} placeholder="Business or agency name" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" />
              <select name="membershipCycle" defaultValue={account.membershipCycle ?? ""} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 text-sm text-[var(--ni-text-strong)]">
                <option value="">membership cycle</option>
                <option value="monthly">monthly</option>
                <option value="annual">annual</option>
              </select>
              <input name="membershipEndsAt" type="date" defaultValue={account.membershipEndsAt ? new Date(account.membershipEndsAt).toISOString().slice(0, 10) : ""} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 text-sm text-[var(--ni-text-strong)]" />
              <select name="membershipStatus" defaultValue={account.membershipStatus ?? "trial"} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 text-sm text-[var(--ni-text-strong)]">
                <option value="trial">trial</option>
                <option value="active">active</option>
                <option value="past_due">past_due</option>
                <option value="suspended">suspended</option>
              </select>
              <button type="submit" className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white">Update</button>
            </form>
          ))}
        </div>
      </div>
    </section>
  );
}

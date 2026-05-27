import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getBusinesses } from "@/lib/businesses";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default async function BusinessInboxPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== Role.business_pending && user.role !== Role.business_verified && user.role !== Role.marketing_pending && user.role !== Role.marketing_verified) {
    redirect("/feed");
  }

  const businesses = await getBusinesses();
  const businessMatch = user.businessName
    ? businesses.find((business) => business.name === user.businessName || business.slug === user.businessName)
    : undefined;
  const businessSlug = businessMatch?.slug ?? (user.businessName ? slugify(user.businessName) : null);
  const publicSlug = businessMatch?.slug ?? null;

  const messages = businessSlug
    ? await prisma.businessMessage.findMany({
        where: { businessSlug },
        orderBy: { createdAt: "desc" },
        take: 80,
      })
    : [];

  const dayAgo = new Date();
  dayAgo.setDate(dayAgo.getDate() - 1);
  const recentCount = messages.filter((message) => message.createdAt >= dayAgo).length;
  const uniqueSenders = new Set(messages.map((message) => message.senderUserId ?? message.senderName)).size;
  const intentCounts = messages.reduce<Record<string, number>>((acc, message) => {
    acc[message.actionOption] = (acc[message.actionOption] ?? 0) + 1;
    return acc;
  }, {});
  const topIntent = Object.entries(intentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Inquiries";

  return (
    <section className="mx-auto w-full max-w-5xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">B2B INBOX</p>
        <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ni-text-strong)]">Business Inquiries</h1>
        <p className="mt-2 text-sm text-[color:var(--ni-text)]">
          Track inbound requests, buyer notes, and collaboration opportunities coming from the Negosyante Island network.
        </p>
      </div>

      {user.role === Role.business_pending || user.role === Role.marketing_pending ? (
        <div className="rounded-xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-900">
          Complete verification to unlock full B2B privileges and faster response tools.
          <Link href="/business/pending" className="ml-3 inline-flex rounded border border-amber-500 px-2 py-1 text-xs font-semibold">
            Complete Verification
          </Link>
        </div>
      ) : null}

      {!businessSlug ? (
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4 text-sm text-[color:var(--ni-text)]">
          Add your business name in account settings to start receiving inquiries.
          <Link href="/business/account/edit" className="ml-3 inline-flex rounded border border-[color:var(--ni-border)] px-2 py-1 text-xs font-semibold text-[color:var(--ni-text-strong)]">
            Update Profile
          </Link>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <p className="text-xs text-[color:var(--ni-muted)]">Total leads</p>
          <p className="text-2xl font-semibold text-[color:var(--ni-text-strong)]">{messages.length}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <p className="text-xs text-[color:var(--ni-muted)]">New (24h)</p>
          <p className="text-2xl font-semibold text-[color:var(--ni-text-strong)]">{recentCount}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <p className="text-xs text-[color:var(--ni-muted)]">Top intent</p>
          <p className="text-lg font-semibold text-[color:var(--ni-text-strong)]">{topIntent}</p>
          <p className="text-xs text-[color:var(--ni-muted)]">{uniqueSenders} unique senders</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Latest Requests</h2>
          {publicSlug ? (
            <Link href={`/business/${publicSlug}`} className="rounded border border-[color:var(--ni-border)] px-2 py-1 text-xs font-semibold text-[color:var(--ni-text-strong)]">
              View Public Profile
            </Link>
          ) : null}
        </div>

        <div className="mt-3 space-y-3">
          {messages.length ? (
            messages.map((message) => (
              <article key={message.id} className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--ni-text-strong)]">
                      {message.senderName} • {message.actionOption}
                    </p>
                    <p className="text-xs text-[color:var(--ni-muted)]">
                      {new Date(message.createdAt).toLocaleString()} • age {message.senderAge}
                    </p>
                  </div>
                  <span className="rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--ni-text)]">
                    {message.senderUserId ? "Verified user" : "Guest lead"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--ni-text)]">{message.note}</p>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4 text-sm text-[color:var(--ni-muted)]">
              No inquiries yet. Share your profile link and keep your insight feed active to attract leads.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

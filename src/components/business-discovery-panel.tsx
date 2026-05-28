"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import RoleBadge from "@/components/role-badge";
import { OnlineStatusBadge } from "@/components/online-status-badge";
import type { LocalBusiness } from "@/lib/businesses";

type BusinessDiscoveryPanelProps = {
  businesses: LocalBusiness[];
  viewerRole?: string;
  compact?: boolean;
};
export default function BusinessDiscoveryPanel({ businesses, compact = false }: BusinessDiscoveryPanelProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  const categories = useMemo(() => {
    const unique = new Set(businesses.map((business) => business.category));
    return ["all", ...Array.from(unique)];
  }, [businesses]);

  const filtered = businesses.filter((business) => {
    const matchesSearch = `${business.name} ${business.category} ${business.location}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || business.category === category;
    const matchesVerified =
      verifiedFilter === "all" ? true : verifiedFilter === "verified" ? Boolean(business.verified) : !business.verified;
    return matchesSearch && matchesCategory && matchesVerified;
  });

  const shown = compact ? filtered.slice(0, 4) : filtered;

  return (
    <section className={`rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm ${compact ? "p-4" : "p-5"}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">BUSINESS DISCOVERY</p>
          <h2 className={`${compact ? "mt-1 text-lg" : "mt-2 text-2xl"} font-semibold text-[color:var(--ni-text-strong)]`}>Find partners to collaborate with</h2>
          {!compact ? <p className="mt-1 text-sm text-[color:var(--ni-text)]">Search verified and emerging businesses. Messaging stays inside Negosyante Island.</p> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-[2fr_1fr]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search businesses, categories, or cities"
          className="w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text-strong)]"
        />
        <div className="flex gap-2">
          <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text-strong)]"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All categories" : item}
            </option>
          ))}
        </select>
          <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)} className="w-48 rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text-strong)]">
            <option value="all">All businesses</option>
            <option value="verified">Verified only</option>
            <option value="unverified">Unverified only</option>
          </select>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {shown.map((business) => (
          <div
            key={business.slug}
            className={`relative overflow-hidden rounded-xl border border-[color:var(--ni-border)] p-4 ${business.backgroundPhotoUrl ? "business-photo-card" : "bg-[color:var(--ni-surface-2)]"}`}
            style={business.backgroundPhotoUrl ? { backgroundImage: `url(${business.backgroundPhotoUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <p className={business.backgroundPhotoUrl ? "text-sm font-semibold text-white" : "text-sm font-semibold text-[color:var(--ni-text-strong)]"}>{business.name}</p>
                  <p className={business.backgroundPhotoUrl ? "mt-1 text-xs text-white/85" : "mt-1 text-xs text-[color:var(--ni-text)]"}>{business.category} • {business.location}</p>
                  <p className={business.backgroundPhotoUrl ? "mt-1 text-xs text-white/75" : "mt-1 text-xs text-[color:var(--ni-muted)]"}>{business.tagline}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <RoleBadge role={business.verified ? "business_verified" : "business_pending"} />
                    <OnlineStatusBadge online={business.online} compact />
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/business/${business.slug}`}
                  className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  View profile
                </Link>
                <Link
                  href={`/business/${business.slug}/feed`}
                  className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]"
                >
                  View feed
                </Link>
              </div>
          </div>
          ))}
          {compact && filtered.length > shown.length ? (
            <div className="pt-1 text-center">
              <Link href="/b2bm" className="text-sm font-semibold text-[color:var(--ni-brand)]">View all businesses</Link>
            </div>
          ) : null}
      </div>
    </section>
  );
}

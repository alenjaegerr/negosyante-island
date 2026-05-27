"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { buildBusinessMessageHref } from "@/lib/messaging";
import { OnlineStatusBadge } from "@/components/online-status-badge";
import RoleBadge from "@/components/role-badge";
import type { LocalBusiness } from "@/lib/local-businesses";

type LocalBusinessesPanelProps = {
  businesses: LocalBusiness[];
};

export function LocalBusinessesPanel({ businesses }: LocalBusinessesPanelProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");

  const filtered = useMemo(() => {
    return businesses.filter((business) => {
      const matchesQuery =
        query.trim().length === 0 ||
        business.name.toLowerCase().includes(query.toLowerCase()) ||
        business.category.toLowerCase().includes(query.toLowerCase()) ||
        business.location.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "online" && business.online) ||
        (statusFilter === "offline" && !business.online);

      return matchesQuery && matchesStatus;
    });
  }, [businesses, query, statusFilter]);

  return (
    <aside className="mt-4 rounded border-2 border-cyan-500/60 bg-[var(--ni-surface-1)]/95 p-2.5 md:mt-0 md:min-h-[720px] md:p-3">
      <h3 className="font-reddit text-sm font-extrabold uppercase tracking-figma-tight text-[var(--ni-text-strong)] md:text-base">
        Local Businesses and Marketing Experts on Negosyante Island
      </h3>
      <p className="mt-1 text-xs tracking-[0.08em] text-[var(--ni-text)]">Tap any card to open profile or send a message.</p>

      <div className="mt-3 space-y-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search business, category, location"
          className="w-full rounded border border-cyan-500/40 bg-[var(--ni-surface-2)] px-2 py-1.5 text-xs text-[var(--ni-text-strong)] outline-none ring-cyan-500/40 placeholder:text-[var(--ni-muted)] focus:ring"
        />
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded border px-2 py-1 text-[11px] font-semibold ${statusFilter === "all" ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-700/40 bg-[var(--ni-surface-2)] text-[var(--ni-brand)]"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("online")}
            className={`rounded border px-2 py-1 text-[11px] font-semibold ${statusFilter === "online" ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-700/40 bg-[var(--ni-surface-2)] text-[var(--ni-brand)]"}`}
          >
            Online
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("offline")}
            className={`rounded border px-2 py-1 text-[11px] font-semibold ${statusFilter === "offline" ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-700/40 bg-[var(--ni-surface-2)] text-[var(--ni-brand)]"}`}
          >
            Offline
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        {filtered.map((business) => (
          <article
            key={business.slug}
            className={`relative overflow-hidden rounded border border-cyan-700/40 p-2.5 shadow-sm ${business.backgroundPhotoUrl ? "business-photo-card" : "bg-[var(--ni-surface-2)]"}`}
            style={business.backgroundPhotoUrl ? { backgroundImage: `url(${business.backgroundPhotoUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            <Link href={`/business/${business.slug}`} className="group block">
              <div className="relative z-20 rounded-md p-2">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    {business.avatarUrl ? (
                      <Image src={business.avatarUrl} alt={`${business.name} avatar`} width={44} height={44} className="h-11 w-11 rounded-full border-2 border-cyan-700 object-cover" />
                    ) : (
                      <div className="font-reddit flex h-11 w-11 items-center justify-center rounded-full border-2 border-cyan-700 bg-cyan-100 text-sm font-extrabold text-cyan-900">
                        {business.initials}
                      </div>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[var(--ni-surface-1)] ${business.online ? "bg-emerald-500" : "bg-zinc-500"}`} aria-hidden />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`font-flex-bold truncate text-sm group-hover:text-[var(--ni-brand)] ${business.backgroundPhotoUrl ? "text-white" : "text-[var(--ni-text-strong)]"}`}>{business.name}</p>
                        <p className={`text-xs ${business.backgroundPhotoUrl ? "text-white/85" : "text-[var(--ni-muted)]"}`}>{business.category} • {business.location}</p>
                      </div>
                      {business.role ? (
                        <div className="shrink-0 pt-0.5">
                          <RoleBadge role={business.role} />
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-1">
                      <OnlineStatusBadge online={business.online} compact />
                    </div>
                  </div>
                </div>

                <p className={`mt-1.5 text-xs ${business.backgroundPhotoUrl ? "text-white/90" : "text-[var(--ni-text)]"}`}>{business.tagline}</p>
              </div>
            </Link>

            <div className="relative z-20 mt-2.5 flex items-center justify-between gap-2">
              <Link
                href={`/business/${business.slug}`}
                className={`local-business-view-profile rounded border px-2 py-1 text-xs font-semibold transition-colors ${business.backgroundPhotoUrl ? "border-white/25 bg-white/10 text-white hover:border-white/40" : ""}`}
              >
                View profile
              </Link>
              <Link
                href={buildBusinessMessageHref(business.slug)}
                className="rounded bg-cyan-700 px-2 py-1 text-xs font-semibold text-white hover:bg-cyan-800"
              >
                Send message
              </Link>
            </div>
          </article>
        ))}

        {filtered.length === 0 ? (
          <p className="rounded border border-dashed border-cyan-700/40 bg-[var(--ni-surface-2)] p-3 text-xs text-[var(--ni-text)]">
            No businesses match your search yet.
          </p>
        ) : null}
      </div>
    </aside>
  );
}

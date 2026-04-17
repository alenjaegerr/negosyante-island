"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
    <aside className="mt-6 rounded border-2 border-cyan-500/70 bg-cyan-50/35 p-3 md:mt-0 md:min-h-[720px]">
      <h3 className="font-reddit text-sm font-extrabold tracking-figma-tight text-black md:text-base">
        LOCAL BUSINESSES ON NEGOSYANTE ISLAND
      </h3>
      <p className="mt-1 text-xs text-slate-700">Tap any card to open profile, or jump straight to feed.</p>

      <div className="mt-3 space-y-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search business, category, location"
          className="w-full rounded border border-cyan-700/30 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none ring-cyan-500/40 placeholder:text-slate-500 focus:ring"
        />
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded border px-2 py-1 text-[11px] font-semibold ${statusFilter === "all" ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-700/40 bg-white text-cyan-900"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("online")}
            className={`rounded border px-2 py-1 text-[11px] font-semibold ${statusFilter === "online" ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-700/40 bg-white text-cyan-900"}`}
          >
            Online
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("offline")}
            className={`rounded border px-2 py-1 text-[11px] font-semibold ${statusFilter === "offline" ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-700/40 bg-white text-cyan-900"}`}
          >
            Offline
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {filtered.map((business) => (
          <article key={business.slug} className="rounded border border-cyan-700/40 bg-white p-3 shadow-sm">
            <Link href={`/business/${business.slug}`} className="group block">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="font-reddit flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-700 bg-cyan-100 text-sm font-extrabold text-cyan-900">
                    {business.initials}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-white ${business.online ? "bg-emerald-500" : "bg-zinc-400"}`}
                    aria-hidden
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-flex-bold truncate text-sm text-slate-900 group-hover:text-cyan-700">{business.name}</p>
                    {business.verified ? <span className="text-xs" title="Verified business">✅</span> : null}
                  </div>
                  <p className="text-xs text-slate-600">{business.category} • {business.location}</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-700">{business.online ? "Online now" : "Offline"}</p>
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-700">{business.tagline}</p>
            </Link>

            <div className="mt-3 flex items-center justify-between gap-2">
              <Link
                href={`/business/${business.slug}`}
                className="rounded border border-cyan-700 px-2 py-1 text-xs font-semibold text-cyan-800 hover:bg-cyan-50"
              >
                View Profile
              </Link>
              <Link
                href={`/business/${business.slug}/feed`}
                className="rounded bg-cyan-700 px-2 py-1 text-xs font-semibold text-white hover:bg-cyan-800"
              >
                View Feed
              </Link>
            </div>
          </article>
        ))}

        {filtered.length === 0 ? (
          <p className="rounded border border-dashed border-cyan-700/40 bg-white p-3 text-xs text-slate-600">
            No businesses match your search yet.
          </p>
        ) : null}
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buildBusinessMessageHref, buildMessagingShellHref } from "@/lib/messaging";
import { UserAvatar } from "@/components/user-avatar";
import { OnlineStatusBadge } from "@/components/online-status-badge";
import RoleBadge from "@/components/role-badge";

type DiscoveryProfile = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  backgroundPhotoUrl?: string | null;
  role: string;
  businessName?: string | null;
  businessTagline?: string | null;
  businessCategory?: string | null;
  businessLocation?: string | null;
  businessSlug?: string | null;
  isFollowed?: boolean;
  isContact?: boolean;
  online?: boolean;
};

type Props = {
  viewerRole?: string | null;
  profiles: DiscoveryProfile[];
};

function roleLabel(role: string) {
  if (role === "user") return "Aspiring Negosyante";
  if (role === "marketing_verified") return "Verified Marketing Expert ✅";
  if (role === "marketing_pending") return "Unverified Marketing Expert";
  if (role === "marketing") return "Marketing expert";
  if (role === "business_verified") return "Verified Business ✅";
  if (role === "business_pending") return "Unverified Business";
  if (role.startsWith("business")) return "Business";
  if (role === "publisher_verified") return "Cultured Author ✅";
  if (role === "publisher") return "Cultured Author";
  if (role === "admin") return "Member";
  return role;
}

function roleGroup(role: string) {
  if (role === "user") return "users";
  if (role === "admin") return "users";
  if (role.startsWith("marketing")) return "marketing";
  if (role.startsWith("publisher")) return "other";
  return "businesses";
}

export default function B2bmDiscoveryPanel({ viewerRole, profiles }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "businesses" | "marketing" | "users">("all");
  const [businessCategory, setBusinessCategory] = useState<string>("all");

  const businessCategories = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => {
      if (p.businessCategory) set.add(p.businessCategory);
    });
    return ["all", ...Array.from(set).sort()];
  }, [profiles]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      if (profile.role === "admin") return false;
      const haystack = [profile.name, profile.businessName, profile.businessCategory, profile.businessLocation, profile.businessTagline, profile.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      let matchesFilter = filter === "all" || roleGroup(profile.role) === filter;
      if (filter === "businesses" && businessCategory && businessCategory !== "all") {
        matchesFilter = matchesFilter && (profile.businessCategory === businessCategory);
      }
      return matchesQuery && matchesFilter;
    });
  }, [profiles, search, filter, businessCategory]);

  return (
    <section className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">B2BM DISCOVERY</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ni-text-strong)]">Find profiles to connect with</h2>
          <p className="mt-1 text-sm text-[color:var(--ni-text)]">Search businesses, marketing experts, and Aspiring Negosyantes.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-[2fr_1fr]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search people, businesses, or cities"
          className="w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text-strong)]"
        />
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
            className="w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text-strong)]"
          >
            <option value="all">All profiles</option>
            <option value="businesses">Businesses</option>
            <option value="marketing">Marketing experts</option>
            <option value="users">Normal users</option>
          </select>
          {filter === "businesses" ? (
            <select
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              className="w-48 rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text-strong)]"
            >
              {businessCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All categories" : cat}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {filtered.map((profile) => {
          const displayName = profile.businessName?.trim() || profile.name;
          const isBusiness = profile.role.startsWith("business") || profile.role.startsWith("marketing");
          const profileHref = isBusiness && profile.businessSlug ? `/business/${profile.businessSlug}` : `/profile/${profile.id}`;
          const messageHref = isBusiness && profile.businessSlug ? buildBusinessMessageHref(profile.businessSlug) : buildMessagingShellHref({ targetUserId: profile.id });

          return (
            <article
              key={profile.id}
              className={`relative overflow-hidden rounded-xl border border-[color:var(--ni-border)] p-4 ${profile.backgroundPhotoUrl ? "b2bm-photo-card" : "bg-[color:var(--ni-surface-2)]"}`}
              style={profile.backgroundPhotoUrl ? { backgroundImage: `url(${profile.backgroundPhotoUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              {profile.backgroundPhotoUrl ? <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.78))]" aria-hidden /> : null}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <UserAvatar name={displayName} avatarUrl={profile.avatarUrl} size={52} />
                  <div>
                    <p className={profile.backgroundPhotoUrl ? "text-sm font-semibold leading-none text-white" : "text-sm font-semibold leading-none text-[color:var(--ni-text-strong)]"}>{displayName}</p>
                    <div className="mt-0 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <RoleBadge role={profile.role} compact />
                      </div>
                      <OnlineStatusBadge online={Boolean(profile.online)} compact />
                    </div>
                    <p className={profile.backgroundPhotoUrl ? "mt-1 text-xs text-white/70" : "mt-1 text-xs text-[color:var(--ni-muted)]"}>{profile.businessCategory ?? "Community member"} • {profile.businessLocation ?? "Philippines"}</p>
                    {profile.businessTagline ? <p className={profile.backgroundPhotoUrl ? "mt-2 text-xs text-white/80" : "mt-2 text-xs text-[color:var(--ni-muted)]"}>{profile.businessTagline}</p> : null}
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-3 flex flex-wrap gap-2">
                <Link href={profileHref} className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-xs font-semibold text-white">
                  View profile
                </Link>
                <Link href={messageHref} className={`rounded px-3 py-1.5 text-xs font-semibold ${profile.backgroundPhotoUrl ? "border border-white/25 bg-white/10 text-white" : "border border-[color:var(--ni-border)] text-[color:var(--ni-text-strong)]"}`}>
                  Send message
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import { buildBusinessMessageHref, buildMessagingShellHref } from "@/lib/messaging";
import { OnlineStatusBadge } from "@/components/online-status-badge";
import RoleBadge from "@/components/role-badge";

type DirectoryProfile = {
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

type DirectoryContact = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  profileHref?: string | null;
  profileType: string;
  businessSlug?: string | null;
  businessCategory?: string | null;
  businessLocation?: string | null;
  businessTagline?: string | null;
  role?: string | null;
  online?: boolean;
};

type Props = {
  viewerRole: string;
  viewerName: string;
  profiles: DirectoryProfile[];
  contacts: DirectoryContact[];
};

function roleLabel(role: string) {
  if (role === "user") return "Aspiring Negosyante";
  if (role === "marketing_verified") return "Verified Marketing Expert ✅";
  if (role === "marketing_pending") return "Unverified Marketing Expert";
  if (role.startsWith("marketing")) return "Marketing expert";
  if (role === "business_verified") return "Verified Business ✅";
  if (role === "business_pending") return "Unverified Business";
  if (role.startsWith("business")) return "Business";
  if (role === "publisher_verified") return "Cultured Author ✅";
  if (role === "publisher") return "Cultured Author";
  if (role === "admin") return "Member";
  return role;
}

export default function B2bmDirectory({ viewerRole, viewerName, profiles, contacts }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "contacts" | "followed" | "users" | "marketing" | "businesses">("all");
  const [businessCategory, setBusinessCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string>(profiles[0]?.id ?? "");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const businessCategories = useMemo(() => {
    const categories = new Set<string>();
    profiles.forEach((profile) => {
      if (profile.role === "admin") return;
      if (profile.businessCategory) categories.add(profile.businessCategory);
    });
    return ["all", ...Array.from(categories).sort()];
  }, [profiles]);

  const selectedProfile = useMemo(() => profiles.find((profile) => profile.id === selectedId) ?? profiles[0] ?? null, [profiles, selectedId]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      if (profile.role === "admin") return false;
      const haystack = [profile.name, profile.businessName, profile.businessCategory, profile.businessLocation, profile.businessTagline, profile.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "contacts"
            ? Boolean(profile.isContact)
            : filter === "followed"
              ? Boolean(profile.isFollowed)
              : filter === "users"
                ? profile.role === "user"
                : filter === "marketing"
                  ? profile.role.startsWith("marketing")
                  : profile.role.startsWith("business");
      const matchesBusinessCategory =
        filter === "businesses" && businessCategory !== "all"
          ? profile.businessCategory === businessCategory
          : true;

      return matchesQuery && matchesFilter && matchesBusinessCategory;
    });
  }, [profiles, search, filter, businessCategory]);

  const relevantProfiles = useMemo(() => {
    if (search.trim()) return filteredProfiles;
    const priority = filteredProfiles.filter((profile) => profile.isContact || profile.isFollowed);
    if (priority.length) return priority;
    return filteredProfiles.slice(0, 8);
  }, [filteredProfiles, search]);

  function sendMessage(profile: DirectoryProfile) {
    setSendingId(profile.id);
    if (profile.role.startsWith("business")) {
      router.push(buildBusinessMessageHref(profile.businessSlug ?? "alvin-s-coffee-shop"));
      return;
    }

    router.push(buildMessagingShellHref({ targetUserId: profile.id }));
  }

  return (
    <section className="mx-auto w-full max-w-screen-2xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[linear-gradient(135deg,rgba(2,132,199,0.12),rgba(20,184,166,0.10),rgba(255,255,255,0.55))] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--ni-muted)]">B2BM Interaction</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Business and Expert Discovery</h1>
        <p className="mt-2 max-w-3xl text-sm text-[color:var(--ni-text)]">
          Search businesses, marketing experts, and people you already follow or contacted, then message them and keep them in your personal contacts list.
        </p>
        <p className="mt-2 text-xs text-[color:var(--ni-muted)]">Logged in as {viewerName} • {viewerRole}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users, businesses, marketing experts"
            className="w-full rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text-strong)] placeholder:text-[color:var(--ni-muted)]"
          />

          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {[
              ["all", "All"],
              ["contacts", "Contacts"],
              ["followed", "Followed"],
              ["users", "Normal users"],
              ["marketing", "Marketing experts"],
              ["businesses", "Businesses"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value as typeof filter)}
                className={`rounded-full px-3 py-1.5 ${filter === value ? "bg-[color:var(--ni-brand-cta)] text-white" : "border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] text-[color:var(--ni-text-strong)]"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {filter === "businesses" ? (
            <select
              value={businessCategory}
              onChange={(event) => setBusinessCategory(event.target.value)}
              className="w-full rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text-strong)]"
            >
              {businessCategories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All business categories" : category}
                </option>
              ))}
            </select>
          ) : null}

          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Contacts</h2>
              <span className="rounded-full border border-[color:var(--ni-border)] px-2 py-0.5 text-[11px] text-[color:var(--ni-muted)]">{contacts.length}</span>
            </div>

            <div className="mt-3 space-y-2">
              {contacts.length ? (
                contacts.map((contact) => (
                  <Link key={contact.id} href={contact.profileHref ?? "/b2bm"} className="flex items-start gap-3 rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-2">
                    <UserAvatar name={contact.displayName} avatarUrl={contact.avatarUrl} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-[color:var(--ni-text-strong)]">{contact.displayName}</p>
                        <OnlineStatusBadge online={Boolean(contact.online)} compact />
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <RoleBadge role={contact.role ?? contact.profileType} />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3 text-sm text-[color:var(--ni-muted)]">
                  No contacts yet. Send a message to start your list.
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="space-y-4 rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Saved profiles</h2>
              <p className="text-sm text-[color:var(--ni-text)]">Shortlist, open, or message the people you already know.</p>
            </div>
            <Link href={buildMessagingShellHref()} className="rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
              Open messages
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {relevantProfiles.map((profile) => (
              <article
                key={profile.id}
                className={`relative overflow-hidden rounded-2xl border p-4 transition ${selectedId === profile.id ? "border-[color:var(--ni-brand-cta)] bg-[color:var(--ni-accent-soft)]/40" : "border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)]"} ${profile.backgroundPhotoUrl ? "b2bm-photo-card" : ""}`}
                style={profile.backgroundPhotoUrl ? { backgroundImage: `url(${profile.backgroundPhotoUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(profile.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(profile.id);
                  }
                }}
              >
                {profile.backgroundPhotoUrl ? <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.78))]" aria-hidden /> : null}
                <div className="relative z-10 flex items-start gap-3">
                  <UserAvatar name={profile.businessName?.trim() || profile.name} avatarUrl={profile.avatarUrl} size={52} />
                  <div className="min-w-0 flex-1">
                    <p className={profile.backgroundPhotoUrl ? "truncate text-sm font-semibold leading-none text-white" : "truncate text-sm font-semibold leading-none text-[color:var(--ni-text-strong)]"}>{profile.businessName?.trim() || profile.name}</p>
                    <div className="mt-0 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <RoleBadge role={profile.role} compact />
                      </div>
                      <OnlineStatusBadge online={Boolean(profile.online)} compact />
                    </div>
                    <p className={profile.backgroundPhotoUrl ? "mt-1 text-xs text-white/80" : "mt-1 text-xs text-[color:var(--ni-text)]"}>{profile.businessCategory ?? "Personal account"} • {profile.businessLocation ?? "Philippines"}</p>
                    {profile.businessTagline ? <p className={profile.backgroundPhotoUrl ? "mt-1 line-clamp-2 text-xs text-white/80" : "mt-1 line-clamp-2 text-xs text-[color:var(--ni-text)]"}>{profile.businessTagline}</p> : null}
                  </div>
                </div>

                <div className="relative z-10 mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <Link href={`/profile/${profile.id}`} className="rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-3 py-1.5 text-[color:var(--ni-text-strong)]">
                    View profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => sendMessage(profile)}
                    disabled={sendingId === profile.id}
                    className={profile.backgroundPhotoUrl ? "rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-white" : "rounded-full bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-white"}
                  >
                    {sendingId === profile.id ? "Opening..." : "Send Message"}
                  </button>
                </div>

                <div className="relative z-10 mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">
                  {profile.isContact ? <span className={profile.backgroundPhotoUrl ? "rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-white" : "rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-2 py-0.5 text-[color:var(--ni-muted)]"}>Contact</span> : null}
                  {profile.isFollowed ? <span className={profile.backgroundPhotoUrl ? "rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-white" : "rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-2 py-0.5 text-[color:var(--ni-muted)]"}>Followed</span> : null}
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Selected profile</h3>
              {selectedProfile ? <span className="text-xs text-[color:var(--ni-muted)]">{roleLabel(selectedProfile.role)}</span> : null}
            </div>

            {selectedProfile ? (
              <div className="mt-3 flex flex-wrap items-start gap-4">
                <UserAvatar name={selectedProfile.businessName?.trim() || selectedProfile.name} avatarUrl={selectedProfile.avatarUrl} size={72} />
                <div className="min-w-0 flex-1">
                  <h4 className="text-2xl font-semibold text-[color:var(--ni-text-strong)]">{selectedProfile.businessName?.trim() || selectedProfile.name}</h4>
                  <p className="mt-1 text-sm text-[color:var(--ni-text)]">{selectedProfile.businessTagline ?? "Tap Send Message to start the conversation and save this profile to your contacts."}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/profile/${selectedProfile.id}`} className="rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-4 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)]">
                      Open profile page
                    </Link>
                    <button type="button" onClick={() => sendMessage(selectedProfile)} disabled={sendingId === selectedProfile.id} className="rounded-full bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                      {sendingId === selectedProfile.id ? "Opening..." : "Send Message"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </section>
  );
}

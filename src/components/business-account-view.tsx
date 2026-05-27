"use client";

import { useState } from "react";
import Link from "next/link";
import { OnlineStatusBadge } from "@/components/online-status-badge";
import { BusinessAvatar } from "@/components/business-avatar";
import { BusinessProfileActions } from "@/components/business-profile-actions";

type LocalBusiness = {
  slug: string;
  name: string;
  category: string;
  location: string;
  tagline: string;
  online: boolean;
  verified: boolean;
  followers: number;
  initials: string;
  contactOptions: string[];
  backgroundPhotoUrl?: string | null;
  avatarUrl?: string | null;
};

type Props = {
  business: LocalBusiness;
  currentUser: { role?: string | null; businessName?: string | null } | null;
};

type ViewerRole = "guest" | "user" | "business_pending" | "business_verified" | "marketing_pending" | "marketing_verified" | "admin";

export function BusinessAccountView({ business, currentUser }: Props) {
  const [viewAsUser, setViewAsUser] = useState(false);

  const isOwner = currentUser?.businessName === business.name || currentUser?.role === "admin";
  const viewerRole = viewAsUser ? "guest" : ((currentUser?.role as ViewerRole | undefined) ?? "guest");

  return (
    <section className="mx-auto w-full max-w-4xl px-0">
      <div
        className="relative overflow-hidden rounded-xl border border-cyan-600/60 bg-[color:var(--ni-surface-1)] shadow-sm min-h-[280px] md:min-h-[340px]"
      >
        {business.backgroundPhotoUrl ? (
          <img
            src={business.backgroundPhotoUrl}
            alt={`${business.name} background photo`}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.42)_38%,rgba(15,23,42,0.84))]" />

        <div className={business.backgroundPhotoUrl ? "relative z-10 flex min-h-[280px] flex-col justify-end p-5 md:min-h-[340px]" : "p-5"}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <BusinessAvatar slug={business.slug} initials={business.initials} online={business.online} canUpload={Boolean(isOwner && !viewAsUser)} avatarUrl={business.avatarUrl ?? null} />

            <div>
              <h1 className="font-flex-bold text-2xl text-white">{business.name}</h1>
              <p className="mt-1 text-sm text-white/85">{business.category} • {business.location}</p>
              <p className="mt-1 text-sm font-semibold text-white">{business.verified ? "Verified Business ✅" : "Unverified Business"}</p>
              <div className="mt-1">
                <OnlineStatusBadge online={business.online} />
              </div>
              <p className="mt-1 text-sm text-white/85">{business.followers.toLocaleString()} followers</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {!viewAsUser ? (
              <div className="flex gap-2">
                <button onClick={() => setViewAsUser(true)} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold">View as user</button>
                <Link href={`/business/${business.slug}/feed`} className="inline-flex rounded bg-cyan-700 px-4 py-2 text-sm font-semibold text-white">Open Feed</Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setViewAsUser(false)} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold">Exit view</button>
                <Link href="/business/account" className="inline-flex rounded bg-slate-100 px-3 py-1.5 text-sm font-semibold">Back to Account</Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 rounded border border-white/10 bg-[color:var(--ni-surface-2)]/90 p-3 backdrop-blur-sm">
          <h2 className="font-reddit text-xs font-extrabold tracking-figma-tight text-[color:var(--ni-text-strong)]">ABOUT</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">{business.tagline}</p>
        </div>

        <BusinessProfileActions
          slug={business.slug}
          baseFollowers={business.followers}
          viewerRole={viewerRole}
        />
        </div>
      </div>
    </section>
  );
}

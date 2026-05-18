"use client";

import { useState } from "react";
import Link from "next/link";
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
};

type Props = {
  business: LocalBusiness;
  currentUser: { role?: string | null; businessName?: string | null } | null;
};

export function BusinessAccountView({ business, currentUser }: Props) {
  const [viewAsUser, setViewAsUser] = useState(false);

  const isOwner = currentUser?.businessName === business.name || currentUser?.role === "admin";
  const viewerRole = viewAsUser ? "guest" : (currentUser?.role as any) ?? "guest";

  return (
    <section className="mx-auto w-full max-w-4xl px-0">
      <div className="rounded-xl border border-cyan-600/60 bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <BusinessAvatar slug={business.slug} initials={business.initials} online={business.online} canUpload={Boolean(isOwner && !viewAsUser)} />

            <div>
              <h1 className="font-flex-bold text-2xl text-[color:var(--ni-text-strong)]">{business.name}</h1>
              <p className="mt-1 text-sm text-[color:var(--ni-text)]">{business.category} • {business.location}</p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--ni-text-strong)]">{business.verified ? "Verified Business ✅" : "Unverified Business"}</p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--ni-text-strong)]">{business.online ? "Online now" : "Offline"}</p>
              <p className="mt-1 text-sm text-[color:var(--ni-text)]">{business.followers.toLocaleString()} followers</p>
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

        <div className="mt-5 rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3">
          <h2 className="font-reddit text-xs font-extrabold tracking-figma-tight text-[color:var(--ni-text-strong)]">ABOUT</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">{business.tagline}</p>
        </div>

        <BusinessProfileActions
          slug={business.slug}
          businessName={business.name}
          baseFollowers={business.followers}
          contactOptions={business.contactOptions}
          viewerRole={viewerRole}
        />
      </div>
    </section>
  );
}

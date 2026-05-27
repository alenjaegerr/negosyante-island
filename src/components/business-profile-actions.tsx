"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BusinessProfileActionsProps = {
  slug: string;
  baseFollowers: number;
  viewerRole: "guest" | "user" | "business_pending" | "business_verified" | "marketing_pending" | "marketing_verified" | "publisher" | "publisher_verified" | "admin";
};

export function BusinessProfileActions({
  slug,
  baseFollowers,
  viewerRole,
}: BusinessProfileActionsProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(baseFollowers);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadFollowState() {
      const response = await fetch(`/api/business/${slug}/follow`);
      if (!response.ok) return;
      const data = await response.json();
      if (ignore) return;
      setIsFollowing(Boolean(data.isFollowing));
      setFollowers(Number(data.followers ?? baseFollowers));
    }

    loadFollowState();
    return () => {
      ignore = true;
    };
  }, [slug, baseFollowers]);

  function toggleFollow() {
    if (viewerRole === "guest") {
      window.location.href = "/login";
      return;
    }

    setLoadingFollow(true);
    setError(null);

    fetch(`/api/business/${slug}/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isFollowing ? "unfollow" : "follow" }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to update follow status");
        }
        return response.json();
      })
      .then((data) => {
        setIsFollowing(Boolean(data.isFollowing));
        setFollowers(Number(data.followers ?? followers));
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Unable to update follow status");
      })
      .finally(() => {
        setLoadingFollow(false);
      });
  }

  const messageHref = `/business/message/${slug}`;
  const messageLinkHref = viewerRole === "guest" ? "/login" : messageHref;

  return (
    <div className="mt-5 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleFollow}
          disabled={loadingFollow}
          className={`rounded px-3 py-1.5 text-sm font-semibold ${isFollowing ? "bg-[color:var(--ni-text-strong)] text-white" : "border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] text-[color:var(--ni-text-strong)]"}`}
        >
          {loadingFollow ? "Updating..." : isFollowing ? "Following" : "Follow"}
        </button>

        <Link href={messageLinkHref} className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-sm font-semibold text-white">
          Open Messaging Platform
        </Link>

        <span className="text-sm text-[color:var(--ni-muted)]">{followers.toLocaleString()} followers</span>
      </div>

      <div className="rounded border border-amber-300/70 bg-amber-50 p-3 text-sm">
        <p className="font-semibold text-amber-900">
          Messaging for this profile opens in the dedicated platform.
        </p>
        <Link href={messageLinkHref} className="mt-2 inline-block rounded border border-amber-500 px-2 py-1 text-xs font-semibold text-amber-900">
          {viewerRole === "guest" ? "Log in to message" : "Open Messaging Platform"}
        </Link>
      </div>

      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}

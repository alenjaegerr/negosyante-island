"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface in server logs and browser console for now.
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ni-muted)]">Something went wrong</p>
      <h1 className="text-3xl font-semibold text-[var(--ni-text-strong)]">We hit a snag loading this view.</h1>
      <p className="max-w-xl text-sm text-[var(--ni-text)]">
        Try reloading this section. If the issue persists, head back to Trending and continue browsing.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-[var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <Link href="/trending" className="rounded-full border border-[var(--ni-border)] px-4 py-2 text-sm font-semibold text-[var(--ni-text-strong)]">
          Back to Trending
        </Link>
      </div>
    </div>
  );
}

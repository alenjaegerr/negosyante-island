import React from "react";
import Link from "next/link";
import { FaXmark } from "react-icons/fa6";
import { BrandLogo } from "@/components/brand-logo";
import { SignupForm } from "@/components/auth-forms";

export default function SignupPage() {
  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-screen-2xl overflow-hidden rounded-3xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
      <Link
        href="/trending"
        aria-label="Exit and go back to Trending"
        className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] text-[color:var(--ni-text-strong)] shadow-sm transition hover:bg-[color:var(--ni-surface-2)]"
      >
        <FaXmark className="h-4 w-4" aria-hidden="true" />
      </Link>

      <div className="relative flex items-center overflow-hidden bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.94))] p-6 sm:p-10 lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.24),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_40%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative max-w-2xl space-y-6 text-white">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            Join Negosyante Island
          </div>
          <div className="max-w-[18rem] sm:max-w-[24rem] md:max-w-[32rem] lg:max-w-none">
            <BrandLogo />
          </div>
          <h1 className="text-4xl font-semibold leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Create your account and unlock the island’s full business flow.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-cyan-50/85 sm:text-base">
            Guests can browse Trending and Island Forums. Signed-in users can post, react, follow, message, and use the business inbox.
          </p>

          <div className="rounded-[2rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
            <div className="flex flex-wrap gap-3 text-sm text-white/90">
              <span className="rounded-full border border-white/15 px-3 py-1">Trending open to all</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Forums open to all</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Business tools on signup</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">Home</p>
                <p className="mt-1 text-sm font-semibold text-white">Registered users get the home feed</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">Trending</p>
                <p className="mt-1 text-sm font-semibold text-white">Public star of the site</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-[color:var(--ni-surface-1)] p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2 text-center">
            <p className="text-sm text-[color:var(--ni-text)]">Already have an account?</p>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-4 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)] hover:bg-[color:var(--ni-surface-3)]"
            >
              Sign in
            </Link>
          </div>
          <React.Suspense fallback={<div />}>
            <SignupForm />
          </React.Suspense>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import Link from "next/link";
import { FaXmark } from "react-icons/fa6";
import { BrandLogo } from "@/components/brand-logo";
import { ForgotPasswordForm } from "@/components/auth-forms";

export default function ForgotPasswordPage() {
  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-screen-2xl overflow-hidden rounded-3xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] shadow-sm lg:grid-cols-[1fr_0.9fr]">
      <Link
        href="/login"
        aria-label="Back to login"
        className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] text-[color:var(--ni-text-strong)] shadow-sm transition hover:bg-[color:var(--ni-surface-2)]"
      >
        <FaXmark className="h-4 w-4" aria-hidden="true" />
      </Link>

      <div className="relative order-2 flex items-center overflow-hidden bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.95))] p-4 sm:p-8 lg:order-1 lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_38%)]" />
        <div className="relative max-w-2xl space-y-4 text-white sm:space-y-6">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100 sm:text-xs">
            Password recovery
          </div>
          <div className="max-w-[14rem] sm:max-w-[24rem] md:max-w-[32rem] lg:max-w-none">
            <BrandLogo />
          </div>
          <h1 className="text-2xl font-semibold leading-[1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Start password recovery with your email.
          </h1>
          <p className="max-w-xl text-[13px] leading-relaxed text-cyan-50/85 sm:text-base">
            The next page will let you request a reset code, then enter the code and choose a new password.
          </p>
        </div>
      </div>

      <div className="order-1 flex items-start justify-center bg-[color:var(--ni-surface-1)] p-4 sm:p-8 lg:order-2 lg:items-center lg:p-12">
        <div className="w-full max-w-md space-y-3 sm:space-y-4">
          <ForgotPasswordForm />
          <p className="text-center text-[13px] text-[color:var(--ni-text)] sm:text-sm">
            Need to verify first? <Link href="/verify-email" className="font-semibold text-[color:var(--ni-brand)]">Verify email here.</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

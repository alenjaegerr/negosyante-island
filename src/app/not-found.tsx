import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center px-3 py-8 sm:px-4">
      <div className="w-full overflow-hidden rounded-3xl border border-[color:var(--ni-border)] bg-[linear-gradient(135deg,rgba(2,132,199,0.12),rgba(14,165,233,0.08),rgba(255,255,255,0.68))] shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.28),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.12),transparent_42%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] p-8 sm:p-12 lg:p-16">
            <div className="max-w-md space-y-5 text-white">
              <p className="font-reddit text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-100/80">
                Page not found
              </p>
              <BrandLogo />
              <h1 className="text-4xl font-semibold leading-[0.95] tracking-tight sm:text-5xl">
                This island trail went cold.
              </h1>
              <p className="text-sm leading-relaxed text-cyan-50/80 sm:text-base">
                The page you tried to open does not exist or was moved. Trending is still live, and you can jump back there instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[color:var(--ni-surface-1)] p-8 sm:p-12 lg:p-16">
            <div className="w-full max-w-sm space-y-4 text-center">
              <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-6">
                <p className="text-7xl font-black leading-none text-[color:var(--ni-text-strong)]">404</p>
                <p className="mt-2 text-sm text-[color:var(--ni-text)]">
                  The page may have been removed, renamed, or never existed.
                </p>
              </div>

              <Link
                href="/trending"
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--ni-brand-cta)] px-4 py-3 text-sm font-semibold text-white"
              >
                Back to Trending Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

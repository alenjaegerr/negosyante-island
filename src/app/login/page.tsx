import Link from "next/link";
import { FaXmark } from "react-icons/fa6";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-screen-2xl overflow-hidden rounded-3xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] shadow-sm lg:grid-cols-[1.15fr_0.85fr]">
      <Link
        href="/trending"
        aria-label="Exit and go back to Trending"
        className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition hover:bg-black/45"
      >
        <FaXmark className="h-4 w-4" aria-hidden="true" />
      </Link>

      <div className="relative flex items-center overflow-hidden p-6 sm:p-10 lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.36),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.24),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.22),transparent_38%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.94))]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="relative max-w-2xl space-y-6 text-white">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            Negosyante Island
          </div>
          <div className="max-w-[18rem] sm:max-w-[24rem] md:max-w-[32rem] lg:max-w-none">
            <BrandLogo />
          </div>
          <h1 className="text-4xl font-semibold leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Join the island where business, culture, and forum chatter move together.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-cyan-50/85 sm:text-base">
            Sign in to access your home feed, business tools, inbox, and publishing controls. Guests can still browse Trending and Island Forums.
          </p>

          <div className="relative mt-2 overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-4 shadow-2xl backdrop-blur-sm sm:p-6">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_28%,transparent_72%,rgba(255,255,255,0.06))]" />
            <div className="relative grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="h-20 rounded-[1.25rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_30%_30%,rgba(253,224,71,0.65),rgba(253,224,71,0.08)_45%,transparent_60%),linear-gradient(135deg,rgba(14,165,233,0.24),rgba(15,23,42,0.1))]" />
                <div className="h-28 rounded-[1.5rem] border border-cyan-100/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.3),rgba(59,130,246,0.1)),linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] p-4">
                  <div className="flex items-end gap-3">
                    <div className="h-14 w-14 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),rgba(255,255,255,0.28)_40%,transparent_70%)]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded-full bg-white/80" />
                      <div className="h-2 w-5/6 rounded-full bg-white/55" />
                      <div className="h-2 w-2/3 rounded-full bg-white/40" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative flex items-end justify-center">
                <div className="absolute left-1/2 top-2 h-24 w-24 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.95),rgba(251,191,36,0.12)_55%,transparent_70%)] blur-[2px]" />
                <div className="relative h-44 w-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,116,144,0.1),rgba(15,23,42,0.12))]">
                  <div className="absolute inset-x-4 top-5 h-4 rounded-full bg-white/10" />
                  <div className="absolute inset-x-6 bottom-12 h-10 rounded-[45%_45%_30%_30%] bg-[linear-gradient(180deg,rgba(34,197,94,0.9),rgba(16,185,129,0.22))]" />
                  <div className="absolute inset-x-2 bottom-6 h-6 rounded-full bg-cyan-300/30 blur-sm" />
                  <div className="absolute inset-x-0 bottom-0 h-16 rounded-[50%_50%_0_0] bg-[linear-gradient(180deg,rgba(8,145,178,0.65),rgba(15,23,42,0.95))]" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">Public</p>
                <p className="mt-1 text-sm font-semibold text-white">Trending is always open</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">Social</p>
                <p className="mt-1 text-sm font-semibold text-white">Forum posts, reactions, replies</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80">Business</p>
                <p className="mt-1 text-sm font-semibold text-white">Inbox, dashboard, insight tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-[color:var(--ni-surface-1)] p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md space-y-4">
          <LoginForm />
          <p className="text-center text-sm text-[color:var(--ni-text)]">
            No account yet? <Link href="/signup" className="font-semibold text-[color:var(--ni-brand)]">Sign up here.</Link>
          </p>
          <div className="grid gap-2 text-xs text-[color:var(--ni-muted)] sm:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3">
              Guest mode lets you explore public content first.
            </div>
            <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3">
              Business accounts unlock inbox and dashboard features.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

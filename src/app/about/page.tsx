import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">About</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Negosyante Island</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          Negosyante Island is a Philippines-first social web app for discovery, trend tracking, business publishing, and community messaging. The international version is coming next.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">What it does</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Trending stories, island forums, business inboxes, and publishing tools all live in one place.</p>
        </article>
        <article className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Who it is for</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Normal users, verified business teams, marketing experts, and staff publishers all use the same platform with role-aware surfaces.</p>
        </article>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/feed" className="rounded border border-[color:var(--ni-border)] px-3 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)]">
          Go to Feed
        </Link>
        <Link href="/international" className="rounded border border-[color:var(--ni-border)] px-3 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)]">
          International
        </Link>
        <Link href="/legal" className="rounded border border-[color:var(--ni-border)] px-3 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)]">
          Legal
        </Link>
      </div>
    </section>
  );
}
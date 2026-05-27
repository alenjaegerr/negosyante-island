import Link from "next/link";

export default function MembershipProgramPage() {
  return (
    <section className="mx-auto w-full max-w-screen-2xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Membership Program</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Business and Marketing Expert access</h1>
        <p className="mt-3 max-w-3xl text-sm text-[color:var(--ni-text)]">
          Negosyante Island gives both verified business owners and verified marketing experts the same pro feature set: Negosyante Insight, B2B inbox, lead tracking, and admin-reviewed credibility.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Free access</p>
          <h2 className="mt-2 text-xl font-semibold text-[color:var(--ni-text-strong)]">3 months on us</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">
            Verified pro accounts get 90 days of full access before billing starts.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--ni-text)]">
            <li>Negosyante Insight</li>
            <li>B2B inbox and lead capture</li>
            <li>Public business profile and promotion tools</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Billing after trial</p>
          <h2 className="mt-2 text-xl font-semibold text-[color:var(--ni-text-strong)]">GCash payment plans</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">
            Monthly is PHP 150. Annual is PHP 1,500. Choose the plan that fits your campaign cadence.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/signup?accountType=business_pending" className="rounded bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white">
              Create Business Account
            </Link>
            <Link href="/signup?accountType=marketing_pending" className="rounded border border-[color:var(--ni-border)] px-4 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)]">
              Create Marketing Expert Account
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

import Link from "next/link";

const futureMarkets = [
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "ID", name: "Indonesia" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "JP", name: "Japan" },
  { code: "US", name: "United States" },
];

export default function InternationalPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">Comming Soon</span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">International</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-[color:var(--ni-text-strong)]">We are working on delivering Negosyante Island internationally. Stay tuned for more updates.</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          The Philippines version is live today. International regions will roll out with localized onboarding, region controls, and market-specific publishing tools.
        </p>
      </div>

      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Future regions</h2>
          <Link href="/feed" className="rounded-full border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
            Back to Philippines
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {futureMarkets.map((market) => (
            <button
              key={market.code}
              type="button"
              disabled
              className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-4 py-4 text-left opacity-60"
            >
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[color:var(--ni-muted)]">Comming Soon</span>
              <span className="mt-2 block text-2xl font-black leading-none text-[color:var(--ni-text-strong)]">{market.code}</span>
              <span className="mt-1 block text-sm font-semibold text-[color:var(--ni-text)]">{market.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
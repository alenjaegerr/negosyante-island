import Link from "next/link";

const regions = [
  {
    href: "/feed",
    code: "PH",
    icon: "🇵🇭",
    name: "Philippines",
    description: "The live Negosyante Island experience.",
    isLive: true,
  },
  {
    href: "/international",
    code: "INTL",
    icon: "🌐",
    name: "International",
    description: "Coming soon for global rollout.",
    isLive: false,
  },
];

export default function SelectRegionPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">Select Region</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Choose your Negosyante Island region</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          The Philippines experience is live today. International regions are being prepared now and will unlock with localized content and tools.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {regions.map((region) => (
          <Link
            key={region.code}
            href={region.href}
            className={`rounded-2xl border p-4 shadow-sm transition ${
              region.isLive
                ? "border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]"
                : "border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] text-[var(--ni-text-strong)] opacity-80 hover:border-[var(--ni-brand)]"
            }`}
          >
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--ni-muted)]">
              {region.isLive ? "Current region" : "Comming Soon"}
            </span>
            <span className="mt-2 block text-3xl font-black leading-none">{region.icon} {region.code}</span>
            <span className="mt-1 block text-lg font-semibold">{region.name}</span>
            <span className="mt-2 block text-sm text-[color:var(--ni-text)]">{region.description}</span>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Future markets</h2>
        <p className="mt-2 text-sm text-[color:var(--ni-text)]">
          We&apos;re also lining up support for Singapore, Malaysia, Indonesia, Thailand, Vietnam, Japan, and the United States.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "Singapore",
            "Malaysia",
            "Indonesia",
            "Thailand",
            "Vietnam",
            "Japan",
            "United States",
          ].map((country) => (
            <button
              key={country}
              type="button"
              disabled
              className="rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--ni-text-strong)] opacity-60"
            >
              {country}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
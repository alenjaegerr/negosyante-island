export default function AdvertisingPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">ADVERTISING</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Reach the island audience</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          Negosyante Island supports sponsored placements that fit the feed, trending insight, and verified business surfaces without breaking the platform style.
        </p>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[linear-gradient(135deg,rgba(14,116,144,0.18),rgba(59,130,246,0.12),rgba(255,255,255,0.68))] p-5 shadow-sm">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">CUSTOM BRAND BOX</p>
        <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ni-text-strong)]">Red Bull-style placement, but fully yours</h2>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          This slot is designed for direct sponsors and campaign partners. It can sit in the feed or Trending surface as a branded box instead of a generic network ad.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Feed Sponsorships</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Promoted stories, launches, and campaigns placed inside culture rails.</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Business Placement</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Feature your verified business on relevant island pages and category spotlights.</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Insight Features</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Connect your brand to trending context in a way that still feels native to the site.</p>
        </div>
      </div>
    </section>
  );
}
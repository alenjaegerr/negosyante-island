export default function WhatWeDoPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">WHAT WE DO</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Track culture, verify businesses, and keep the island organized</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          Negosyante Island blends social discovery, local business verification, and admin moderation into one shared platform for B2C users and verified businesses.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">B2C Discovery</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Trend rails, local business listings, and social feed posts for everyday users.</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Business Verification</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Owner accounts can submit documents and move from pending to verified business status.</p>
        </div>
      </div>
    </section>
  );
}
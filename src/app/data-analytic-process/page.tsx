export default function DataAnalyticProcessPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">DATA ANALYTIC PROCESS</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">How Negosyante Island reads the island</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          The platform groups posts by category, highlights engagement, and surfaces insight-ready stories for deeper review.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">1. Collect</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Posts, trend signals, and business activity are saved into the platform database.</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">2. Categorize</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Trend cards are grouped by platform and shaped for feed readability.</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">3. Surface</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">High-signal content is promoted into the Negosyante Insight view and related dashboards.</p>
        </div>
      </div>
    </section>
  );
}
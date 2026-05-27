export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-screen-2xl items-center justify-center px-2 py-10 sm:px-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[color:var(--ni-border)] bg-[linear-gradient(135deg,var(--ni-surface-1),var(--ni-surface-2))] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-roboto-mono text-[11px] uppercase tracking-[0.35em] text-[var(--ni-muted)]">Negosyante Island</p>
            <h1 className="mt-2 font-reddit text-2xl font-extrabold tracking-figma-tight text-[var(--ni-text-strong)] sm:text-3xl">Loading your next stop</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ni-text)] sm:text-base">
              Gathering current trends, community updates, and relevant business connections for you. This should only take a moment.
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] text-[var(--ni-brand)] shadow-sm">
            <div className="h-8 w-8 rounded-full border-2 border-[color:var(--ni-brand)] border-t-transparent animate-spin" />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="h-5 w-2/3 rounded-full bg-[color:var(--ni-surface-3)]/70 animate-pulse" />
          <div className="h-5 w-full rounded-full bg-[color:var(--ni-surface-3)]/55 animate-pulse" />
          <div className="h-5 w-5/6 rounded-full bg-[color:var(--ni-surface-3)]/60 animate-pulse" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            "Trending stories",
            "B2BM Interaction",
            "Entrepreneurial Spirit",
          ].map((label) => (
            <div key={label} className="rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-4 py-3 text-sm font-semibold text-[var(--ni-text-strong)] shadow-sm">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

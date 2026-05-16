export default function LegalPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">LEGAL</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Platform terms and responsibilities</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          This page outlines the basic expectations for using Negosyante Island, especially around account integrity, verification, and respectful platform use.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
        <div>
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Account use</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Use accurate profile information and keep login credentials secure.</p>
        </div>
        <div>
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Verification</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Business verification documents must belong to the account applying for verification.</p>
        </div>
        <div>
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Content</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Do not post harmful, misleading, or unauthorized material on the platform.</p>
        </div>
      </div>
    </section>
  );
}
export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">PRIVACY POLICY</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">How Negosyante Island handles data</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          We only collect the data required to operate user accounts, business verification, and platform analytics.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">What we store</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Account details, business verification status, posts, and other platform activity needed for the app.</p>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">What we do not sell</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">We do not sell personal account data. Platform usage is only used to operate and improve the service.</p>
        </div>
      </div>
    </section>
  );
}
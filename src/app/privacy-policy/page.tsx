export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">PRIVACY POLICY</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">How Negosyante Island handles data</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          We only collect the data required to operate user accounts, messaging, business verification, publishing tools, and platform analytics.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">What we collect</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">We collect account details, profile photos, business fields, posts, comments, messages, verification requests, and basic usage data needed to run the service.</p>
        </article>
        <article className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">How we use it</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Data is used to authenticate users, deliver feeds and inboxes, review business verification, manage billing, and improve platform quality and safety.</p>
        </article>
        <article className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Sharing and access</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">We do not sell personal data. Access is limited to the Negosyante Island team, service providers we use to host the app, and cases required by law.</p>
        </article>
        <article className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Deletion and retention</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">When an account is deleted, identifying profile data is removed or anonymized while public posts, comments, and forum threads may remain as Deleted User content to preserve the discussion history.</p>
        </article>
        <article className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Security</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">We use password hashing, authenticated sessions, and access controls to protect accounts. Users should keep their credentials private and report suspicious activity quickly.</p>
        </article>
        <article className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Questions and requests</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">For privacy concerns, deletion questions, or appeals, contact the team through the support page or review the launch policy summary on the legal page.</p>
        </article>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4 text-sm text-[color:var(--ni-text)]">
        For the full policy overview, see the <a href="/legal" className="font-semibold text-[color:var(--ni-brand)]">Legal</a> page or reach us through <a href="/contact-us" className="font-semibold text-[color:var(--ni-brand)]">Contact Us</a>.
      </div>
    </section>
  );
}

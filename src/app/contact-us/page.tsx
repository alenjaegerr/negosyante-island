import Link from "next/link";

export default function ContactUsPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">CONTACT US</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Talk to Negosyante Island</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          Reach out for partnerships, advertising, press, account support, or platform feedback. We read every message and route it to the right team.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">General Support</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Questions about login, verification, posting, or account access.</p>
          <p className="mt-3 text-sm font-semibold text-[color:var(--ni-text-strong)]">support@negosyante.island</p>
        </div>

        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Business &amp; Advertising</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Sponsored posts, brand campaigns, and verified business inquiries.</p>
          <p className="mt-3 text-sm font-semibold text-[color:var(--ni-text-strong)]">business@negosyante.island</p>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[color:var(--ni-text-strong)]">What to include</h2>
        <ul className="mt-3 space-y-2 text-sm text-[color:var(--ni-text)]">
          <li>• Your account name and role</li>
          <li>• What page or feature you need help with</li>
          <li>• Screenshots or verification details if relevant</li>
        </ul>
        <p className="mt-4 text-sm text-[color:var(--ni-text)]">
          If you are a verified business, you can also use your business dashboard to reach the platform team faster.
        </p>
        <Link href="/business/home" className="mt-4 inline-flex rounded border border-cyan-700 px-3 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-50">
          Go to Business Home
        </Link>
      </div>
    </section>
  );
}
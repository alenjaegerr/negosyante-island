import Link from "next/link";

const sections = [
  {
    title: "Terms of Use",
    body: "Negosyante Island is a community, discovery, messaging, and business insight platform for users, local businesses, and marketing experts. Use accurate account information, keep credentials secure, and do not impersonate people or organizations.",
  },
  {
    title: "Community Guidelines",
    body: "Do not post unlawful, harmful, misleading, abusive, spammy, or unauthorized content. We may remove content, limit features, or suspend accounts that harm the community or misuse platform tools.",
  },
  {
    title: "Business Verification",
    body: "Business and marketing expert verification materials must be accurate, current, and connected to the applicant. Approval, rejection, or feature access may depend on document quality, account history, and platform safety review.",
  },
  {
    title: "Membership and Billing",
    body: "Paid membership details, including GCash or manual payment instructions, are shown only when configured by the admin team. Do not send payment to unverified details. Plan access may change if payment cannot be confirmed.",
  },
  {
    title: "Data Deletion and Anonymization",
    body: "Users can request account deletion from account settings. For platform continuity, public posts, comments, and forum threads may remain visible under Deleted User after identifying account data is removed.",
  },
  {
    title: "Appeals and Contact",
    body: "For verification disputes, moderation appeals, billing questions, or privacy concerns, contact the Negosyante Island team through the contact page.",
  },
];

function slugifySection(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function LegalPage() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">LEGAL</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Platform terms and responsibilities</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">
          These launch terms are written for a Philippines-focused SMB and community platform. They explain account responsibilities, verification, billing, content expectations, and deletion rights.
        </p>
      </div>

      <div className="grid gap-3">
        {sections.map((section) => (
          <article id={slugifySection(section.title)} key={section.title} className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
            <h2 className="font-semibold text-[color:var(--ni-text-strong)]">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">{section.body}</p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4 text-sm text-[color:var(--ni-text)]">
        This page is a practical launch policy summary and is not a substitute for legal advice. For privacy details, read the{" "}
        <Link href="/privacy-policy" className="font-semibold text-[color:var(--ni-brand)]">
          Privacy Policy
        </Link>
        .
      </div>
    </section>
  );
}

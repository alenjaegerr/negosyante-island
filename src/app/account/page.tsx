import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DeleteAccountPanel } from "@/components/delete-account-panel";
import RoleBadge from "@/components/role-badge";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "publisher_verified") {
    redirect("/publisher/account");
  }

  const displayName = user.businessName?.trim() || user.name;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ni-muted)]">Account</p>
        <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ni-text-strong)]">{displayName}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <RoleBadge role={user.role} />
          <span className="text-sm text-[color:var(--ni-text)]">Manage your public profile photo, background, and display details.</span>
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Link href={`/profile/${user.id}`} className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-sm font-semibold text-white">
            Open public profile
          </Link>
          <Link href="/account/edit" className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-sm font-semibold text-[color:var(--ni-text-strong)]">
            Edit profile
          </Link>
          <Link href="/b2bm" className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-sm font-semibold text-[color:var(--ni-text-strong)]">
            Open B2BM
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(99,102,241,0.1),rgba(255,255,255,0.7))] p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">Upgrade path</p>
        <h2 className="mt-2 text-xl font-semibold text-[color:var(--ni-text-strong)]">Move from Aspiring Negosyante to verified pro</h2>
        <p className="mt-2 text-sm text-[color:var(--ni-text)]">
          Publish as a business or marketing expert to unlock inboxes, discovery, and pro analytics.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/signup?accountType=business_pending" className="rounded-full bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white">
            Become a business
          </Link>
          <Link href="/signup?accountType=marketing_pending" className="rounded-full border border-[color:var(--ni-border)] px-4 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)]">
            Become a marketing expert
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">About Negosyante Island</p>
        <p className="mt-2 text-sm text-[color:var(--ni-text)]">
          Negosyante Island is a Philippines-first social web app for discovery, publishing, messaging, and business growth. International regions are being prepared now.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/legal" className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
            Legal
          </Link>
          <Link href="/privacy-policy" className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
            Privacy Policy
          </Link>
          <Link href="/contact-us" className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
            Contact Us
          </Link>
          <Link href="/international" className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
            International
          </Link>
        </div>
      </div>

      <DeleteAccountPanel accountLabel="your account" />
    </section>
  );
}

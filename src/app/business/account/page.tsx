import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { getBusinesses } from "@/lib/businesses";
import { BusinessAccountView } from "@/components/business-account-view";
import { DeleteAccountPanel } from "@/components/delete-account-panel";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default async function BusinessAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isVerified = user.role === Role.business_verified || user.role === Role.marketing_verified;

  // Try to resolve a business by slug or by name. The DB-backed helper will
  // fall back to the static list when the Business table isn't present yet.
  const businessList = await getBusinesses();
  const business = user.businessName ? businessList.find((b) => b.name === user.businessName || b.slug === user.businessName) : undefined;
  const fallbackSlug = user.businessName ? slugify(user.businessName) : slugify(user.name);

  return (
    <section className="mx-auto w-full max-w-screen-2xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-2xl border border-cyan-600/50 bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">Account Settings</p>
        <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ni-text-strong)]">{user.businessName ?? user.name}</h1>
        <p className="mt-1 text-sm text-[color:var(--ni-text)]">Manage your profile, verification status, and billing. Your public page is visible to Discovery.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Public profile</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">Preview the page partners see when they click your card.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/business/${business?.slug ?? fallbackSlug}`} className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-xs font-semibold text-white">
              View public profile
            </Link>
            <Link href="/business/account/edit" className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
              Edit profile
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Verification</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">{isVerified ? "You are verified and visible to B2B partners." : "Complete verification to unlock full B2B features."}</p>
          <Link href={isVerified ? "/business/dashboard" : "/business/pending"} className="mt-3 inline-flex rounded border border-cyan-700 px-3 py-1.5 text-sm font-semibold text-cyan-800">
            {isVerified ? "Open Dashboard" : "Continue Verification"}
          </Link>
        </div>

        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Membership & Billing</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">
            {user.membershipCycle ? `Current plan: ${user.membershipCycle}` : "Choose monthly or annual billing after your free 3-month access period."}
          </p>
          <Link href="/business/billing" className="mt-3 inline-flex rounded border border-cyan-700 px-3 py-1.5 text-sm font-semibold text-cyan-800">
            Open Billing
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">About Negosyante Island</p>
        <p className="mt-2 text-sm text-[color:var(--ni-text)]">
          Built for verified business teams and marketing experts who need discovery, lead handling, and content publishing tools. Global regions will open later.
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

      {business ? (
        <BusinessAccountView business={business} currentUser={{ role: user.role, businessName: user.businessName }} />
      ) : null}

      <DeleteAccountPanel accountLabel="this business account" />
    </section>
  );
}

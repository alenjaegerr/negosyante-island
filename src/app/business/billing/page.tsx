import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettingMap } from "@/lib/site-settings";

export default async function BusinessBillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== Role.business_verified && user.role !== Role.marketing_verified && user.role !== Role.admin) {
    redirect("/feed");
  }

  const siteSettings = await getSiteSettingMap();

  const isAnnual = user.membershipCycle === "annual";
  const planPrice = isAnnual ? "PHP 1,500 / year" : "PHP 150 / month";
  const planDescription = isAnnual
    ? "Best for teams that want predictable annual budgeting."
    : "Best for active operators who want the lowest upfront commitment.";
  const billingPaymentLabel = siteSettings.get("billingPaymentLabel") ?? "GCash payment channel";
  const billingPaymentDetails = siteSettings.get("billingPaymentDetails")?.trim() ?? "";
  const billingPaymentQrUrl = siteSettings.get("billingPaymentQrUrl") ?? "";
  const billingPaymentNote = siteSettings.get("billingPaymentNote")?.trim() ?? "";
  const hasPaymentDetails = Boolean(billingPaymentDetails || billingPaymentQrUrl || billingPaymentNote);

  return (
    <section className="mx-auto w-full max-w-5xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Billing</p>
        <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ni-text-strong)]">Membership and GCash payment</h1>
        <p className="mt-2 text-sm text-[color:var(--ni-text)]">
          Verified business and marketing expert accounts start with 3 months of free access. After that, choose monthly or annual billing to keep Negosyante Insight, B2B tools, and lead inbox access active.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Current plan</p>
          <h2 className="mt-2 text-xl font-semibold text-[color:var(--ni-text-strong)]">{planPrice}</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">{planDescription}</p>
          <p className="mt-3 text-sm text-[color:var(--ni-text)]">
            Status: <strong className="text-[color:var(--ni-text-strong)]">{user.membershipStatus ?? "trial"}</strong>
          </p>
          <p className="text-sm text-[color:var(--ni-text)]">
            Trial ends: <strong className="text-[color:var(--ni-text-strong)]">{user.membershipEndsAt ? new Date(user.membershipEndsAt).toLocaleDateString() : "Not set"}</strong>
          </p>
        </div>

        {hasPaymentDetails ? (
          <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">{billingPaymentLabel}</p>
            <h2 className="mt-2 text-xl font-semibold text-[color:var(--ni-text-strong)]">Pay through GCash</h2>
            <p className="mt-2 text-sm text-[color:var(--ni-text)]">{billingPaymentDetails}</p>
            <div className="mt-3 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3 text-sm text-[var(--ni-text)]">
              <p className="font-semibold text-[color:var(--ni-text-strong)]">Monthly: PHP 150</p>
              <p className="font-semibold text-[color:var(--ni-text-strong)]">Annual: PHP 1,500</p>
              {billingPaymentQrUrl ? (
                <a href={billingPaymentQrUrl} className="mt-2 inline-flex rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]" target="_blank" rel="noreferrer">
                  Open QR / payment image
                </a>
              ) : null}
              {billingPaymentNote ? <p className="mt-2 text-xs text-[color:var(--ni-muted)]">{billingPaymentNote}</p> : null}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Payment details pending</p>
            <p className="mt-2 text-sm text-[color:var(--ni-text)]">The billing panel will show official GCash details once an admin configures them. Until then, please wait for a verified payment notice.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Select billing cycle</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <form action="/api/business/billing" method="post" className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4">
            <input type="hidden" name="membershipCycle" value="monthly" />
            <p className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Monthly plan</p>
            <p className="mt-2 text-sm text-[color:var(--ni-text)]">PHP 150 per month after the free trial.</p>
            <button type="submit" className="mt-3 rounded bg-[color:var(--ni-brand-cta)] px-3 py-2 text-sm font-semibold text-white">
              Choose Monthly
            </button>
          </form>

          <form action="/api/business/billing" method="post" className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4">
            <input type="hidden" name="membershipCycle" value="annual" />
            <p className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Annual plan</p>
            <p className="mt-2 text-sm text-[color:var(--ni-text)]">PHP 1,500 per year after the free trial.</p>
            <button type="submit" className="mt-3 rounded bg-[color:var(--ni-brand-cta)] px-3 py-2 text-sm font-semibold text-white">
              Choose Annual
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/business/account" className="rounded border border-[color:var(--ni-border)] px-3 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)]">
          Back to Account
        </Link>
        <Link href="/membership-program" className="rounded border border-[color:var(--ni-border)] px-3 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)]">
          View Membership Program
        </Link>
      </div>
    </section>
  );
}

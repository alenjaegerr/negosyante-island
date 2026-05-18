import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { getBusinessBySlug, getBusinesses } from "@/lib/businesses";
import { BusinessAccountView } from "@/components/business-account-view";

export default async function BusinessAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isVerified = user.role === Role.business_verified;

  // Try to resolve a business by slug or by name. The DB-backed helper will
  // fall back to the static list when the Business table isn't present yet.
  const business = user.businessName ? (await getBusinesses()).find((b) => b.name === user.businessName || b.slug === user.businessName) : undefined;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-xl border border-cyan-600/50 bg-[color:var(--ni-surface-1)] p-5">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">Account Settings</p>
        <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ni-text-strong)]">{user.businessName ?? user.name}</h1>
        <p className="mt-1 text-sm text-[color:var(--ni-text)]">Update your profile, change business name, profile image, and proceed with verification from here.</p>
      </div>

      {business ? (
        <BusinessAccountView business={business} currentUser={{ role: user.role, businessName: user.businessName }} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
            <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Profile</h2>
            <p className="mt-2 text-sm text-[color:var(--ni-text)]">Change display name and upload a profile image for your business.</p>
            <Link href="/business/account/edit" className="mt-3 inline-flex rounded bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white">Edit Profile</Link>
          </div>

          <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
            <h2 className="font-semibold text-[color:var(--ni-text-strong)]">Verification</h2>
            <p className="mt-2 text-sm text-[color:var(--ni-text)]">{isVerified ? "You are verified." : "Complete your verification to access B2B features."}</p>
            <Link href={isVerified ? "/business/dashboard" : "/business/pending"} className="mt-3 inline-flex rounded border border-cyan-700 px-3 py-1.5 text-sm font-semibold text-cyan-800">{isVerified ? "Open Dashboard" : "Continue Verification"}</Link>
          </div>
        </div>
      )}
    </section>
  );
}

import Link from "next/link";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function BusinessHomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role !== Role.business_pending && user.role !== Role.business_verified) {
    redirect("/feed");
  }

  const isVerified = user.role === Role.business_verified;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-5">
        <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">B2B HOME</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ni-text-strong)]">Welcome, {user.businessName ?? user.name}</h1>
        <p className="mt-1 text-sm text-[var(--ni-text)]">
          This is your business-owner workspace. B2C users must sign up as business accounts and complete verification to access business-owner inquiries.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[var(--ni-text-strong)]">Verification Status</h2>
          <p className="mt-2 text-sm text-[var(--ni-text)]">
            {isVerified ? "Verified ✅. You can interact as a business owner." : "Pending verification. Complete this to unlock B2B interaction tools."}
          </p>
          <Link
            href={isVerified ? "/business/dashboard" : "/business/pending"}
            className="mt-3 inline-flex rounded bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white"
          >
            {isVerified ? "Open Business Dashboard" : "Continue Verification"}
          </Link>
        </div>

        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4">
          <h2 className="font-semibold text-[var(--ni-text-strong)]">B2B Inquiry Controls</h2>
          <p className="mt-2 text-sm text-[var(--ni-text)]">
            Use this lane for owner-to-owner collaboration, supplier talk, and verified partnership inquiries.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex rounded border border-[color:var(--ni-brand)] px-3 py-1.5 text-sm font-semibold text-[var(--ni-brand)]"
          >
            View B2C Homepage
          </Link>
        </div>
      </div>
    </section>
  );
}

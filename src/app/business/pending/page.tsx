import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PendingPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function BusinessPendingPage({ searchParams }: PendingPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { error } = await searchParams;

  if (user.role === Role.business_verified) redirect("/business/dashboard");
  if (user.role !== Role.business_pending) redirect("/feed");

  const latestRequest = await prisma.verificationRequest.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-4 rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5">
      <h1 className="text-2xl font-semibold text-[color:var(--ni-text-strong)]">Business Verification</h1>
      <p className="text-sm text-[color:var(--ni-text)]">
        Good day, {user.businessName ?? user.name}. Submit your BIR TIN or Mayor&apos;s Business Permit for admin review.
      </p>

      <form action="/api/business/verify" method="post" encType="multipart/form-data" className="space-y-3">
        <select className="w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] text-[color:var(--ni-text-strong)] p-2" name="documentType" required>
          <option value="bir_tin">BIR TIN Number</option>
          <option value="mayor_permit">Mayor&apos;s Business Permit</option>
        </select>
        <input className="w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] text-[color:var(--ni-text-strong)] p-2" name="businessName" required defaultValue={user.businessName ?? ""} placeholder="Business name" />
        <input className="w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] text-[color:var(--ni-text-strong)] p-2" name="document" required type="file" accept="image/*,.pdf" />
        <button type="submit" className="rounded bg-sky-600 px-4 py-2 text-white">Submit Verification</button>
      </form>

      {error === "file_too_large" ? (
        <p className="text-sm text-rose-700">Upload failed: file must be 5MB or less.</p>
      ) : null}
      {error === "invalid_file_type" ? (
        <p className="text-sm text-rose-700">Upload failed: allowed file types are PNG, JPG, JPEG, WEBP, and PDF.</p>
      ) : null}

      {latestRequest ? (
        <div className="rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3 text-sm text-[color:var(--ni-text)]">
          <p>Status: <strong className="uppercase">{latestRequest.status}</strong></p>
          <p>Document: <a className="text-sky-700 underline" href={`/api/business/documents/${latestRequest.id}`}>View uploaded document</a></p>
          {latestRequest.rejectionNote ? <p>Rejection note: {latestRequest.rejectionNote}</p> : null}
        </div>
      ) : null}
    </section>
  );
}

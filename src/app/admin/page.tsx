import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== Role.admin) redirect("/feed");

  const requests = await prisma.verificationRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 30,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Panel · Business Verification</h1>
      <div className="space-y-3">
        {requests.map((request) => (
          <article key={request.id} className="rounded-xl border bg-white p-4">
            <p className="font-medium">{request.businessName} ({request.user.email})</p>
            <p className="text-sm text-slate-600">Document: {request.documentType} · Status: <strong>{request.status}</strong></p>
            <a className="text-sm text-sky-700 underline" href={`/api/business/documents/${request.id}`}>View uploaded document</a>
            {request.status === "pending" ? (
              <div className="mt-3 flex gap-2">
                <form action={`/api/admin/verification/${request.id}`} method="post">
                  <input type="hidden" name="decision" value="approved" />
                  <button className="rounded bg-emerald-600 px-3 py-1 text-sm text-white" type="submit">Approve</button>
                </form>
                <form action={`/api/admin/verification/${request.id}`} method="post" className="flex gap-2">
                  <input type="hidden" name="decision" value="rejected" />
                  <input type="text" name="rejectionNote" className="rounded border px-2 py-1 text-sm" placeholder="Reason (optional)" />
                  <button className="rounded bg-rose-600 px-3 py-1 text-sm text-white" type="submit">Reject</button>
                </form>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

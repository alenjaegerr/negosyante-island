import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <section className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-slate-600">Updates from followed businesses and Negosyante curated feeds.</p>
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <article key={notification.id} className={`rounded-xl border p-4 ${notification.isRead ? "bg-white" : "bg-cyan-50"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-700">{notification.body}</p>
              </div>
              {!notification.isRead ? <span className="rounded bg-cyan-700 px-2 py-0.5 text-xs text-white">New</span> : null}
            </div>
            {notification.href ? (
              <Link href={notification.href} className="mt-2 inline-flex text-sm font-semibold text-cyan-700 underline">
                Open
              </Link>
            ) : null}
          </article>
        ))}

        {notifications.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-white p-4 text-sm text-slate-600">No notifications yet.</p>
        ) : null}
      </div>
    </section>
  );
}

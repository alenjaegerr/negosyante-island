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
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-[color:var(--ni-text-strong)]">Notifications</h1>
        <p className="text-sm text-[color:var(--ni-text)]">Messages, broadcasts, and feed updates live here.</p>
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <article key={notification.id} className={`rounded-2xl border p-4 ${notification.isRead ? "border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]" : "border-[color:var(--ni-brand)] bg-[color:var(--ni-accent-soft)]"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[color:var(--ni-text-strong)]">{notification.title}</p>
                <p className="mt-1 text-sm text-[color:var(--ni-text)]">{notification.body}</p>
              </div>
              {!notification.isRead ? <span className="rounded-full bg-[color:var(--ni-brand-cta)] px-2 py-0.5 text-xs font-semibold text-white">New</span> : null}
            </div>
            {notification.href ? (
              <Link href={notification.href} className="mt-2 inline-flex text-sm font-semibold text-[color:var(--ni-brand)] underline">
                Open
              </Link>
            ) : null}
          </article>
        ))}

        {notifications.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 text-sm text-[color:var(--ni-muted)]">No notifications yet.</p>
        ) : null}
      </div>
    </section>
  );
}

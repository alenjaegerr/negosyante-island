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
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--ni-text-strong)]">Notifications</h1>
        <p className="text-sm text-[var(--ni-text)]">Updates from followed businesses and Negosyante curated feeds.</p>
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <article key={notification.id} className={`rounded-xl border border-[color:var(--ni-border)] p-4 ${notification.isRead ? "bg-[var(--ni-surface-1)]" : "bg-[var(--ni-accent-soft)]"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--ni-text-strong)]">{notification.title}</p>
                <p className="mt-1 text-sm text-[var(--ni-text)]">{notification.body}</p>
              </div>
              {!notification.isRead ? <span className="rounded bg-cyan-700 px-2 py-0.5 text-xs text-white">New</span> : null}
            </div>
            {notification.href ? (
              <Link href={notification.href} className="mt-2 inline-flex text-sm font-semibold text-[var(--ni-brand)] underline">
                Open
              </Link>
            ) : null}
          </article>
        ))}

        {notifications.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 text-sm text-[var(--ni-text)]">No notifications yet.</p>
        ) : null}
      </div>
    </section>
  );
}

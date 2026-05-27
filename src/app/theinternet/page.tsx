import Link from "next/link";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ForumThreadForm from "@/components/forum-thread-form";
import RoleBadge from "@/components/role-badge";
import { UserAvatar } from "@/components/user-avatar";

export default async function TheInternetPage() {
  const [user, threads] = await Promise.all([
    getCurrentUser(),
    prisma.forumThread.findMany({
      include: {
        author: { select: { id: true, name: true, role: true, businessName: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const isAuthenticated = Boolean(user);
  const homeHref =
    user?.role === Role.business_pending || user?.role === Role.business_verified || user?.role === Role.marketing_pending || user?.role === Role.marketing_verified
      ? "/business/home"
      : user
        ? "/feed"
        : "/signup";

  return (
    <section className="mx-auto w-full max-w-screen-2xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[linear-gradient(135deg,rgba(2,132,199,0.15),rgba(20,184,166,0.12),rgba(255,255,255,0.55))] p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">ISLAND FORUMS</p>
            <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">🏝️ ISLAND FORUMS</h1>
            <p className="mt-2 text-sm text-[color:var(--ni-text)]">
              Community discussions, local updates, and questions from across the island.
              Anonymous readers are welcome, but you&apos;ll need an account to react or reply.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={homeHref}
              className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-xs font-semibold text-white"
            >
              {user ? "Open Home Feed" : "Create Account"}
            </Link>
            <Link
              href="/contact-us"
              className="rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-4 py-3 text-sm text-[color:var(--ni-text)]">
          You are viewing as a guest. Create an account to post, react, or follow forum updates.
          <Link href="/signup" className="ml-2 inline-flex font-semibold text-[color:var(--ni-brand)]">
            Sign up now
          </Link>
        </div>
      ) : null}

      {isAuthenticated ? <ForumThreadForm /> : null}

      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Forum Threads</h2>
          <span className="rounded-full border border-[color:var(--ni-border)] px-2 py-0.5 text-xs text-[color:var(--ni-muted)]">
            {threads.length} latest
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {threads.length ? (
            threads.map((thread) => (
              <article key={thread.id} className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={thread.author.businessName ?? thread.author.name} avatarUrl={thread.author.avatarUrl} size={32} />
                    <p className="text-sm font-semibold text-[color:var(--ni-text-strong)]">{thread.author.businessName ?? thread.author.name}</p>
                    <RoleBadge role={thread.author.role} />
                  </div>
                  <span className="text-xs text-[color:var(--ni-muted)]">{new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>
                <Link href={`/theinternet/${thread.id}`} className="mt-2 block text-lg font-semibold text-[color:var(--ni-text-strong)]">
                  {thread.title}
                </Link>
                <p className="mt-2 line-clamp-3 text-sm text-[color:var(--ni-text)]">
                  {thread.body}
                </p>
                {thread.mediaUrl ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]">
                    <img src={thread.mediaUrl} alt={thread.title} className="max-h-72 w-full object-contain" />
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[color:var(--ni-text)]">
                  <span className="rounded bg-[color:var(--ni-surface-1)] px-2 py-1">{thread._count.comments} replies</span>
                  {thread.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded bg-[color:var(--ni-surface-1)] px-2 py-1">#{tag}</span>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4 text-sm text-[color:var(--ni-muted)]">
              No forum threads yet. Be the first to start a conversation.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
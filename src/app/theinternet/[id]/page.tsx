import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ForumCommentForm from "@/components/forum-comment-form";
import RoleBadge from "@/components/role-badge";
import { UserAvatar } from "@/components/user-avatar";

export default async function ForumThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [thread, user] = await Promise.all([
    prisma.forumThread.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, role: true, businessName: true, avatarUrl: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, name: true, role: true, businessName: true, avatarUrl: true } } },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!thread) notFound();

  return (
    <section className="mx-auto w-full max-w-4xl space-y-4 px-3 py-6 sm:px-4">
      <Link href="/theinternet" className="text-xs font-semibold text-[color:var(--ni-brand)]">
        Back to Island Forums
      </Link>

      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserAvatar name={thread.author.businessName ?? thread.author.name} avatarUrl={thread.author.avatarUrl} size={36} />
            <p className="text-sm font-semibold text-[color:var(--ni-text-strong)]">{thread.author.businessName ?? thread.author.name}</p>
            <RoleBadge role={thread.author.role} />
          </div>
          <span className="text-xs text-[color:var(--ni-muted)]">{new Date(thread.createdAt).toLocaleString()}</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-[color:var(--ni-text-strong)]">{thread.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-sm text-[color:var(--ni-text)]">{thread.body}</p>
        {thread.mediaUrl ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)]">
            <img src={thread.mediaUrl} alt={thread.title} className="max-h-[30rem] w-full object-contain" />
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[color:var(--ni-text)]">
          {thread.tags.map((tag) => (
            <span key={tag} className="rounded bg-[color:var(--ni-surface-2)] px-2 py-1">#{tag}</span>
          ))}
        </div>
      </div>

      {user ? (
        <ForumCommentForm threadId={thread.id} />
      ) : (
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4 text-sm text-[color:var(--ni-text)]">
          Sign in to join the discussion.
          <Link href="/login" className="ml-2 font-semibold text-[color:var(--ni-brand)]">
            Log in
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Replies</h2>
        <div className="mt-3 space-y-3">
          {thread.comments.length ? (
            thread.comments.map((comment) => (
              <article key={comment.id} className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={comment.author.businessName ?? comment.author.name} avatarUrl={comment.author.avatarUrl} size={28} />
                    <p className="text-sm font-semibold text-[color:var(--ni-text-strong)]">{comment.author.businessName ?? comment.author.name}</p>
                    <RoleBadge role={comment.author.role} />
                  </div>
                  <span className="text-xs text-[color:var(--ni-muted)]">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--ni-text)]">{comment.content}</p>
                {comment.mediaUrl ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]">
                    <img src={comment.mediaUrl} alt="Comment attachment" className="max-h-64 w-full object-contain" />
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4 text-sm text-[color:var(--ni-muted)]">
              No replies yet. Start the conversation.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

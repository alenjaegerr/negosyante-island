import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CreatePostForm } from "@/components/create-post-form";
import { PostActions } from "@/components/post-actions";

export default async function BusinessHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Only allow business accounts here
  if (user.role !== "business_pending" && user.role !== "business_verified") {
    redirect("/feed");
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true },
    take: 25,
  });

  return (
    <section className="space-y-4">
      <div className="rounded-xl bg-[color:var(--ni-surface-1)] p-5 shadow-sm border border-[color:var(--ni-border)]">
        <h1 className="text-2xl font-semibold text-[color:var(--ni-text-strong)]">Welcome, {user.businessName ?? user.name}</h1>
        <p className="text-sm text-[color:var(--ni-text)]">Role: {user.role}</p>
      </div>

      <CreatePostForm />

      <div className="space-y-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
            <p className="text-sm text-[color:var(--ni-muted)]">@{post.author.name}</p>
            <p className="mt-2 whitespace-pre-wrap text-[color:var(--ni-text-strong)]">{post.content}</p>
            <div className="mt-2 flex gap-2 text-xs text-[color:var(--ni-text)]">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded bg-[color:var(--ni-surface-2)] px-2 py-1">#{tag}</span>
              ))}
            </div>
            <PostActions post={post} />
          </article>
        ))}
      </div>
    </section>
  );
}

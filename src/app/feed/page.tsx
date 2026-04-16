import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CreatePostForm } from "@/components/create-post-form";
import { PostActions } from "@/components/post-actions";

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true },
    take: 25,
  });

  return (
    <section className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
        <p className="text-sm text-slate-600">Role: {user.role}</p>
      </div>

      <CreatePostForm />

      <div className="space-y-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-xl border bg-white p-4">
            <p className="text-sm text-slate-500">@{post.author.name}</p>
            <p className="mt-2 whitespace-pre-wrap">{post.content}</p>
            <div className="mt-2 flex gap-2 text-xs text-slate-600">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded bg-slate-100 px-2 py-1">#{tag}</span>
              ))}
            </div>
            <PostActions post={post} />
          </article>
        ))}
      </div>
    </section>
  );
}

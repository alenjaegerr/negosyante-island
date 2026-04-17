import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { TrendingFeedGrid } from "@/components/trending-feed-grid";
import { getPublishedTrendingPosts } from "@/lib/trending-posts";

export default async function TrendingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const posts = await getPublishedTrendingPosts(24);

  return (
    <section className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Trending Feed + Negosyante Insight</h1>
        <p className="mt-1 text-sm text-slate-600">
          Culture feed stories grouped in platform boxes with expandable details.
        </p>
      </div>

      <div className="rounded-3xl border border-transparent bg-white/20 p-2">
        <TrendingFeedGrid posts={posts} />
      </div>
    </section>
  );
}

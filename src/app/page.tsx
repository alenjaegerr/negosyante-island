import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getPublishedTrendingPosts } from "@/lib/trending-posts";
import { TrendingFeedGrid } from "@/components/trending-feed-grid";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === Role.admin) redirect("/admin");
    if (user.role === Role.business_pending || user.role === Role.business_verified) {
      redirect("/business/home");
    }
  }

  const posts = await getPublishedTrendingPosts(24);

  return (
    <section className="relative isolate min-h-screen bg-[#07080d] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12rem] top-[-10rem] h-[26rem] w-[26rem] rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-[16rem] h-[24rem] w-[24rem] rounded-full bg-rose-300/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[22%] h-[28rem] w-[28rem] rounded-full bg-amber-200/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),transparent_28%,rgba(255,255,255,0.025))]" />
      </div>

      <div className="w-full py-4 lg:py-5">
        <TrendingFeedGrid posts={posts} />
      </div>
    </section>
  );
}

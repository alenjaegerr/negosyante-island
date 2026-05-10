import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { localBusinesses } from "@/lib/local-businesses";
import { LocalBusinessesPanel } from "@/components/local-businesses-panel";
import { Role } from "@prisma/client";
import { TrendingFeedGrid } from "@/components/trending-feed-grid";
import { getPublishedTrendingPosts } from "@/lib/trending-posts";
import { LiveTimestamp } from "@/components/live-timestamp";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === Role.admin) redirect("/admin");
    if (user.role === Role.business_pending || user.role === Role.business_verified) {
      redirect("/business/home");
    }
    redirect("/feed");
  }

  const posts = await getPublishedTrendingPosts(8);

  return (
    <section className="w-full px-0 pb-7 pt-1 md:pt-4">
      <div className="font-roboto-mono inline-flex items-center rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-1.5 text-[10px] font-bold tracking-figma-tight text-[var(--ni-text-strong)] sm:px-4 sm:py-2 sm:text-[11px] md:text-base">
        Updated <LiveTimestamp /> <span className="ml-2 text-[var(--ni-brand)]">• LIVE</span>
      </div>

      <div className="w-full mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">

      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full lg:max-w-[64%]">
          <h1 className="font-flex-bold text-[44px] leading-[0.94] tracking-tight text-[var(--ni-text-strong)] sm:text-6xl md:text-[80px]">
            TRENDING <span className="align-middle">🔥</span>
          </h1>
        </div>

        <aside className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-2.5 sm:max-w-[280px] sm:p-3">
          <h2 className="font-reddit text-lg font-extrabold tracking-tight text-[var(--ni-text-strong)] sm:text-2xl">TODAY&apos;S SPONSOR</h2>
          <p className="mt-0.5 text-center text-[2rem] font-black leading-none text-[var(--ni-brand)] sm:mt-1 sm:text-3xl">RedBull</p>
          <p className="font-reddit text-center text-[10px] font-bold tracking-[0.14em] text-[var(--ni-muted)] sm:text-xs sm:tracking-[0.16em]">ENERGY DRINK</p>
        </aside>
      </div>

      <div className="mt-6 w-full">
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)]/65 p-1">
          <TrendingFeedGrid posts={posts} />
        </div>

        <div className="mt-6">
          <LocalBusinessesPanel businesses={localBusinesses} />
        </div>
      </div>

      </div>
    </section>
  );
}

import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { localBusinesses } from "@/lib/local-businesses";
import { LocalBusinessesPanel } from "@/components/local-businesses-panel";
import { Role } from "@prisma/client";
import { TrendingFeedGrid } from "@/components/trending-feed-grid";
import { getPublishedTrendingPosts } from "@/lib/trending-posts";

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
    <section className="mx-auto w-full max-w-6xl px-0 pb-7 pt-1 sm:px-2 md:pt-4">
      <div className="font-roboto-mono inline-flex items-center rounded-full bg-zinc-500 px-3 py-1.5 text-[10px] font-bold tracking-figma-tight text-white sm:px-4 sm:py-2 sm:text-[11px] md:text-base">
        Updated April 10, 2026 <span className="ml-2 text-red-300">• LIVE</span>
      </div>

      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full lg:max-w-[64%]">
          <h1 className="font-flex-bold text-[44px] leading-[0.94] tracking-tight text-black sm:text-6xl md:text-[80px]">
            TRENDING <span className="align-middle">🔥</span>
          </h1>
        </div>

        <aside className="w-full rounded border-2 border-cyan-600 bg-white px-3 py-2.5 sm:max-w-[280px] sm:p-3">
          <h2 className="font-reddit text-lg font-extrabold tracking-tight text-black sm:text-2xl">TODAY&apos;S SPONSOR</h2>
          <p className="mt-0.5 text-center text-[2rem] font-black leading-none text-red-600 sm:mt-1 sm:text-3xl">RedBull</p>
          <p className="font-reddit text-center text-[10px] font-bold tracking-[0.14em] text-red-500 sm:text-xs sm:tracking-[0.16em]">ENERGY DRINK</p>
        </aside>
      </div>

      <div className="mt-3 md:mt-4 md:grid md:grid-cols-[minmax(0,1fr)_260px] md:gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-2xl border border-transparent bg-white/20 p-1">
          <TrendingFeedGrid posts={posts} />
        </div>

        <LocalBusinessesPanel businesses={localBusinesses} />
      </div>

      <footer className="mt-16 border-t border-black/10 pt-7">
        <nav className="font-reddit flex flex-wrap gap-x-5 gap-y-3 text-[11px] font-extrabold uppercase tracking-figma-tight text-black/80 sm:text-[13px]">
          <Link href="#">Advertising</Link>
          <Link href="#">What We Do</Link>
          <Link href="#">Data Analytic Process</Link>
          <Link href="#">Legal</Link>
          <Link href="#">Privacy Policy</Link>
        </nav>
        <div className="mt-8 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="font-reddit tracking-figma-tight mb-2 text-[10px] font-extrabold leading-[1.4] text-black sm:text-[14px]">
              INTERNET CULTURE IS COMEDY GOLD
            </p>
            <BrandLogo />
          </div>
          <p className="font-roboto-mono self-end text-right text-[10.5px] leading-[1.4] tracking-[-0.03em] text-[#485c11] sm:text-[12px]">
            © Negosyante Island Inc. 2025
            <br />
            All Rights Reserved
          </p>
        </div>
      </footer>
    </section>
  );
}

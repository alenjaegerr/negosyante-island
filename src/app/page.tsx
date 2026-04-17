import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { localBusinesses } from "@/lib/local-businesses";
import { LocalBusinessesPanel } from "@/components/local-businesses-panel";
import { Role } from "@prisma/client";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === Role.admin) redirect("/admin");
    if (user.role === Role.business_pending || user.role === Role.business_verified) {
      redirect("/business/home");
    }
    redirect("/feed");
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-3 pb-10 pt-3 sm:px-4 md:pt-6">
      <div className="font-roboto-mono inline-flex items-center rounded-full bg-zinc-500 px-4 py-2 text-[11px] font-bold tracking-figma-tight text-white md:text-base">
        Updated April 10, 2026 <span className="ml-2 text-red-300">• LIVE</span>
      </div>

      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full lg:max-w-[64%]">
          <h1 className="font-flex-bold text-5xl leading-[0.95] tracking-tight text-black sm:text-6xl md:text-[80px]">
            TRENDING <span className="align-middle">🔥</span>
          </h1>
        </div>

        <aside className="w-full rounded border-2 border-cyan-600 bg-white p-3 sm:max-w-[280px]">
          <h2 className="font-reddit text-xl font-extrabold tracking-tight text-black sm:text-2xl">TODAY&apos;S SPONSOR</h2>
          <p className="mt-1 text-center text-3xl font-black text-red-600">RedBull</p>
          <p className="font-reddit text-center text-xs font-bold tracking-[0.16em] text-red-500">ENERGY DRINK</p>
        </aside>
      </div>

      <div className="mt-6 md:grid md:grid-cols-[minmax(0,1fr)_260px] md:gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <article className="rounded border-[3px] border-cyan-400 bg-black p-3 text-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-2">
              <p className="font-flex-bold text-sm tracking-figma-tight">TikTok <span className="text-cyan-300">#tiktokph</span></p>
              <p className="rounded-full bg-white/90 px-3 py-0.5 text-xs font-bold text-red-600">🔥HOT</p>
            </div>
            <h3 className="font-flex-bold mt-2 text-3xl tracking-tight sm:text-[42px]">Hawak mo ang beat 🪩</h3>
            <p className="font-flex-bold mt-2 max-w-2xl text-sm text-zinc-100 sm:text-base">
              TikTok user Ian Mark Dance Challenge trending on tiktok Philippines.
            </p>
            <p className="font-flex-bold mt-3 text-sm text-cyan-300 underline">https://www.tiktok.com/@bosswasaktv/video/7612160397570936085</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1.25fr_1fr]">
              <div className="min-h-52 rounded-xl border border-zinc-600 bg-[linear-gradient(120deg,#4b5563,#9ca3af,#6b7280)]" />
              <div className="flex items-end justify-between sm:flex-col sm:items-start">
                <p className="font-flex-extrabold text-base leading-[1.32] text-zinc-300">Interesting... 👀<br />(read more)</p>
                <button className="rounded-full border-[3px] border-violet-700 bg-amber-200 px-4 py-1 text-xs font-black text-zinc-900 shadow-[3px_0_0_0_#ff4d00]">
                  Negosyante Insight ⚡
                </button>
              </div>
            </div>
          </article>

          <article className="rounded border border-cyan-700 bg-cyan-600/80 p-3 text-white">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold">
                🌐 The Internet
                <br />
                <span className="text-yellow-100">#usgovernment</span>
              </p>
              <p className="rounded-full bg-white/90 px-3 py-0.5 text-sm font-bold text-red-600">🔥67</p>
            </div>
            <h3 className="font-flex-bold mt-2 text-3xl tracking-tight">Me with my Bro 🧑‍🤝‍🧑</h3>
            <p className="font-flex-bold mt-2 max-w-2xl text-sm text-zinc-50 sm:text-base">
              Social trend snapshots and internet culture analysis curated for Filipino users and verified businesses.
            </p>
            <p className="mt-3 text-sm font-bold text-lime-100 underline">Visit website: ww.jmail.world</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1.25fr_1fr]">
              <div className="min-h-40 rounded-xl border border-zinc-400 bg-[linear-gradient(140deg,#94a3b8,#e2e8f0)]" />
              <div className="flex items-end justify-between sm:flex-col sm:items-start">
                <p className="font-flex-extrabold text-base leading-[1.32] text-zinc-100">Interesting... 👀<br />(read more)</p>
                <button className="rounded-full border-[3px] border-violet-700 bg-amber-200 px-4 py-1 text-xs font-black text-zinc-900 shadow-[3px_0_0_0_#ff4d00]">
                  Negosyante Insight
                </button>
              </div>
            </div>
          </article>
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

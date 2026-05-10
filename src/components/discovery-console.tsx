"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LocalBusiness } from "@/lib/local-businesses";
import type { TrendingPostCard } from "@/lib/trending-posts";

type DiscoveryConsoleProps = {
  posts: TrendingPostCard[];
  businesses: LocalBusiness[];
};

type DiscoverySection = {
  id: string;
  label: string;
  title: string;
  blurb: string;
  preferredCategories: TrendingPostCard["category"][];
  tone: string;
  glow: string;
};

const fallbackStoryImage = "/trending/hawak-mo-ang-beat.svg";

const categoryLabelMap: Record<TrendingPostCard["category"], string> = {
  tiktok: "TikTok",
  the_internet: "The Internet",
  youtube: "YouTube",
  facebook: "Facebook",
  reddit: "Reddit",
  x: "X",
  instagram: "Instagram",
};

const discoverySections: DiscoverySection[] = [
  {
    id: "trending-now",
    label: "MAIN STAGE",
    title: "Trending Now",
    blurb: "A hero lane that breathes with the strongest story on the board.",
    preferredCategories: [],
    tone: "from-cyan-500/35 via-sky-500/10 to-transparent",
    glow: "shadow-cyan-500/20",
  },
  {
    id: "youtube",
    label: "CHANNEL ONE",
    title: "YouTube",
    blurb: "Longer-form posts and creator updates that inform immediately.",
    preferredCategories: ["youtube"],
    tone: "from-red-500/30 via-orange-500/10 to-transparent",
    glow: "shadow-red-500/20",
  },
  {
    id: "tiktok",
    label: "CHANNEL TWO",
    title: "TikTok",
    blurb: "Fast, punchy culture signals with motion-heavy hooks.",
    preferredCategories: ["tiktok"],
    tone: "from-fuchsia-500/30 via-pink-500/10 to-transparent",
    glow: "shadow-fuchsia-500/20",
  },
  {
    id: "instagram",
    label: "CHANNEL THREE",
    title: "Instagram",
    blurb: "Visual-first story boxes with image-led framing.",
    preferredCategories: ["instagram"],
    tone: "from-fuchsia-500/25 via-rose-500/10 to-transparent",
    glow: "shadow-pink-500/20",
  },
  {
    id: "facebook",
    label: "CHANNEL FOUR",
    title: "Facebook",
    blurb: "Community posts and familiar formats with broad reach.",
    preferredCategories: ["facebook"],
    tone: "from-blue-500/30 via-sky-500/10 to-transparent",
    glow: "shadow-blue-500/20",
  },
  {
    id: "x-feed",
    label: "CHANNEL FIVE",
    title: "X",
    blurb: "Short bursts and breaking updates with a direct tone.",
    preferredCategories: ["x"],
    tone: "from-zinc-300/30 via-zinc-500/10 to-transparent",
    glow: "shadow-zinc-500/20",
  },
  {
    id: "reddit",
    label: "CHANNEL SIX",
    title: "Reddit",
    blurb: "Threaded conversation energy and community reactions.",
    preferredCategories: ["reddit"],
    tone: "from-orange-500/30 via-amber-500/10 to-transparent",
    glow: "shadow-orange-500/20",
  },
  {
    id: "internet",
    label: "CHANNEL SEVEN",
    title: "The Internet",
    blurb: "The broadest feed: internet culture, commentary, and quick context.",
    preferredCategories: ["the_internet"],
    tone: "from-sky-500/30 via-cyan-500/10 to-transparent",
    glow: "shadow-sky-500/20",
  },
  {
    id: "for-you",
    label: "CHANNEL EIGHT",
    title: "For You",
    blurb: "The strongest mixed feed, balanced across all categories.",
    preferredCategories: [],
    tone: "from-emerald-500/20 via-teal-500/10 to-transparent",
    glow: "shadow-emerald-500/20",
  },
  {
    id: "deep-dive",
    label: "CHANNEL NINE",
    title: "Deep Dive",
    blurb: "Insight-ready posts with extra context for the user to explore.",
    preferredCategories: [],
    tone: "from-indigo-500/25 via-violet-500/10 to-transparent",
    glow: "shadow-indigo-500/20",
  },
];

function stableDateLabel(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function pickPosts(posts: TrendingPostCard[], preferredCategories: TrendingPostCard["category"][], count: number, offset = 0) {
  const filtered = preferredCategories.length ? posts.filter((post) => preferredCategories.includes(post.category)) : posts;
  const source = filtered.length ? filtered : posts;
  if (!source.length) return [] as TrendingPostCard[];

  const selected: TrendingPostCard[] = [];
  for (let index = 0; index < count; index += 1) {
    selected.push(source[(offset + index) % source.length]);
  }
  return selected;
}

function sectionSeed(section: DiscoverySection, posts: TrendingPostCard[]) {
  const count = section.id === "trending-now" ? 8 : section.id === "deep-dive" ? 6 : 5;
  const offset = discoverySections.findIndex((candidate) => candidate.id === section.id) * 2;
  return pickPosts(posts, section.preferredCategories, count, offset);
}

function StoryRailCard({ post, active }: { post: TrendingPostCard; active: boolean }) {
  const imageSrc = post.imageUrl || fallbackStoryImage;
  return (
    <article
      className={`group relative h-full min-h-[22rem] overflow-hidden rounded-[1.75rem] border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] transition duration-500 ${
        active ? "opacity-100 shadow-2xl" : "opacity-80"
      }`}
    >
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 90vw, 30vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
      </div>

      <div className="relative flex h-full min-h-[22rem] flex-col justify-end p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/20 bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90">
            {categoryLabelMap[post.category]}
          </span>
          <span className="rounded-full border border-white/20 bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90">
            {post.isInsightReady ? "Insight ready" : "Story box"}
          </span>
        </div>

        <h3 className="text-2xl font-black leading-[0.95] tracking-tight text-white sm:text-[2rem]">{post.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-white/82">{post.snippet}</p>

        <div className="mt-5 flex items-center justify-between gap-3 text-xs text-white/72">
          <span>{stableDateLabel(post.createdAt)}</span>
          <Link
            href={`/trending/${post.id}/insight`}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-semibold text-white transition hover:bg-white/20"
          >
            Open story
          </Link>
        </div>
      </div>
    </article>
  );
}

export function DiscoveryConsole({ posts }: DiscoveryConsoleProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIndexRef = useRef(0);
  const wheelLockRef = useRef<number | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  const heroPool = useMemo(() => {
    const base = posts.length ? posts : [];
    return base.length ? [...base] : [];
  }, [posts]);

  const heroCards = useMemo(() => {
    const pool = heroPool.length ? heroPool : posts;
    return pool.slice(0, Math.max(6, Math.min(pool.length, 10)));
  }, [heroPool, posts]);

  const sections = useMemo(() => discoverySections.map((section) => ({ ...section, posts: sectionSeed(section, posts) })), [posts]);

  const activeHero = heroCards.length ? heroCards[heroIndex % heroCards.length] : posts[0];

  const getSectionTransform = (sectionIndex: number) => {
    const distance = sectionIndex - activeSectionIndex;

    if (distance === 0) {
      return "translate-y-0 scale-100 opacity-100 z-30";
    }

    if (distance === -1) {
      return "-translate-y-[32vh] scale-[0.88] opacity-55 z-20";
    }

    if (distance === 1) {
      return "translate-y-[32vh] scale-[0.88] opacity-55 z-20";
    }

    return `${distance < 0 ? "-translate-y-[58vh]" : "translate-y-[58vh]"} scale-[0.82] opacity-0 z-0 pointer-events-none`;
  };

  useEffect(() => {
    if (heroCards.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroCards.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [heroCards.length]);

  useEffect(() => {
    activeIndexRef.current = activeSectionIndex;
  }, [activeSectionIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        const indexValue = visible?.target.getAttribute("data-section-index");
        if (!indexValue) return;

        const index = Number(indexValue);
        if (!Number.isNaN(index)) {
          setActiveSectionIndex(index);
        }
      },
      { threshold: [0.35, 0.55, 0.75] },
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [sections.length]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const shell = shellRef.current;
      if (!shell || !shell.contains(event.target as Node)) return;
      if (Math.abs(event.deltaY) < 8) return;

      event.preventDefault();

      if (wheelLockRef.current !== null) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.min(Math.max(activeIndexRef.current + direction, 0), sections.length - 1);
      if (nextIndex === activeIndexRef.current) return;

      wheelLockRef.current = window.setTimeout(() => {
        wheelLockRef.current = null;
      }, 700);

      sectionRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSectionIndex(nextIndex);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel as EventListener);
  }, [sections.length]);

  return (
    <div ref={shellRef} className="mx-auto w-full max-w-8xl px-3 sm:px-6 lg:px-8">
      <div className="mt-4 sm:mt-5">
        <div className="overflow-hidden rounded-[2rem] border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)]/92 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.15)] backdrop-blur sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="flex flex-col justify-between gap-5">
              <div>
                <div className="font-roboto-mono inline-flex items-center rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-1.5 text-[10px] font-bold tracking-figma-tight text-[var(--ni-text-strong)] sm:text-[11px] md:text-base">
                  Scroll-locked discovery guide
                </div>
                <h1 className="mt-4 max-w-xl font-flex-bold text-[clamp(2.8rem,7vw,5.8rem)] leading-[0.92] tracking-tight text-[var(--ni-text-strong)]">
                  TRENDING <span className="align-middle">🔥</span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--ni-text)] sm:text-base">
                  The top hero moves away with the page. The category stack below keeps three rails visible at once, with the active rail centered.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {sections.slice(0, 5).map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                      index === activeSectionIndex
                        ? "border-[color:var(--ni-brand)] bg-[var(--ni-brand)] text-[var(--ni-surface-1)]"
                        : "border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] text-[var(--ni-text-strong)] hover:border-[color:var(--ni-brand)]"
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)]/70 shadow-2xl">
              <div className="absolute inset-0">
                <Image
                  key={activeHero?.id ?? activeSectionIndex}
                  src={activeHero?.imageUrl || fallbackStoryImage}
                  alt={activeHero?.title ?? "Negosyante Island discovery hero"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/35 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-t ${sections[activeSectionIndex]?.tone ?? "from-cyan-500/25 via-transparent to-transparent"}`} />
              </div>

              <div className="relative flex h-full min-h-[26rem] flex-col justify-end p-5 sm:p-6 lg:min-h-[32rem]">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
                    {activeSectionIndex === 0 ? "Main stage" : sections[activeSectionIndex]?.label ?? "Channel"}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
                    Background rotates every 5s
                  </span>
                </div>
                <h2 className="max-w-lg text-3xl font-black leading-[0.95] tracking-tight text-white sm:text-4xl">
                  {activeHero?.title ?? "A live story box for the island"}
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/82 sm:text-base">
                  {activeHero?.snippet ?? "Stories, insights, and category rails that lock into a console-like browse flow."}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="#trending-now"
                    className="rounded-full bg-[var(--ni-brand)] px-4 py-2.5 text-sm font-semibold text-[var(--ni-surface-1)] transition hover:bg-[var(--ni-brand-cta)]"
                  >
                    Start browsing
                  </Link>
                  <Link
                    href="/admin"
                    className="rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/16"
                  >
                    Open publisher
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 pt-6 sm:pt-8 lg:pt-10">
        {sections.map((section, sectionIndex) => {
          const sectionPosts = section.posts;
          const sectionActive = sectionIndex === activeSectionIndex;

          return (
            <section
              key={section.id}
              id={section.id}
              ref={(node) => {
                sectionRefs.current[sectionIndex] = node;
              }}
              data-section-index={sectionIndex}
              className="min-h-[110vh] scroll-mt-6 pt-2 sm:pt-4"
            >
              <div
                className={`sticky top-20 rounded-[2rem] border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)]/88 p-4 shadow-[0_20px_64px_rgba(15,23,42,0.08)] transition-all duration-700 sm:p-5 lg:p-6 ${getSectionTransform(
                  sectionIndex,
                )} ${section.glow}`}
              >
                <div className={`rounded-[1.5rem] bg-gradient-to-r ${section.tone} p-4 sm:p-5`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="font-roboto-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ni-muted)]">
                        {section.label}
                      </p>
                      <h2 className="mt-1 text-3xl font-black leading-[0.95] tracking-tight text-[var(--ni-text-strong)] sm:text-4xl">
                        {section.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ni-text)] sm:text-base">
                        {section.blurb}
                      </p>
                    </div>

                    <div className="flex gap-2 self-start">
                      <span className="rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ni-text-strong)]">
                        {sectionPosts.length} stories
                      </span>
                      <span className="rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ni-text-strong)]">
                        Scroll locks on
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`mt-4 overflow-x-auto pb-2 transition duration-700 ${sectionActive ? "opacity-100" : "opacity-75"}`}>
                  <div className="flex min-w-max gap-4 pr-2 snap-x snap-mandatory">
                    {sectionPosts.map((post, postIndex) => (
                      <div key={`${section.id}-${post.id}-${postIndex}`} className="w-[18rem] shrink-0 snap-start sm:w-[20rem] lg:w-[22rem]">
                        <StoryRailCard post={post} active={sectionActive} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
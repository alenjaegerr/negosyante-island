"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { TrendCategory } from "@prisma/client";
import { buildTrendingMediaPreview } from "@/lib/trending-media";
import type { TrendingPostCard } from "@/lib/trending-posts";

type TrendingFeedGridProps = {
  posts: TrendingPostCard[];
};

type CategoryMeta = {
  label: string;
  railTitle: string;
  shortLabel: string;
  fallbackImage: string;
  badge: string;
  border: string;
  glow: string;
  dot: string;
  heroWash: string;
  cardWash: string;
};

type RailGroup = {
  category: TrendCategory;
  posts: TrendingPostCard[];
  primaryCount: number;
};

type ScrollPulse = "up" | "down" | null;

const fallbackA = "/trending/hawak-mo-ang-beat.svg";
const fallbackB = "/trending/me-and-my-bro.svg";

const categoryMeta: Record<TrendCategory, CategoryMeta> = {
  tiktok: {
    label: "TikTok",
    railTitle: "TikTok Signals",
    shortLabel: "TikTok",
    fallbackImage: fallbackB,
    badge: "border-cyan-300/30 bg-cyan-300/10 text-cyan-50",
    border: "border-cyan-300/40",
    glow: "shadow-cyan-400/10",
    dot: "bg-cyan-300",
    heroWash: "from-cyan-300/30 via-fuchsia-400/20 to-transparent",
    cardWash: "from-cyan-300/25 via-fuchsia-400/10 to-transparent",
  },
  the_internet: {
    label: "The Internet",
    railTitle: "Internet Culture Signals",
    shortLabel: "Internet",
    fallbackImage: fallbackA,
    badge: "border-sky-300/30 bg-sky-300/10 text-sky-50",
    border: "border-sky-300/40",
    glow: "shadow-sky-400/10",
    dot: "bg-sky-300",
    heroWash: "from-sky-300/30 via-emerald-300/10 to-transparent",
    cardWash: "from-sky-300/20 via-emerald-300/10 to-transparent",
  },
  youtube: {
    label: "YouTube",
    railTitle: "YouTube Signals",
    shortLabel: "YouTube",
    fallbackImage: fallbackA,
    badge: "border-red-300/30 bg-red-400/10 text-red-50",
    border: "border-red-300/40",
    glow: "shadow-red-500/10",
    dot: "bg-red-300",
    heroWash: "from-red-400/30 via-amber-300/20 to-transparent",
    cardWash: "from-red-400/20 via-amber-300/10 to-transparent",
  },
  facebook: {
    label: "Facebook",
    railTitle: "Facebook Community Signals",
    shortLabel: "Facebook",
    fallbackImage: fallbackB,
    badge: "border-blue-300/30 bg-blue-300/10 text-blue-50",
    border: "border-blue-300/40",
    glow: "shadow-blue-400/10",
    dot: "bg-blue-300",
    heroWash: "from-blue-300/30 via-teal-300/10 to-transparent",
    cardWash: "from-blue-300/20 via-teal-300/10 to-transparent",
  },
  reddit: {
    label: "Reddit",
    railTitle: "Reddit Thread Signals",
    shortLabel: "Reddit",
    fallbackImage: fallbackB,
    badge: "border-orange-300/30 bg-orange-300/10 text-orange-50",
    border: "border-orange-300/40",
    glow: "shadow-orange-400/10",
    dot: "bg-orange-300",
    heroWash: "from-orange-300/30 via-rose-300/10 to-transparent",
    cardWash: "from-orange-300/20 via-rose-300/10 to-transparent",
  },
  x: {
    label: "X",
    railTitle: "X Signal Bursts",
    shortLabel: "X",
    fallbackImage: fallbackA,
    badge: "border-zinc-200/30 bg-zinc-100/10 text-zinc-50",
    border: "border-zinc-200/40",
    glow: "shadow-zinc-300/10",
    dot: "bg-zinc-100",
    heroWash: "from-zinc-100/25 via-cyan-300/10 to-transparent",
    cardWash: "from-zinc-100/20 via-cyan-300/10 to-transparent",
  },
  instagram: {
    label: "Instagram",
    railTitle: "Instagram Visual Signals",
    shortLabel: "Instagram",
    fallbackImage: fallbackB,
    badge: "border-pink-300/30 bg-pink-300/10 text-pink-50",
    border: "border-pink-300/40",
    glow: "shadow-pink-400/10",
    dot: "bg-pink-300",
    heroWash: "from-pink-300/30 via-violet-300/20 to-transparent",
    cardWash: "from-pink-300/20 via-violet-300/10 to-transparent",
  },
};

const categoryOrder: TrendCategory[] = [
  "the_internet",
  "tiktok",
  "youtube",
  "instagram",
  "facebook",
  "reddit",
  "x",
];

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatStableDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "New";

  const month = monthLabels[date.getUTCMonth()] ?? "New";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${month} ${day}, ${year}`;
}

function getReadableText(post: TrendingPostCard) {
  return (post.content ?? "").trim() || (post.snippet ?? "").trim();
}

function buildRailGroups(posts: TrendingPostCard[]) {
  return categoryOrder
    .map((category, categoryIndex) => {
      const primaryPosts = posts.filter((post) => post.category === category);
      if (!primaryPosts.length) return null;

      const seen = new Set(primaryPosts.map((post) => post.id));
      const supportingPosts = posts
        .slice(categoryIndex)
        .concat(posts.slice(0, categoryIndex))
        .filter((post) => !seen.has(post.id));

      return {
        category,
        primaryCount: primaryPosts.length,
        posts: [...primaryPosts, ...supportingPosts].slice(0, Math.min(posts.length, 8)),
      };
    })
    .filter((group): group is RailGroup => Boolean(group))
    .filter((group) => group.posts.length > 0);
}

function buildFeaturedPosts(posts: TrendingPostCard[]) {
  const seen = new Set<string>();
  const ordered = [
    ...posts.filter((post) => post.imageUrl && post.isInsightReady),
    ...posts.filter((post) => post.imageUrl),
    ...posts.filter((post) => post.isInsightReady),
    ...posts,
  ];

  return ordered.filter((post) => {
    if (seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  }).slice(0, 6);
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M8 5.75V18.25L18 12L8 5.75Z" fill="currentColor" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M18 15L18.7 17.3L21 18L18.7 18.7L18 21L17.3 18.7L15 18L17.3 17.3L18 15Z" fill="currentColor" />
    </svg>
  );
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

function VisualImage({
  src,
  alt,
  priority = false,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  if (src.startsWith("/")) {
    return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className={`absolute inset-0 h-full w-full ${className ?? ""}`}
    />
  );
}

export function TrendingFeedGrid({ posts }: TrendingFeedGridProps) {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [heroMode, setHeroMode] = useState<"full" | "min" | "hidden">("full");
  const grouped = useMemo(() => buildRailGroups(posts), [posts]);
  const featuredPosts = useMemo(() => buildFeaturedPosts(posts), [posts]);

  if (!posts.length) {
    return (
      <article className="rounded-2xl border border-dashed border-white/20 bg-white/[0.04] p-8 text-center text-sm text-white/70">
        No cultural signals have been published yet.
      </article>
    );
  }

  return (
    <div className="relative">
      <TrendingHeroPanel posts={featuredPosts} reducedMotion={reducedMotion} groups={grouped} mode={heroMode} />
      <TrendingRailStage
        groups={grouped}
        expanded={expanded}
        setExpanded={setExpanded}
        reducedMotion={reducedMotion}
        onProgressChange={(value) => {
          const nextMode = value < 0.5 ? "full" : value < 1.5 ? "min" : "hidden";
          setHeroMode((current) => (current === nextMode ? current : nextMode));
        }}
      />
    </div>
  );
}

function TrendingRailStage({
  groups,
  expanded,
  setExpanded,
  reducedMotion,
  onProgressChange,
}: {
  groups: RailGroup[];
  expanded: Record<string, boolean>;
  setExpanded: Dispatch<SetStateAction<Record<string, boolean>>>;
  reducedMotion: boolean;
  onProgressChange?: (value: number) => void;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const snapLockRef = useRef<number | null>(null);
  const snapTimeoutRef = useRef<number | null>(null);
  const railHeightRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const pulseTimerRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [scrollPulse, setScrollPulse] = useState<ScrollPulse>(null);
  const railStep = 300;
  const activeIndex = Math.max(0, Math.min(groups.length - 1, Math.round(progress)));
  const activeCategory = groups[activeIndex]?.category;
  const heroMode = progress < 0.5 ? "full" : progress < 1.5 ? "min" : "hidden";
  const railHeaderOffset = heroMode === "full" ? 0 : heroMode === "min" ? 10 : 16;
  const baseOffset = railHeightRef.current ? railHeightRef.current / 2 : 220;

  useEffect(() => {
    if (!groups.length) return undefined;

    let animationFrame = 0;

    const updateProgress = () => {
      animationFrame = 0;
      const stage = stageRef.current;
      if (!stage) return;

      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      const nextProgress = Math.max(0, Math.min(groups.length - 1, (window.scrollY - stageTop) / railStep));
      setProgress((current) => (Math.abs(current - nextProgress) < 0.01 ? current : nextProgress));
      if (onProgressChange) onProgressChange(nextProgress);
    };

    const requestUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [groups.length]);

  useEffect(() => {
    if (!groups.length) return undefined;

    const handleWheel = (event: WheelEvent) => {
      const stage = stageRef.current;
      if (!stage || !stage.contains(event.target as Node)) return;
      if (Math.abs(event.deltaY) < 6) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const target = event.target as HTMLElement | null;
      if (target && target.closest("[data-rail-scroller='true']")) return;

      event.preventDefault();
      if (snapLockRef.current) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(groups.length - 1, activeIndex + direction));
      if (nextIndex === activeIndex) return;

      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      const targetY = stageTop + nextIndex * railStep;

      snapLockRef.current = window.setTimeout(() => {
        snapLockRef.current = null;
      }, 720);

      window.scrollTo({ top: targetY, behavior: reducedMotion ? "auto" : "smooth" });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel as EventListener);
      if (snapLockRef.current) window.clearTimeout(snapLockRef.current);
    };
  }, [activeIndex, groups.length, railStep, reducedMotion]);

  useEffect(() => {
    if (!groups.length) return undefined;

    const handleSnap = () => {
      if (snapTimeoutRef.current) window.clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = window.setTimeout(() => {
        const stage = stageRef.current;
        if (!stage || snapLockRef.current) return;

        const stageTop = stage.getBoundingClientRect().top + window.scrollY;
        const targetIndex = Math.round(progress);
        const targetY = stageTop + targetIndex * railStep;
        if (Math.abs(window.scrollY - targetY) < 2) return;

        window.scrollTo({ top: targetY, behavior: reducedMotion ? "auto" : "smooth" });
      }, 220);
    };

    window.addEventListener("scroll", handleSnap, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleSnap as EventListener);
      if (snapTimeoutRef.current) window.clearTimeout(snapTimeoutRef.current);
    };
  }, [groups.length, progress, railStep, reducedMotion]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScrollPulse = () => {
      const delta = window.scrollY - lastScrollYRef.current;
      if (Math.abs(delta) < 3) return;

      lastScrollYRef.current = window.scrollY;
      setScrollPulse(delta > 0 ? "down" : "up");

      if (pulseTimerRef.current) {
        window.clearTimeout(pulseTimerRef.current);
      }

      pulseTimerRef.current = window.setTimeout(() => {
        setScrollPulse(null);
      }, 420);
    };

    window.addEventListener("scroll", handleScrollPulse, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScrollPulse);
      if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current);
    };
  }, []);

  return (
    <section
      ref={stageRef}
      aria-label="Cultural signal rails"
      className="relative mt-6"
      style={{ height: `calc(100vh + ${Math.max(0, groups.length - 1) * railStep}px)` }}
    >
      <div className="sticky top-[4.75rem] h-[calc(100vh-5rem)] min-h-[39rem] overflow-hidden rounded-[1.5rem] bg-black/20 shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_48%,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_84%_58%,rgba(251,191,36,0.09),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-32 bg-gradient-to-b from-[#07080d] via-[#07080d]/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-32 bg-gradient-to-t from-[#07080d] via-[#07080d]/80 to-transparent" />
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-50 h-44 bg-gradient-to-b from-cyan-200/10 to-transparent transition-opacity duration-300 ${
            scrollPulse === "up" ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-50 h-44 bg-gradient-to-t from-amber-200/10 to-transparent transition-opacity duration-300 ${
            scrollPulse === "down" ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="absolute inset-x-0 top-[50%] z-10" style={{ marginTop: `${railHeaderOffset}px` }}>
          {groups.map((group, index) => {
            const distance = index - progress;
            const absoluteDistance = Math.abs(distance);
            const scale = reducedMotion ? 1 : Math.max(0.9, 1 - absoluteDistance * 0.09);
            const headerScale = reducedMotion ? 1 : Math.max(0.7, 1 - absoluteDistance * 0.14);
            const headerOpacity = reducedMotion ? 1 : Math.max(0.2, 1 - absoluteDistance * 0.45);
            const opacity =
              absoluteDistance < 0.45
                ? 1
                : absoluteDistance < 1.25
                  ? 0.24
                  : 0.07;
            const brightness =
              absoluteDistance < 0.45
                ? 1
                : absoluteDistance < 1.25
                  ? 0.48
                  : 0.34;
            const translateY = distance * railStep;
            const isActive = index === activeIndex;
            const heroOffset = heroMode === "full" ? 0 : heroMode === "min" ? 40 : 70;

            return (
              <div
                key={group.category}
                className={`absolute inset-x-0 px-5 transition-[opacity,transform,filter] duration-500 ease-out motion-reduce:transition-none ${
                  absoluteDistance > 1.6 ? "pointer-events-none" : ""
                } ${
                  isActive ? "" : "saturate-[0.45]"
                }`}
                ref={index === activeIndex ? (node) => {
                  if (node) railHeightRef.current = node.getBoundingClientRect().height;
                } : null}
                style={{
                  opacity,
                  zIndex: Math.round(100 - absoluteDistance * 10),
                  filter: `brightness(${brightness})`,
                  transform: `translate3d(0, ${translateY + heroOffset - baseOffset}px, 0) scale(${scale})`,
                }}
              >
                <div
                  className="mb-6"
                  style={{ opacity: headerOpacity, transform: `scale(${headerScale})`, transformOrigin: "left center" }}
                >
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h1 className="font-roboto-mono text-3xl font-bold uppercase tracking-[0.28em] text-white/95 sm:text-4xl">
                      {categoryMeta[group.category].label}
                    </h1>
                    <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-xs font-semibold text-white/70 backdrop-blur">
                      Trending
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-xs font-semibold text-white/70 backdrop-blur">
                      {group.primaryCount} signals
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
                    {categoryMeta[group.category].railTitle}
                  </p>
                </div>
                <TrendingRail
                  group={group}
                  isActive={isActive}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  reducedMotion={reducedMotion}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrendingHeroPanel({
  posts,
  groups,
  reducedMotion,
  mode,
}: {
  posts: TrendingPostCard[];
  groups: RailGroup[];
  reducedMotion: boolean;
  mode: "full" | "min" | "hidden";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const safeActiveIndex = posts.length ? activeIndex % posts.length : 0;
  const current = posts[safeActiveIndex];
  const activeMeta = current ? categoryMeta[current.category] : categoryMeta.the_internet;
  const text = current ? getReadableText(current) || current.snippet : "";
  const heroImage = current?.imageUrl || activeMeta.fallbackImage;

  const goTo = useCallback((nextIndex: number) => {
    if (!posts.length) return;
    setActiveIndex((posts.length + nextIndex) % posts.length);
  }, [posts.length]);

  useEffect(() => {
    if (posts.length <= 1 || paused || reducedMotion) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % posts.length);
    }, 6200);

    return () => window.clearInterval(interval);
  }, [paused, posts.length, reducedMotion]);

  if (!current) return null;

  return (
    <section
      className={`group/hero relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#101016] shadow-2xl transition-[max-height,opacity,transform] duration-500 ease-out ${activeMeta.glow} ${
        mode === "full"
          ? "max-h-[38rem] opacity-100"
          : mode === "min"
            ? "max-h-[14rem] opacity-90 scale-[0.98]"
            : "pointer-events-none max-h-0 opacity-0 scale-[0.96]"
      }`}
      aria-label="Featured cultural signals"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="absolute inset-0">
        <VisualImage
          key={current.id}
          src={heroImage}
          alt=""
          priority
          sizes="(max-width: 1024px) 100vw, 1440px"
          className={`object-cover transition duration-700 ${reducedMotion ? "" : "scale-[1.015] group-hover/hero:scale-[1.04]"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-black/25" />
        <div className={`absolute inset-0 bg-gradient-to-br ${activeMeta.heroWash}`} />
      </div>

      <div className={`relative px-5 py-6 transition-[padding,transform] duration-500 sm:px-7 lg:px-10 ${
        mode === "full" ? "min-h-[27rem] lg:min-h-[30rem] lg:py-8" : "min-h-[10rem]"
      }`}>
        <div className={`flex h-full flex-col justify-between gap-7 ${mode === "full" ? "min-h-[23rem] lg:min-h-[26rem]" : "min-h-[8rem]"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${activeMeta.badge}`}>
                <span className={`h-2 w-2 rounded-full ${activeMeta.dot}`} aria-hidden="true" />
                {activeMeta.label}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/75">
                Signal Browser
              </span>
            </div>

            <div className="hidden flex-wrap gap-2 md:flex">
              {groups.slice(0, 5).map((group) => (
                <Link
                  key={group.category}
                  href={`#rail-${group.category}`}
                  className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  {categoryMeta[group.category].shortLabel}
                </Link>
              ))}
            </div>
          </div>

          <div className="max-w-3xl">
            <h2 className="text-3xl font-black leading-[0.96] text-white sm:text-4xl lg:text-6xl">
              {current.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 lg:text-lg">
              {text.length > 190 ? `${text.slice(0, 190).trim()}...` : text}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {current.isInsightReady ? (
                <Link
                  href={`/trending/${current.id}/insight`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[#08090e] transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                >
                  <SparkIcon />
                  Negosyante Insight
                </Link>
              ) : null}
              <Link
                href={`#rail-${current.category}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2.5 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/[0.14] focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <PlayIcon />
                Browse Rail
              </Link>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="flex max-w-xl flex-wrap gap-2">
              {posts.map((post, index) => (
                <button
                  key={post.id}
                  type="button"
                  aria-label={`Show featured signal ${index + 1}`}
                  aria-current={index === safeActiveIndex ? "true" : undefined}
                  onClick={() => goTo(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === safeActiveIndex ? "w-9 bg-white" : "w-2.5 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            {posts.length > 1 ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous featured signal"
                  onClick={() => goTo(activeIndex - 1)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  aria-label="Next featured signal"
                  onClick={() => goTo(activeIndex + 1)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrendingRail({
  group,
  isActive,
  expanded,
  setExpanded,
  reducedMotion,
}: {
  group: RailGroup;
  isActive: boolean;
  expanded: Record<string, boolean>;
  setExpanded: Dispatch<SetStateAction<Record<string, boolean>>>;
  reducedMotion: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const meta = categoryMeta[group.category];

  const scrollRail = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction * Math.max(320, scroller.clientWidth * 0.78),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      id={`rail-${group.category}`}
      aria-labelledby={`rail-heading-${group.category}`}
      className="scroll-mt-28"
    >
      <div
        className={`relative overflow-hidden rounded-[1.25rem] bg-transparent shadow-2xl ${meta.glow} ${
          isActive ? "" : "saturate-[0.82]"
        }`}
      >
        <div className="relative px-3 py-2.5 sm:px-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden="true" />
                  {meta.label}
                </span>
                {isActive ? (
                  <span className="rounded-full border border-white/20 bg-white/[0.08] px-2.5 py-1 text-xs font-semibold text-white/80">
                    Selected
                  </span>
                ) : null}
              </div>
              <h2 id={`rail-heading-${group.category}`} className="text-xl font-black leading-none text-white sm:text-[1.4rem]">
                {meta.railTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/60 sm:inline-flex">
                {group.primaryCount} native signals
              </span>
              <button
                type="button"
                aria-label={`Move ${meta.label} rail left`}
                onClick={() => scrollRail(-1)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/25 text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                aria-label={`Move ${meta.label} rail right`}
                onClick={() => scrollRail(1)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/25 text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={scrollerRef}
              role="list"
              data-rail-scroller="true"
              className="no-scrollbar flex snap-x snap-mandatory gap-7 overflow-x-auto scroll-smooth pb-1.5 pr-[22vw] motion-reduce:scroll-auto"
            >
              {group.posts.map((post) => {
                const isPortrait = post.category === "instagram" || post.category === "tiktok";

                return (
                  <div
                    key={`${group.category}-${post.id}`}
                    role="listitem"
                    className={`min-w-0 shrink-0 snap-start ${
                      isPortrait
                        ? "basis-[11.5rem] sm:basis-[12.5rem] lg:basis-[13.5rem] xl:basis-[14.5rem]"
                        : "basis-[15.5rem] sm:basis-[16.5rem] lg:basis-[17.5rem] xl:basis-[18.5rem]"
                    }`}
                  >
                    <TrendingCard post={post} expanded={expanded} setExpanded={setExpanded} />
                  </div>
                );
              })}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#101015] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#101015] to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrendingCard({
  post,
  expanded,
  setExpanded,
}: {
  post: TrendingPostCard;
  expanded: Record<string, boolean>;
  setExpanded: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const meta = categoryMeta[post.category];
  const isExpanded = Boolean(expanded[post.id]);
  const textToShow = getReadableText(post);
  const canExpand = textToShow.length > 220;
  const media = post.videoUrl ? buildTrendingMediaPreview(post.videoUrl, post.videoLoopSeconds) : null;
  const imageSrc = post.imageUrl || meta.fallbackImage;
  const isPortrait = post.category === "instagram" || post.category === "tiktok";
  const collapsedHeight = isPortrait ? "4.5rem" : "5.75rem";
  const expandedHeight = isPortrait ? "12rem" : "14rem";

  return (
    <article
      id={`signal-${post.id}`}
      className={`group/card relative flex h-full flex-col overflow-hidden rounded-[0.9rem] bg-transparent text-white transition duration-300 hover:-translate-y-1 motion-reduce:hover:translate-y-0 ${
        isPortrait ? "min-h-[19rem]" : "min-h-[16rem]"
      }`}
    >
      <div className={`relative ${isPortrait ? "aspect-[3/4]" : "aspect-video"} overflow-hidden rounded-[0.9rem] bg-black/40`}>
        {media ? (
          media.provider === "direct" ? (
            <video
              src={media.embedUrl}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              controls={false}
            />
          ) : (
            <iframe
              src={media.embedUrl}
              title={`${post.title} - ${media.label}`}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              loading="lazy"
            />
          )
        ) : (
          <VisualImage
            src={imageSrc}
            alt={post.imageUrl ? post.title : ""}
            sizes="(max-width: 768px) 78vw, 400px"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111219] via-transparent to-black/20" />
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.cardWash} opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 motion-reduce:transition-none`}
        />
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${meta.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
            {meta.label}
          </span>
          <span className="text-xs font-semibold text-white/50">{formatStableDate(post.createdAt)}</span>
        </div>

        <h3 className={`font-black leading-tight text-white ${isPortrait ? "text-sm" : "text-base"}`}>
          {post.title}
        </h3>

        <div className="relative mt-2 text-[12px] leading-5 text-white/70">
          <p
            className="whitespace-pre-wrap overflow-hidden transition-[max-height] duration-300 motion-reduce:transition-none"
            style={{ maxHeight: isExpanded ? expandedHeight : collapsedHeight }}
          >
            {textToShow}
          </p>
          {canExpand && !isExpanded ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#111219] to-transparent" />
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {post.isInsightReady ? (
            <Link
              href={`/trending/${post.id}/insight`}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#08090e] transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            >
              <SparkIcon />
              Negosyante Insight
            </Link>
          ) : null}
          {canExpand ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => ({ ...current, [post.id]: !isExpanded }))}
              className="inline-flex min-h-8 items-center rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1 text-[11px] font-bold text-white/80 transition hover:border-white/25 hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {isExpanded ? "Collapse" : "Read More"}
            </button>
          ) : null}
          {post.videoUrl && !media ? (
            <a
              href={post.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-8 items-center rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-bold text-white/70 transition hover:border-white/25 hover:text-white"
            >
              Source
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

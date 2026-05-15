"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TrendCategory } from "@prisma/client";
import { buildTrendingMediaPreview } from "@/lib/trending-media";
import type { TrendingPostCard } from "@/lib/trending-posts";

type TrendingFeedGridProps = {
  posts: TrendingPostCard[];
};

type CategoryMeta = {
  label: string;
  railTitle: string;
  fallbackImage: string;
  dot: string;
  hoverWash: string;
};

type RailGroup = {
  category: TrendCategory;
  posts: TrendingPostCard[];
};

const categoryOrder: TrendCategory[] = [
  "the_internet",
  "youtube",
  "tiktok",
  "instagram",
  "facebook",
  "reddit",
  "x",
];

const categoryMeta: Record<TrendCategory, CategoryMeta> = {
  tiktok: {
    label: "TikTok",
    railTitle: "TikTok Signals",
    fallbackImage: "/trending/me-and-my-bro.svg",
    dot: "bg-cyan-300",
    hoverWash: "from-cyan-300/35 via-fuchsia-400/20 to-transparent",
  },
  the_internet: {
    label: "The Internet",
    railTitle: "Internet Culture Signals",
    fallbackImage: "/trending/hawak-mo-ang-beat.svg",
    dot: "bg-sky-300",
    hoverWash: "from-sky-300/30 via-emerald-300/15 to-transparent",
  },
  youtube: {
    label: "YouTube",
    railTitle: "YouTube Signals",
    fallbackImage: "/trending/hawak-mo-ang-beat.svg",
    dot: "bg-red-300",
    hoverWash: "from-red-400/30 via-amber-300/20 to-transparent",
  },
  facebook: {
    label: "Facebook",
    railTitle: "Facebook Signals",
    fallbackImage: "/trending/me-and-my-bro.svg",
    dot: "bg-blue-300",
    hoverWash: "from-blue-300/30 via-teal-300/15 to-transparent",
  },
  reddit: {
    label: "Reddit",
    railTitle: "Reddit Signals",
    fallbackImage: "/trending/me-and-my-bro.svg",
    dot: "bg-orange-300",
    hoverWash: "from-orange-300/30 via-rose-300/15 to-transparent",
  },
  x: {
    label: "X",
    railTitle: "X Signals",
    fallbackImage: "/trending/hawak-mo-ang-beat.svg",
    dot: "bg-zinc-100",
    hoverWash: "from-zinc-100/30 via-cyan-300/15 to-transparent",
  },
  instagram: {
    label: "Instagram",
    railTitle: "Instagram Signals",
    fallbackImage: "/trending/me-and-my-bro.svg",
    dot: "bg-pink-300",
    hoverWash: "from-pink-300/30 via-violet-300/20 to-transparent",
  },
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WHEEL_THRESHOLD = 170;
const WHEEL_COOLDOWN_MS = 300;

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

function formatStableDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "New";

  const month = monthLabels[date.getUTCMonth()] ?? "New";
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month} ${day}`;
}

function buildRailGroups(posts: TrendingPostCard[]) {
  return categoryOrder
    .map((category, index) => {
      const primary = posts.filter((post) => post.category === category);
      if (!primary.length) return null;

      const seen = new Set(primary.map((post) => post.id));
      const fallback = posts
        .slice(index)
        .concat(posts.slice(0, index))
        .filter((post) => !seen.has(post.id));

      return {
        category,
        posts: [...primary, ...fallback].slice(0, 10),
      };
    })
    .filter((group): group is RailGroup => Boolean(group));
}

function getReadableText(post: TrendingPostCard) {
  return (post.content ?? "").trim() || (post.snippet ?? "").trim();
}

function VisualImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  if (src.startsWith("/")) {
    return <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
  );
}

export function TrendingFeedGrid({ posts }: TrendingFeedGridProps) {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const railRefs = useRef<Array<HTMLElement | null>>([]);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const wheelAccumulatorRef = useRef(0);
  const wheelCooldownRef = useRef(0);
  const scrollDebounceRef = useRef<number | null>(null);
  const heroScrollTimeoutsRef = useRef<Array<number>>([]);
  const scrollForceTimeoutRef = useRef<number | null>(null);

  const groups = useMemo(() => buildRailGroups(posts), [posts]);
  const [activeRailIndex, setActiveRailIndex] = useState(-1); // -1 = hero, 0+ = rails
  const [activeCardByRail, setActiveCardByRail] = useState<Partial<Record<TrendCategory, number>>>({});
  const [hoverRailIndex, setHoverRailIndex] = useState<number | null>(null);

  const activeRail = activeRailIndex >= 0 ? groups[activeRailIndex] : null;
  const activeCardIndex = activeRail ? Math.max(0, Math.min(activeRail.posts.length - 1, activeCardByRail[activeRail.category] ?? 0)) : 0;
  const activePost = activeRail?.posts[activeCardIndex] ?? posts[0] ?? null;
  const activeMeta = activePost ? categoryMeta[activePost.category] : categoryMeta.the_internet;

  useEffect(() => {
    if (!groups.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveRailIndex((current) => Math.max(-1, Math.min(groups.length - 1, current)));
  }, [groups.length]);

  useEffect(() => {
    if (!activeRail) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveCardByRail({});
      return;
    }
    setActiveCardByRail((current) => {
      const next = { ...current };
      const value = next[activeRail.category] ?? 0;
      next[activeRail.category] = Math.max(0, Math.min(activeRail.posts.length - 1, value));
      return next;
    });
  }, [activeRail]);

  useEffect(() => {
    if (!activeRail || !activePost) return;
    const key = `${activeRail.category}-${activePost.id}`;
    const node = cardRefs.current[key];
    const railNode = railRefs.current[activeRailIndex];
    if (!node || !railNode) return;

    // Find the horizontal scroller inside the rail section
    const scroller = railNode.querySelector<HTMLElement>('div.overflow-x-auto');
    if (!scroller) return;

    // Compute target scrollLeft so the card is centered inside the scroller
    const nodeRect = node.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const offsetLeft = nodeRect.left - scrollerRect.left + scroller.scrollLeft;
    const target = Math.max(0, Math.round(offsetLeft + nodeRect.width / 2 - scroller.clientWidth / 2));

    scroller.scrollTo({ left: target, behavior: reducedMotion ? 'auto' : 'smooth' });
    if (!reducedMotion) {
      if (scrollForceTimeoutRef.current) window.clearTimeout(scrollForceTimeoutRef.current);
      // Force final position after smooth scroll to avoid scroll-snap or interrupted animations
      scrollForceTimeoutRef.current = window.setTimeout(() => {
        scroller.scrollTo({ left: target, behavior: 'auto' });
        scrollForceTimeoutRef.current = null;
      }, 260) as unknown as number;
    }
  }, [activeRail, activePost, reducedMotion, activeRailIndex]);

  useEffect(() => {
    if (typeof window === "undefined" || !groups.length) return;

    const scrollToRail = () => {
      if (activeRailIndex === -1) {
        // Snap the page fully to the very top when hero is selected
        try {
          window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
          if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
        } catch {}

        // Clear any previous timeouts
        heroScrollTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
        heroScrollTimeoutsRef.current = [];

        // Re-enforce at several intervals to override competing scrolls
        [40, 120, 300].forEach((delay) => {
          const id = window.setTimeout(() => {
            try {
              window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
              if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
            } catch {}
          }, delay) as unknown as number;
          heroScrollTimeoutsRef.current.push(id);
        });

        return;
      }

      const node = railRefs.current[activeRailIndex];
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const targetY = Math.round(window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2);
      window.scrollTo({ left: window.scrollX, top: targetY, behavior: reducedMotion ? 'auto' : 'smooth' });
    };

    scrollToRail();
  }, [activeRailIndex, reducedMotion, groups.length]);

  // Snap to nearest section (hero or rail) after manual scrolling stops
  useEffect(() => {
    if (typeof window === 'undefined' || !groups.length) return;

    const isTouchpadWheel = (event: WheelEvent) => {
      if (event.deltaMode !== 0) return false;
      const dx = Math.abs(event.deltaX || 0);
      const dy = Math.abs(event.deltaY || 0);
      return dx < 60 && dy < 60;
    };

    const scheduleSnap = (delayMs = 240) => {
      if (scrollDebounceRef.current) window.clearTimeout(scrollDebounceRef.current);
      scrollDebounceRef.current = window.setTimeout(() => {
        const positions: Array<{ index: number; targetY: number }> = [];

        // hero -> targetY = 0
        positions.push({ index: -1, targetY: 0 });

        groups.forEach((_, i) => {
          const node = railRefs.current[i];
          if (!node) return;
          const rect = node.getBoundingClientRect();
          const targetY = Math.round(window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2);
          positions.push({ index: i, targetY });
        });

        const curY = window.scrollY;
        let nearest = positions[0];
        let minDist = Math.abs(curY - positions[0].targetY);
        for (let j = 1; j < positions.length; j++) {
          const d = Math.abs(curY - positions[j].targetY);
          if (d < minDist) {
            minDist = d;
            nearest = positions[j];
          }
        }

        // Update active rail and force immediate snap
        setActiveRailIndex(nearest.index);
        try {
          window.scrollTo({ left: window.scrollX, top: nearest.targetY, behavior: 'auto' });
        } catch {}
      }, delayMs) as unknown as number;
    };

    const handleScroll = () => scheduleSnap();
    const handleWheelForSnap = (e: WheelEvent) => {
      // Touchpad gestures emit many small wheel events with pixel deltas.
      // Snap almost immediately so the browser momentum does not get to animate.
      if (isTouchpadWheel(e)) {
        scheduleSnap(1);
        return;
      }

      // Mouse wheel keeps the existing delayed snap.
      scheduleSnap();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheelForSnap, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheelForSnap as EventListener);
      if (scrollDebounceRef.current) window.clearTimeout(scrollDebounceRef.current);
    };
  }, [groups.length]);

  // Removed page-level scrollIntoView to avoid window scrolling and horizontal overflow.
  // Card centering is handled by the scroller.scrollTo in the active card effect above.

  useEffect(() => {
    const moveRail = (delta: number) => {
      setActiveRailIndex((current) => {
        if (!groups.length) return current;
        // Range is -1 (hero) to groups.length - 1 (last rail)
        return Math.max(-1, Math.min(groups.length - 1, current + delta));
      });
    };

    const moveCard = (delta: number) => {
      if (!activeRail) return;
      setActiveCardByRail((current) => {
        const value = current[activeRail.category] ?? 0;
        const next = Math.max(0, Math.min(activeRail.posts.length - 1, value + delta));
        return { ...current, [activeRail.category]: next };
      });
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (!groups.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveRail(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        moveRail(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveCard(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveCard(-1);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (!groups.length) return;
      const root = rootRef.current;
      const target = event.target as EventTarget | null;
      if (!root || !target || !(target instanceof Node) || !root.contains(target)) return;

      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (Math.abs(event.deltaY) < 4) return;
      event.preventDefault();

      const now = Date.now();
      if (now - wheelCooldownRef.current < WHEEL_COOLDOWN_MS) return;

      // Damp wheel movement so trackpads and fast mice feel controller-like.
      wheelAccumulatorRef.current += event.deltaY * 0.78;
      if (Math.abs(wheelAccumulatorRef.current) < WHEEL_THRESHOLD) return;

      const direction = wheelAccumulatorRef.current > 0 ? 1 : -1;
      wheelAccumulatorRef.current = 0;
      wheelCooldownRef.current = now;
      moveRail(direction);
    };

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("wheel", handleWheel as EventListener);
    };
  }, [activeRail, groups.length]);

  
  if (!posts.length || !activePost) {
    return (
      <article className="rounded-2xl border border-dashed border-white/20 bg-white/[0.04] p-8 text-center text-sm text-white/70">
        No cultural signals have been published yet.
      </article>
    );
  }

  const heroImage = activePost.imageUrl || activeMeta.fallbackImage;
  const heroText = getReadableText(activePost);
  
  // Determine glow gradient based on hovered or active rail/hero
  let glowRailIndex = activeRailIndex;
  if (hoverRailIndex !== null && hoverRailIndex >= 0) {
    glowRailIndex = hoverRailIndex;
  }
  const glowRail = glowRailIndex >= 0 ? groups[glowRailIndex] : null;
  const glowMeta = glowRail ? categoryMeta[glowRail.category] : activeMeta;
  
  // Map hoverWash colors to background glow variants
  const glowGradientMap: Record<string, string> = {
    'from-cyan-300': 'from-cyan-500/25',
    'from-sky-300': 'from-sky-500/25',
    'from-red-400': 'from-red-500/25',
    'from-blue-300': 'from-blue-500/25',
    'from-orange-300': 'from-orange-500/25',
    'from-zinc-100': 'from-zinc-300/25',
    'from-pink-300': 'from-pink-500/25',
  };
  const glowGradient = glowMeta.hoverWash.split(' ')[0];
  const dynamicGlowBg = glowGradientMap[glowGradient] || 'from-cyan-500/25';

  return (
    <div ref={rootRef} className="relative w-full overflow-hidden bg-transparent text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_20%_12%,rgba(125,211,252,0.18),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(251,191,36,0.18),transparent_28%)]" />
      <div className={`pointer-events-none absolute inset-0 z-20 bg-gradient-to-br ${dynamicGlowBg} via-transparent to-transparent transition-all duration-300 opacity-50`} />

      <section ref={heroRef} className="relative z-0 min-h-[31rem] overflow-hidden border-b border-white/10 pt-0">
        <VisualImage src={heroImage} alt={activePost.title} sizes="(max-width: 1200px) 100vw, 1400px" />
        <div className={`absolute inset-0 bg-gradient-to-br ${activeMeta.hoverWash}`} />

        <div className="relative z-10 flex min-h-[31rem] flex-col justify-between px-6 pb-5 pt-20 sm:pt-20 lg:pt-24 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5">
                <span className={`h-2 w-2 rounded-full ${activeMeta.dot}`} aria-hidden="true" />
                {activeMeta.label}
              </span>
              <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5">Signal Browser</span>
            </div>
            <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5">{activeRailIndex + 1} / {groups.length}</span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="font-roboto-mono text-4xl font-bold uppercase tracking-[0.06em] sm:text-5xl lg:text-6xl">{activePost.title}</h1>
            <p className="text-base leading-7 text-white/80 sm:text-lg">{heroText.length > 220 ? `${heroText.slice(0, 220).trim()}...` : heroText}</p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {activePost.isInsightReady ? (
                <Link
                  href={`/trending/${activePost.id}/insight`}
                  className="inline-flex min-h-11 items-center rounded-full bg-white px-5 py-2 text-sm font-bold text-[#090b12] transition hover:bg-cyan-100"
                >
                  Negosyante Insight
                </Link>
              ) : null}
              <span className="rounded-full border border-white/25 bg-black/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                Use Up/Down to switch channels
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <h2 className="font-roboto-mono text-sm font-bold uppercase tracking-[0.22em] text-white/85">Top picks for you</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Left/Right to navigate</span>
          </div>
        </div>
      </section>

      <section className="relative z-30 mt-6 overflow-hidden px-0 pb-6">
        <div className="space-y-6 pb-2">
          {groups.map((group, railIndex) => {
            const railMeta = categoryMeta[group.category];
            const railIsActive = railIndex === activeRailIndex;
            const railActiveCardIndex = Math.max(
              0,
              Math.min(group.posts.length - 1, activeCardByRail[group.category] ?? 0),
            );

            const isHovered = hoverRailIndex === railIndex;
            const scale = railIsActive ? 'scale-100' : isHovered ? 'scale-100' : 'scale-[0.96]';
            const opacity = railIsActive ? 'opacity-100' : 'opacity-75';
            
            return (
              <section
                key={group.category}
                ref={(node) => {
                  railRefs.current[railIndex] = node;
                }}
                onMouseEnter={() => setHoverRailIndex(railIndex)}
                onMouseLeave={() => setHoverRailIndex(null)}
                className={`w-full px-0 py-4 pl-5 sm:pl-8 lg:pl-10 transition duration-300 origin-center ${scale} ${opacity} ${railIsActive ? 'z-30' : 'z-10'}`}
                style={{ overflow: 'hidden' }}
              >
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h1 className="font-roboto-mono text-lg font-bold uppercase tracking-[0.18em] text-white sm:text-xl">
                    {railMeta.label}
                  </h1>
                  <span className="pr-5 sm:pr-8 lg:pr-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    {railIndex + 1} / {groups.length}
                  </span>
                </div>

                <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto">
                  {group.posts.map((post, cardIndex) => {
                    const key = `${group.category}-${post.id}`;
                    const isActive = railIsActive && cardIndex === railActiveCardIndex;
                    return (
                      <div
                        key={key}
                        ref={(node) => {
                          cardRefs.current[key] = node;
                        }}
                        className="w-[14.5rem] shrink-0 snap-center"
                      >
                        <SignalThumbCard post={post} active={isActive} />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SignalThumbCard({ post, active }: { post: TrendingPostCard; active: boolean }) {
  const meta = categoryMeta[post.category];
  const media = post.videoUrl ? buildTrendingMediaPreview(post.videoUrl, post.videoLoopSeconds) : null;
  const imageSrc = post.imageUrl || meta.fallbackImage;

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border transition duration-300 ${
        active
          ? "border-white/55 shadow-[0_0_0_2px_rgba(255,255,255,0.22),0_14px_35px_rgba(56,189,248,0.24)]"
          : "border-white/10 hover:border-white/35 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_12px_30px_rgba(56,189,248,0.16)]"
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-black/35">
        {media ? (
          media.provider === "direct" ? (
            <video src={media.embedUrl} className="h-full w-full object-cover" autoPlay loop muted playsInline controls={false} />
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
          <VisualImage src={imageSrc} alt={post.title} sizes="320px" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b12]/90 via-[#090b12]/25 to-transparent" />
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.hoverWash} transition-opacity duration-300 ${
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        />
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">{meta.label}</span>
          <span className="text-[11px] font-semibold text-white/55">{formatStableDate(post.createdAt)}</span>
        </div>
        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white/95">{post.title}</h3>
      </div>
    </article>
  );
}

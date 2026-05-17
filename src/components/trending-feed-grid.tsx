"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { IconType } from "react-icons";
import { FaFacebookF, FaGlobe, FaInstagram, FaRedditAlien, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { TrendCategory } from "@prisma/client";
import { buildTrendingMediaPreview } from "@/lib/trending-media";
import type { TrendingPostCard } from "@/lib/trending-posts";

type TrendingFeedGridProps = {
  posts: TrendingPostCard[];
};

const categoryStyleMap: Record<TrendCategory, { box: string; border: string; label: string; icon: IconType }> = {
  tiktok: {
    box: "bg-slate-950/95 text-slate-100",
    border: "border-cyan-400",
    label: "Tiktok",
    icon: FaTiktok,
  },
  the_internet: {
    box: "bg-blue-600/95 text-blue-50",
    border: "border-sky-200",
    label: "The Internet",
    icon: FaGlobe,
  },
  youtube: {
    box: "bg-red-700/90 text-red-50",
    border: "border-red-300",
    label: "Youtube",
    icon: FaYoutube,
  },
  facebook: {
    box: "bg-blue-900/95 text-blue-50",
    border: "border-blue-300",
    label: "Facebook",
    icon: FaFacebookF,
  },
  reddit: {
    box: "bg-orange-500/95 text-orange-50",
    border: "border-orange-200",
    label: "Reddit",
    icon: FaRedditAlien,
  },
  x: {
    box: "bg-zinc-700/95 text-zinc-50",
    border: "border-zinc-300",
    label: "X",
    icon: FaXTwitter,
  },
  instagram: {
    box: "bg-fuchsia-600/90 text-fuchsia-50",
    border: "border-pink-200",
    label: "Instagram",
    icon: FaInstagram,
  },
};

export function TrendingFeedGrid({ posts }: TrendingFeedGridProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const t = document.documentElement.getAttribute('data-theme');
    setTheme(t);

    const obs = new MutationObserver(() => {
      const next = document.documentElement.getAttribute('data-theme');
      setTheme(next);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  if (!posts.length) {
    return (
      <article className="rounded border border-dashed border-slate-700 bg-slate-900/70 p-6 text-center text-sm text-slate-300">
        No trending stories yet. Your super admin can publish from the dashboard.
      </article>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {posts.map((post) => {
        const style = categoryStyleMap[post.category];
        const CategoryIcon = style.icon;
        const isExpanded = Boolean(expanded[post.id]);
        const normalizedContent = (post.content ?? "").trim();
        const fallbackSnippet = (post.snippet ?? "").trim();
        const textToShow = normalizedContent || fallbackSnippet;
        const canExpand = textToShow.length > 220;
        const media = post.videoUrl ? buildTrendingMediaPreview(post.videoUrl, post.videoLoopSeconds) : null;

        return (
          <article
            key={post.id}
            className={`rounded border-2 p-3.5 shadow-sm transition sm:p-4 ${style.box} ${style.border}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded border border-white/35 bg-white/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide">
                <CategoryIcon className="h-3 w-3 text-white" aria-hidden="true" />
                {style.label}
              </span>
              <span className="text-xs opacity-85">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

            <h2 className="text-[1.55rem] font-semibold leading-[1.05] tracking-tight sm:text-lg">{post.title}</h2>

            <div
              className="relative mt-2.5 overflow-hidden whitespace-pre-wrap text-sm font-normal leading-relaxed transition-[max-height] duration-300 ease-out"
              style={{ maxHeight: isExpanded ? "1200px" : "96px" }}
            >
              {textToShow}
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              {canExpand ? (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => ({ ...prev, [post.id]: !isExpanded }))}
                  className="min-h-8 rounded border border-white/35 bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30"
                >
                  {isExpanded ? "Collapse" : "Read More"}
                </button>
              ) : (
                <Link
                  href={`/trending/${post.id}/insight`}
                  className="story-read-more mt-1 inline-flex w-full flex-col items-start text-left pr-3 underline decoration-current underline-offset-4 transition-colors hover:text-white sm:w-auto"
                >
                  <span className="inline-flex flex-col gap-0.5">
                    <span>Interesting....</span>
                    <span>read more</span>
                  </span>
                </Link>
              )}
              {post.isInsightReady ? (
                <Link
                  href={`/trending/${post.id}/insight`}
                  className={`insight-cta ${theme === 'dark' ? 'insight-cta--dark' : 'insight-cta--light'} group relative inline-flex items-center justify-center overflow-visible rounded-full px-3 py-0.5 text-xs font-semibold transition-all duration-300`}
                >
                  <span
                    aria-hidden="true"
                    className="insight-cta-surface"
                    style={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#e6e6e6' }}
                  />
                  <span className="insight-cta-label relative z-10 block whitespace-pre-line text-center leading-tight">
                    Negosyante{`\n`}Insight <span className="insight-cta-emoji">✨</span>
                  </span>
                </Link>
              ) : null}
            </div>

            {media ? (
              <div className={`relative mt-2.5 overflow-hidden rounded border border-white/25 bg-black/20 ${media.aspectClass}`}>
                <iframe
                  src={media.embedUrl}
                  title={`${post.title} - ${media.label}`}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  loading="lazy"
                />
              </div>
            ) : post.videoUrl ? (
              <div className="mt-2.5 rounded border border-white/25 bg-black/20 p-3 text-xs">
                Video link saved, but this platform could not be embedded. Open it from the original source.
              </div>
            ) : post.imageUrl ? (
              <div className="relative mt-2.5 h-40 overflow-hidden rounded border border-white/25 bg-black/15 sm:h-44">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

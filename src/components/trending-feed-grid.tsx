"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import { FaFacebookF, FaGlobe, FaInstagram, FaRedditAlien, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { TrendCategory } from "@prisma/client";
import type { TrendingPostCard } from "@/lib/trending-posts";
import { TrendingMediaBlock } from "@/components/trending-media-block";

type TrendingFeedGridProps = {
  posts: TrendingPostCard[];
  viewerRole?: string | null;
  insightButtonLabel?: string;
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

export function TrendingFeedGrid({ posts, viewerRole, insightButtonLabel = "Negosyante Insight" }: TrendingFeedGridProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const router = useRouter();

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
        return (
          <article
              key={post.id}
              className={`group cursor-pointer rounded border-2 p-3 shadow-sm transition sm:p-4 ${style.box} ${style.border}`}
              onClick={() => router.push(`/trending/${post.id}`)}
            >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded border border-white/35 bg-white/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide">
                <CategoryIcon className="h-3 w-3 text-white" aria-hidden="true" />
                {style.label}
              </span>
              <span className="text-xs opacity-85">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

            <h2 className="text-[1.25rem] font-semibold leading-[1.05] tracking-tight sm:text-lg group-hover:underline">{post.title}</h2>

            <div
              className="relative mt-2.5 overflow-hidden whitespace-pre-wrap text-sm font-normal leading-relaxed transition-[max-height] duration-300 ease-out group-hover:underline"
              style={{ maxHeight: isExpanded ? "1200px" : "96px" }}
            >
              {textToShow}
            </div>

            <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
              {canExpand ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setExpanded((prev) => ({ ...prev, [post.id]: !isExpanded })); }}
                  className="min-h-9 rounded border border-white/35 bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30 sm:w-auto"
                >
                  {isExpanded ? "Collapse" : "Read More"}
                </button>
              ) : null}
              {post.isInsightReady ? (
                <Link
                  href={`/trending/${post.id}`}
                  className="insight-cta insight-cta--light group relative inline-flex items-center justify-center overflow-visible rounded-full px-3 py-0.5 text-xs font-semibold transition-all duration-300 sm:w-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span
                    aria-hidden="true"
                    className="insight-cta-surface"
                    style={{ backgroundColor: "rgb(230, 230, 230)" }}
                  />
                  <span className="insight-cta-label relative z-10 block whitespace-pre-line text-center leading-tight">
                    {"Negosyante\nInsight "}<span className="insight-cta-emoji">✨</span>
                  </span>
                </Link>
              ) : null}
            </div>

            <TrendingMediaBlock
              title={post.title}
              imageUrl={post.imageUrl}
              gifUrl={post.gifUrl}
              videoUrl={post.videoUrl}
              className="mt-2.5 rounded border-white/25 bg-black/15"
              mediaClassName="h-36 sm:h-44"
            />
          </article>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildTrendingMediaPreview } from "@/lib/trending-media";

export default async function TrendingInsightPage(
  props: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await props.params;

  const post = await prisma.trendingPost.findUnique({
    where: { id },
  });

  if (!post || post.isDraft || !post.isInsightReady) {
    notFound();
  }

  const media = post.videoUrl ? buildTrendingMediaPreview(post.videoUrl, post.videoLoopSeconds) : null;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ni-text)]">Negosyante Insight</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ni-text-strong)]">
          {post.insightTitle?.trim() || post.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--ni-text)]">Category: {post.category.replaceAll("_", " ")}</p>
      </div>

      {media ? (
        <div className={`relative overflow-hidden rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] shadow-sm ${media.aspectClass}`}>
          <iframe
            src={media.embedUrl}
            title={`${post.title} - ${media.label}`}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            loading="lazy"
          />
        </div>
      ) : post.videoUrl ? (
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 text-sm text-[var(--ni-text)] shadow-sm">
          Video link saved, but this platform could not be embedded. Open it from the source link.
        </div>
      ) : post.imageUrl ? (
        <div className="relative h-72 overflow-hidden rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] shadow-sm">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <article className="rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-5 text-sm leading-relaxed text-[var(--ni-text)] shadow-sm">
        <p className="whitespace-pre-wrap">{post.insightBody?.trim() || post.content}</p>
      </article>

      <Link href="/trending" className="inline-flex rounded-full border border-[color:var(--ni-border)] px-4 py-2 text-sm font-semibold text-[var(--ni-text)] hover:bg-[var(--ni-surface-2)]">
        Back to Trending Feed
      </Link>
    </section>
  );
}

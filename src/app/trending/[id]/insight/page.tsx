import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildTrendingMediaPreview } from "@/lib/trending-media";

export default async function TrendingInsightPage(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;

  const post = await prisma.trendingPost.findUnique({
    where: { id },
  });

  if (!post || post.isDraft) {
    notFound();
  }

  const media = post.videoUrl ? buildTrendingMediaPreview(post.videoUrl, post.videoLoopSeconds) : null;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">
          {post.isInsightReady ? "Negosyante Insight" : "Trending Article"}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ni-text-strong)]">
          {post.insightTitle?.trim() || post.title}
        </h1>
        <p className="mt-2 text-sm text-[color:var(--ni-text)]">Category: {post.category.replaceAll("_", " ")}</p>
      </div>

      {media ? (
        <div className={`relative overflow-hidden rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] shadow-sm ${media.aspectClass}`}>
          <iframe
            src={media.embedUrl}
            title={`${post.title} - ${media.label}`}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            loading="lazy"
          />
        </div>
      ) : post.videoUrl ? (
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 text-sm text-[color:var(--ni-text)] shadow-sm">
          Video link saved, but this platform could not be embedded. Open it from the source link.
        </div>
      ) : post.imageUrl ? (
        <div className="relative h-72 overflow-hidden rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] shadow-sm">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <article className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 text-sm leading-relaxed text-[color:var(--ni-text)] shadow-sm">
        <p className="whitespace-pre-wrap">{post.insightBody?.trim() || post.content}</p>
      </article>

      <Link href="/" className="inline-flex rounded-full border border-[color:var(--ni-border)] px-4 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)] hover:bg-[color:var(--ni-surface-2)]">
        Back to Home
      </Link>
    </section>
  );
}

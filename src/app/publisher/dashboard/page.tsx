import Link from "next/link";
import { Prisma, Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublisherInsightForm } from "@/components/publisher-insight-form";

export default async function PublisherDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Allow admins and publisher roles to access the publisher dashboard
  if (user.role !== Role.admin && user.role !== Role.publisher && user.role !== Role.publisher_verified) redirect("/feed");

  const recentArticles = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    category: string;
    snippet: string;
    isDraft: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>>(Prisma.sql`
    SELECT
      "id",
      "title",
      CAST("category" AS TEXT) AS "category",
      "snippet",
      "isDraft",
      "createdAt",
      "updatedAt"
    FROM "TrendingPost"
    ORDER BY "updatedAt" DESC
    LIMIT 8
  `);

  const draftCount = recentArticles.filter((article) => article.isDraft).length;
  const publishedCount = recentArticles.length - draftCount;

  return (
    <section className="mx-auto w-full max-w-screen-2xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">Publisher Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Article upload for Negosyante Island staff</h1>
        <p className="mt-2 text-sm text-[color:var(--ni-text)]">
          Draft, edit, and publish article cards from one place. This first pass reuses the existing trending-post workflow so staff can start publishing immediately.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">Recent articles</p>
          <p className="mt-2 text-3xl font-black text-[color:var(--ni-text-strong)]">{recentArticles.length}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">Published</p>
          <p className="mt-2 text-3xl font-black text-emerald-500">{publishedCount}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">Drafts</p>
          <p className="mt-2 text-3xl font-black text-amber-500">{draftCount}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">New article</h2>
            <span className="text-xs text-[color:var(--ni-muted)]">Posts to the existing publisher pipeline</span>
          </div>

          <form
            action="/api/admin/trending-posts"
            method="post"
            encType="multipart/form-data"
            className="mt-4 grid gap-2 md:grid-cols-2"
          >
            <input name="title" required className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)] md:col-span-2" placeholder="Article title" />
            <select name="category" required defaultValue="the_internet" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)]">
              <option value="tiktok">Tiktok</option>
              <option value="the_internet">The Internet</option>
              <option value="youtube">Youtube</option>
              <option value="facebook">Facebook</option>
              <option value="reddit">Reddit</option>
              <option value="x">X</option>
              <option value="instagram">Instagram</option>
            </select>
            <input name="videoLoopSeconds" type="number" min={3} max={6} defaultValue={5} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)]" placeholder="Loop seconds" />
            <textarea name="snippet" required rows={2} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)] md:col-span-2" placeholder="Short teaser" />
            <textarea name="content" required rows={5} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)] md:col-span-2" placeholder="Article body" />
            <input name="imageFile" type="file" accept="image/*" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)] md:col-span-2" />
            <div className="grid gap-2 md:col-span-2 md:grid-cols-2">
              <input name="gifFile" type="file" accept="image/gif" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)]" />
              <input name="videoFile" type="file" accept="video/mp4" className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-sm text-[var(--ni-text-strong)]" />
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <button type="submit" name="action" value="draft" className="rounded bg-[var(--ni-surface-3)] px-3 py-2 text-sm font-semibold text-[var(--ni-text-strong)]">
                Save Draft
              </button>
              <button type="submit" name="action" value="publish" className="rounded bg-[var(--ni-brand)] px-3 py-2 text-sm font-semibold text-[var(--ni-surface-1)]">
                Publish Article
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">First-pass notes</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">
            This dashboard is intentionally small: article creation, drafts, and publishing. The heavier analytics and moderation tools stay in admin for now.
          </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/admin#trending-feed-publisher" className="rounded border border-[color:var(--ni-border)] px-3 py-2 text-xs font-semibold text-[color:var(--ni-text-strong)]">
                Open Admin Publisher
              </Link>
              <Link href="/trending" className="rounded border border-[color:var(--ni-border)] px-3 py-2 text-xs font-semibold text-[color:var(--ni-text-strong)]">
                Preview Trending
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              <PublisherInsightForm articles={recentArticles.map((a) => ({ id: a.id, title: a.title }))} />

              <div className="space-y-2">
                {recentArticles.map((article) => (
                  <article key={article.id} className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ni-muted)]">{article.category.replaceAll("_", " ")}</p>
                    <h3 className="mt-1 text-sm font-semibold text-[var(--ni-text-strong)]">{article.title}</h3>
                    <p className="mt-1 text-xs text-[var(--ni-text)]">{article.snippet}</p>
                    <p className="mt-2 text-[11px] text-[var(--ni-muted)]">{article.isDraft ? "Draft" : "Published"}</p>
                  </article>
                ))}
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQ = "" } = await searchParams;
  const q = rawQ.trim();

  const [trendingPosts, posts, users, featuredPosts] = await Promise.all([
    q
      ? prisma.trendingPost.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { snippet: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 30,
        })
      : prisma.trendingPost.findMany({
          where: { isDraft: false },
          orderBy: { updatedAt: "desc" },
          take: 4,
        }),
    q
      ? prisma.post.findMany({
          where: { content: { contains: q, mode: "insensitive" } },
          include: { author: { select: { id: true, name: true, businessName: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" },
          take: 30,
        })
      : prisma.post.findMany({
          include: { author: { select: { id: true, name: true, businessName: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
    q
      ? prisma.user.findMany({
          where: {
            NOT: { role: "admin" },
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { businessName: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, businessName: true, avatarUrl: true, role: true },
          take: 20,
        })
      : prisma.user.findMany({
          where: { NOT: { role: "admin" } },
          select: { id: true, name: true, businessName: true, avatarUrl: true, role: true },
          orderBy: { createdAt: "desc" },
          take: 4,
        }),
    prisma.trendingPost.findMany({
      where: { isDraft: false },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ]);

  if (!q) {
    return (
      <main className="mx-auto w-full max-w-screen-xl px-3 py-6 sm:px-4">
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[linear-gradient(135deg,rgba(14,116,144,0.18),rgba(59,130,246,0.12),rgba(255,255,255,0.6))] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">Search</p>
          <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Find stories, people, and posts</h1>
          <form action="/search" className="mt-4 flex max-w-2xl gap-2">
            <input name="q" type="search" placeholder="Search Negosyante Island" className="min-w-0 flex-1 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-2 text-sm text-[var(--ni-text-strong)] outline-none" />
            <button type="submit" className="rounded bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white">Search</button>
          </form>
        </div>

        <section className="mt-6 grid gap-3 md:grid-cols-4">
          <StatCard label="Trending" value={featuredPosts.length.toString()} />
          <StatCard label="Stories found" value={trendingPosts.length.toString()} />
          <StatCard label="Posts found" value={posts.length.toString()} />
          <StatCard label="People found" value={users.length.toString()} />
        </section>

        <section className="mt-6 rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">Try these searches</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["published", "trending", "publisher", "insight", "business"].map((term) => (
              <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--ni-text-strong)] hover:border-[color:var(--ni-brand)] hover:text-[var(--ni-brand)]">
                {term}
              </Link>
            ))}
          </div>
        </section>

        <ResultsSection title="Featured trending" emptyMessage="No trending stories available yet." emptyCta={<Link href="/trending" className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[var(--ni-text-strong)]">Open Trending</Link>}>
          {featuredPosts.map((post) => (
            <ResultCard key={post.id} href={`/trending/${post.id}`} title={post.title} body={post.snippet ?? post.content ?? ""} meta={`${new Date(post.updatedAt).toLocaleDateString()}`}/>
          ))}
        </ResultsSection>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-screen-xl px-3 py-6 sm:px-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[linear-gradient(135deg,rgba(14,116,144,0.18),rgba(59,130,246,0.12),rgba(255,255,255,0.6))] p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">Search</p>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--ni-text-strong)]">Search results for “{q}”</h1>
        <form action="/search" className="mt-4 flex max-w-2xl gap-2">
          <input name="q" type="search" defaultValue={q} placeholder="Search Negosyante Island" className="min-w-0 flex-1 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-2 text-sm text-[var(--ni-text-strong)] outline-none" />
          <button type="submit" className="rounded bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white">Search</button>
        </form>
      </div>

      <section className="mt-6 grid gap-3 md:grid-cols-4">
        <StatCard label="Trending" value={featuredPosts.length.toString()} />
        <StatCard label="Stories found" value={trendingPosts.length.toString()} />
        <StatCard label="Posts found" value={posts.length.toString()} />
        <StatCard label="People found" value={users.length.toString()} />
      </section>

      <section className="mt-6 rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">Try these searches</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["published", "trending", "publisher", "insight", "business"].map((term) => (
            <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--ni-text-strong)] hover:border-[var(--ni-brand)] hover:text-[var(--ni-brand)]">
              {term}
            </Link>
          ))}
        </div>
      </section>

      <ResultsSection title="Trending posts" emptyMessage="No trending posts found. Try a broader search or open the trending feed." emptyCta={<Link href="/trending" className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[var(--ni-text-strong)]">Open Trending</Link>}>
        {trendingPosts.map((t) => (
          <ResultCard key={t.id} href={`/trending/${t.id}`} title={t.title} body={t.snippet ?? t.content ?? ""} meta={new Date(t.createdAt).toLocaleDateString()} />
        ))}
      </ResultsSection>

      <ResultsSection title="Posts" emptyMessage="No posts found. Try searching a creator name or a phrase from the post." emptyCta={<Link href="/feed" className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[var(--ni-text-strong)]">Open Feed</Link>}>
        {posts.map((p) => (
          <ResultCard
            key={p.id}
            href="/feed"
            title={p.author?.businessName ?? p.author?.name ?? "Post"}
            body={p.content.slice(0, 180)}
            meta={p.author?.businessName ?? p.author?.name ?? "post"}
          />
        ))}
      </ResultsSection>

      <ResultsSection title="Users" emptyMessage="No users found. Try a business name, publisher name, or display name." emptyCta={<Link href="/signup" className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-xs font-semibold text-white">Join Negosyante Island</Link>}>
        {users.map((u) => (
          <Link key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-3 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3 hover:border-[color:var(--ni-brand)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ni-surface-1)] font-semibold text-[var(--ni-text-strong)]">
              {(u.businessName ?? u.name).slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-[var(--ni-text-strong)]">{u.businessName ?? u.name}</div>
              <div className="text-xs text-[var(--ni-muted)]">{u.role}</div>
            </div>
          </Link>
        ))}
      </ResultsSection>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[color:var(--ni-text-strong)]">{value}</p>
    </div>
  );
}

function ResultsSection({
  title,
  emptyMessage,
  emptyCta,
  children,
}: {
  title: string;
  emptyMessage: string;
  emptyCta: ReactNode;
  children: ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];

  return (
    <section className="mt-6 rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-4 text-sm text-[color:var(--ni-text)]">
          <p>{emptyMessage}</p>
          <div className="mt-3">{emptyCta}</div>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{children}</div>
      )}
    </section>
  );
}

function ResultCard({ href, title, body, meta }: { href: string; title: string; body: string; meta: string }) {
  return (
    <Link href={href} className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-4 hover:border-[color:var(--ni-brand)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">{meta}</p>
      <h3 className="mt-1 line-clamp-2 text-base font-semibold text-[color:var(--ni-text-strong)]">{title}</h3>
      <p className="mt-2 line-clamp-4 text-sm text-[color:var(--ni-text)]">{body}</p>
    </Link>
  );
}

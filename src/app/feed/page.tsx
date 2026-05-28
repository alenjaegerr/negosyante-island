import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getBusinesses } from "@/lib/businesses";
import { buildMessagingShellHref } from "@/lib/messaging";
import BusinessDiscoveryPanel from "@/components/business-discovery-panel";
import { CreatePostForm } from "@/components/create-post-form";
import { PostActions } from "@/components/post-actions";
import PostComments from "@/components/post-comments";
import RoleBadge from "@/components/role-badge";
import { TrendingMediaBlock } from "@/components/trending-media-block";
import { UserAvatar } from "@/components/user-avatar";
import { AdPlacementCard } from "@/components/ad-placement-card";
import { getAdPlacementConfig, getSiteSettingMap } from "@/lib/site-settings";

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  // If the current user is a business, send them to the business home feed
  if (user.role === "business_pending" || user.role === "business_verified" || user.role === "marketing_pending" || user.role === "marketing_verified") {
    redirect("/business/home");
  }

  const [posts, businesses, threads, siteSettings] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true },
      take: 25,
    }),
    getBusinesses(),
    prisma.forumThread.findMany({
      include: {
        author: { select: { id: true, name: true, role: true, businessName: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    getSiteSettingMap(),
  ]);
  const visiblePosts = posts.filter((post) => post.author.role !== "admin");
  const adPlacementConfig = getAdPlacementConfig(siteSettings);
  const showAds = user.role === "user";

  return (
    <section className="mx-auto w-full max-w-screen-2xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ni-muted)]">Home Feed</p>
            <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ni-text-strong)]">Welcome back, {user.name}</h1>
            <p className="mt-1 text-sm text-[color:var(--ni-text)]">Track your community feed, new threads, and business discovery.</p>
          </div>
          <RoleBadge role={user.role} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3">
            <p className="text-xs text-[color:var(--ni-muted)]">Feed updates</p>
            <p className="text-xl font-semibold text-[color:var(--ni-text-strong)]">{visiblePosts.length}</p>
          </div>
          <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3">
            <p className="text-xs text-[color:var(--ni-muted)]">Forum threads</p>
            <p className="text-xl font-semibold text-[color:var(--ni-text-strong)]">{threads.length}</p>
          </div>
          <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3">
            <p className="text-xs text-[color:var(--ni-muted)]">Businesses to discover</p>
            <p className="text-xl font-semibold text-[color:var(--ni-text-strong)]">{businesses.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <AdPlacementCard config={adPlacementConfig} show={showAds} />
          <CreatePostForm />

          <div className="space-y-3">
            {visiblePosts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar name={post.author.businessName ?? post.author.name} avatarUrl={post.author.avatarUrl} size={36} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[color:var(--ni-text-strong)]">{post.author.businessName ?? post.author.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-[11px] text-[color:var(--ni-muted)]">@{post.author.name}</p>
                        <RoleBadge role={post.author.role} />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[color:var(--ni-muted)]">{new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link href={`/profile/${post.author.id}`} className="rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--ni-text-strong)] hover:border-[color:var(--ni-brand)] hover:text-[var(--ni-brand)]">
                    View profile
                  </Link>
                  <Link href={buildMessagingShellHref({ targetUserId: post.author.id })} className="rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--ni-text-strong)] hover:border-[color:var(--ni-brand)] hover:text-[var(--ni-brand)]">
                    Send message
                  </Link>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[color:var(--ni-text-strong)]">{post.content}</p>
                <div className="mt-3">
                  <TrendingMediaBlock
                    title={post.content || "Negosyante Island post"}
                    imageUrl={post.imageUrl}
                    gifUrl={post.gifUrl}
                    videoUrl={post.videoUrl}
                    className="rounded-xl bg-[color:var(--ni-surface-2)]"
                    mediaClassName="h-64"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-[color:var(--ni-text)]">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded bg-[color:var(--ni-surface-2)] px-2 py-1">#{tag}</span>
                  ))}
                </div>
                <PostActions post={post} canDelete={post.authorId === user.id} />
                <PostComments postId={post.id} />
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <BusinessDiscoveryPanel businesses={businesses} viewerRole={user.role} compact />

          <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Latest forum threads</h2>
              <Link href="/theinternet" className="text-xs font-semibold text-[color:var(--ni-brand)]">View all</Link>
            </div>
            <div className="mt-3 space-y-3">
              {threads.map((thread) => (
                <Link key={thread.id} href={`/theinternet/${thread.id}`} className="block rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3">
                  <p className="text-sm font-semibold text-[color:var(--ni-text-strong)]">{thread.title}</p>
                  <p className="mt-1 text-xs text-[color:var(--ni-muted)]">{thread._count.comments} replies • {thread.author.businessName ?? thread.author.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

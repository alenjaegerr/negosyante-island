import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getBusinessBySlug, getBusinesses } from "@/lib/businesses";
import BusinessDiscoveryPanel from "@/components/business-discovery-panel";
import { CreatePostForm } from "@/components/create-post-form";
import { PostActions } from "@/components/post-actions";
import PostComments from "@/components/post-comments";
import RoleBadge from "@/components/role-badge";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type BusinessHomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BusinessHomePage({ searchParams }: BusinessHomePageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Only allow pro accounts here
  if (user.role !== "business_pending" && user.role !== "business_verified" && user.role !== "marketing_pending" && user.role !== "marketing_verified") {
    redirect("/feed");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const intent = typeof resolvedSearchParams?.intent === "string" ? resolvedSearchParams.intent : undefined;
  const targetSlug = typeof resolvedSearchParams?.target === "string" ? resolvedSearchParams.target : undefined;

  const [posts, businesses, targetBusiness] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true },
      take: 25,
    }),
    getBusinesses(),
    targetSlug ? getBusinessBySlug(targetSlug) : Promise.resolve(undefined),
  ]);

  const businessRecord = user.businessName
    ? businesses.find((business) => business.name === user.businessName || business.slug === user.businessName)
    : undefined;
  const businessSlug = businessRecord?.slug ?? (user.businessName ? slugify(user.businessName) : null);

  const messageCount = businessSlug
    ? await prisma.businessMessage.count({ where: { businessSlug } })
    : 0;

  const followsCount = businessSlug
    ? await prisma.businessFollow.count({ where: { businessSlug } })
    : 0;
  const followerTotal = (businessRecord?.followers ?? 0) + followsCount;

  return (
    <section className="mx-auto w-full max-w-screen-2xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ni-muted)]">Business Home</p>
            <h1 className="mt-2 text-2xl font-semibold text-[color:var(--ni-text-strong)]">Welcome, {user.businessName ?? user.name}</h1>
            <p className="mt-1 text-sm text-[color:var(--ni-text)]">Manage leads, update your public profile, and publish updates.</p>
          </div>
          <RoleBadge role={user.role} />
        </div>
      </div>

      {intent === "inquire" && targetBusiness ? (
        <div className="rounded-xl border border-emerald-300/60 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Inquiry ready for {targetBusiness.name}.</p>
          <p className="mt-1">Open their profile to send a business-to-business request.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href={`/business/${targetBusiness.slug}`} className="rounded bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">
              Open Business Profile
            </Link>
            <Link href={`/business/${targetBusiness.slug}/feed`} className="rounded border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-900">
              View Feed
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <p className="text-xs text-[color:var(--ni-muted)]">Inbox leads</p>
          <p className="text-2xl font-semibold text-[color:var(--ni-text-strong)]">{messageCount}</p>
          <Link href="/business/inbox" className="mt-2 inline-flex text-xs font-semibold text-[color:var(--ni-brand)]">
            Open Inbox
          </Link>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <p className="text-xs text-[color:var(--ni-muted)]">Followers</p>
          <p className="text-2xl font-semibold text-[color:var(--ni-text-strong)]">{followerTotal.toLocaleString()}</p>
          {businessRecord ? (
            <Link href={`/business/${businessRecord.slug}`} className="mt-2 inline-flex text-xs font-semibold text-[color:var(--ni-brand)]">
              View Profile
            </Link>
          ) : (
            <Link href="/business/account" className="mt-2 inline-flex text-xs font-semibold text-[color:var(--ni-brand)]">
              Set up profile
            </Link>
          )}
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <p className="text-xs text-[color:var(--ni-muted)]">Business Dashboard</p>
          <Link href="/business/dashboard" className="mt-2 inline-flex rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-xs font-semibold text-white">
            Open Dashboard
          </Link>
        </div>
        <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
          <p className="text-xs text-[color:var(--ni-muted)]">Promote on Insight</p>
          <Link href="/advertising" className="mt-2 inline-flex rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
            Advertising Options
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <CreatePostForm />

          <div className="space-y-3">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[color:var(--ni-text-strong)]">@{post.author.name}</p>
                  <span className="text-xs text-[color:var(--ni-muted)]">{new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[color:var(--ni-text-strong)]">{post.content}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-[color:var(--ni-text)]">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded bg-[color:var(--ni-surface-2)] px-2 py-1">#{tag}</span>
                  ))}
                </div>
                <PostActions post={post} />
                <PostComments postId={post.id} />
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Public profile</h2>
            <p className="mt-1 text-sm text-[color:var(--ni-text)]">Preview how partners see your business.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {businessSlug ? (
                <Link href={`/business/${businessSlug}`} className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-xs font-semibold text-white">
                  View Profile
                </Link>
              ) : (
                <Link href="/business/account/edit" className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-xs font-semibold text-white">
                  Set up profile
                </Link>
              )}
              <Link href="/business/account" className="rounded border border-[color:var(--ni-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
                Account settings
              </Link>
            </div>
          </div>

          <BusinessDiscoveryPanel businesses={businesses} />
        </aside>
      </div>
    </section>
  );
}

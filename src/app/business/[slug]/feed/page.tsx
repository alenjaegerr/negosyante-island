import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/businesses";
import { BusinessFeedList } from "@/components/business-feed-list";

type BusinessFeedPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BusinessFeedPage({ params }: BusinessFeedPageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-xl border border-cyan-600/60 bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-[color:var(--ni-text)]">BUSINESS FEED</p>
            <h1 className="font-flex-bold mt-1 text-2xl text-[color:var(--ni-text-strong)]">{business.name}</h1>
          </div>
          <Link
            href={`/business/${business.slug}`}
            className="inline-flex rounded border border-cyan-700 px-3 py-1.5 text-sm font-semibold text-cyan-800 hover:bg-cyan-50"
          >
            View Profile
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          <BusinessFeedList businessSlug={business.slug} posts={business.posts} />
        </div>
      </div>
    </section>
  );
}

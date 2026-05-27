import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/businesses";
import { getCurrentUser } from "@/lib/auth";
import { OnlineStatusBadge } from "@/components/online-status-badge";
import { BusinessProfileActions } from "@/components/business-profile-actions";
import { BusinessAvatar } from "@/components/business-avatar";

type BusinessProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BusinessProfilePage({ params }: BusinessProfilePageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  const user = await getCurrentUser();

  if (!business) {
    notFound();
  }

  const isOwner = user?.businessName === business.name || user?.role === "admin";

  return (
    <section className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-4 md:py-8">
      <div
        className="overflow-hidden rounded-xl border border-cyan-600/60 bg-[color:var(--ni-surface-1)] shadow-sm"
        style={business.backgroundPhotoUrl ? { backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.18), rgba(2, 6, 23, 0.58)), url(${business.backgroundPhotoUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <div className="bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.6))] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <BusinessAvatar
                slug={business.slug}
                initials={business.initials}
                online={business.online}
                canUpload={Boolean(isOwner)}
                avatarUrl={business.avatarUrl ?? null}
              />

              <div>
                <h1 className="font-flex-bold text-2xl text-white sm:text-3xl">{business.name}</h1>
                <p className="mt-1 text-sm text-white/85">{business.category} • {business.location}</p>
                <p className="mt-1 text-sm font-semibold text-white">{business.verified ? "Verified Business ✅" : "Unverified Business"}</p>
                <div className="mt-1">
                  <OnlineStatusBadge online={business.online} />
                </div>
                <p className="mt-1 text-sm text-white/85">{business.followers.toLocaleString()} followers</p>
              </div>
            </div>

            <Link
              href={`/business/${business.slug}/feed`}
              className="inline-flex rounded bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
            >
              Open Feed
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(15,23,42,0.92))] p-5">
          <div className="rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)]/90 p-3 backdrop-blur-sm">
            <h2 className="font-reddit text-xs font-extrabold tracking-figma-tight text-[color:var(--ni-text-strong)]">ABOUT</h2>
            <p className="mt-2 text-sm text-[color:var(--ni-text)]">{business.tagline}</p>
          </div>

          <BusinessProfileActions
            slug={business.slug}
            baseFollowers={business.followers}
            viewerRole={user?.role ?? "guest"}
          />
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocalBusinessBySlug } from "@/lib/local-businesses";
import { getCurrentUser } from "@/lib/auth";
import { BusinessProfileActions } from "@/components/business-profile-actions";
import { BusinessAvatar } from "@/components/business-avatar";

type BusinessProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BusinessProfilePage({ params }: BusinessProfilePageProps) {
  const { slug } = await params;
  const business = getLocalBusinessBySlug(slug);
  const user = await getCurrentUser();

  if (!business) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-4 md:py-8">
      <div className="rounded-xl border border-cyan-600/60 bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <BusinessAvatar
              slug={business.slug}
              initials={business.initials}
              online={business.online}
              canUpload={user?.role === "business_verified" || user?.role === "admin"}
            />

            <div>
              <h1 className="font-flex-bold text-2xl text-[color:var(--ni-text-strong)] sm:text-3xl">{business.name}</h1>
              <p className="mt-1 text-sm text-[color:var(--ni-text)]">{business.category} • {business.location}</p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--ni-text-strong)]">
                {business.verified ? "Verified Business ✅" : "Unverified Business"}
              </p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--ni-text-strong)]">{business.online ? "Online now" : "Offline"}</p>
              <p className="mt-1 text-sm text-[color:var(--ni-text)]">{business.followers.toLocaleString()} followers</p>
            </div>
          </div>

          <Link
            href={`/business/${business.slug}/feed`}
            className="inline-flex rounded bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
          >
            Open Feed
          </Link>
        </div>

        <div className="mt-5 rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-3">
          <h2 className="font-reddit text-xs font-extrabold tracking-figma-tight text-[color:var(--ni-text-strong)]">ABOUT</h2>
          <p className="mt-2 text-sm text-[color:var(--ni-text)]">{business.tagline}</p>
        </div>

        <BusinessProfileActions
          slug={business.slug}
          businessName={business.name}
          baseFollowers={business.followers}
          contactOptions={business.contactOptions}
          viewerRole={user?.role ?? "guest"}
        />
      </div>
    </section>
  );
}

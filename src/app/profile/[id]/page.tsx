import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserAvatar } from "@/components/user-avatar";
import { buildBusinessMessageHref, buildMessagingShellHref } from "@/lib/messaging";
import RoleBadge from "@/components/role-badge";

type PublicProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { id } = await params;

  const [viewer, userRows, mediaAttachments] = await Promise.all([
    getCurrentUser(),
    prisma.$queryRaw<Array<{
      id: string;
      name: string;
      role: string;
      businessName: string | null;
      businessTagline: string | null;
      businessCategory: string | null;
      businessLocation: string | null;
      avatarUrl: string | null;
      backgroundPhotoUrl: string | null;
      createdAt: Date;
    }>>`
      SELECT
        id,
        name,
        role,
        "businessName" AS "businessName",
        "businessTagline" AS "businessTagline",
        "businessCategory" AS "businessCategory",
        "businessLocation" AS "businessLocation",
        "avatarUrl" AS "avatarUrl",
        "backgroundPhotoUrl" AS "backgroundPhotoUrl",
        "createdAt" AS "createdAt"
      FROM "User"
      WHERE id = ${id}
      LIMIT 1
    `,
    prisma.message.findMany({
      where: { senderId: id, mediaUrl: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, mediaUrl: true, mediaType: true, body: true, createdAt: true },
    }),
  ]);

  const user = userRows[0];
  if (!user) notFound();
  if (user.role === "admin") notFound();

  const isOwner = viewer?.id === user.id;
  const displayName = user.businessName?.trim() || user.name;
  const description = user.businessTagline?.trim()
    || user.businessCategory?.trim()
    || (user.role === "user" ? "Aspiring Negosyante" : user.role === "publisher_verified" ? "Cultured Author on Negosyante Island" : "Business account on Negosyante Island");
  const messagingHref = user.businessName?.trim()
    ? buildBusinessMessageHref(user.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
    : buildMessagingShellHref({ targetUserId: user.id });

  return (
    <section className="mx-auto w-full max-w-5xl space-y-4 px-3 py-6 sm:px-4">
      <div
        className="relative overflow-hidden rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] shadow-sm min-h-[320px] md:min-h-[360px]"
      >
        {user.backgroundPhotoUrl ? (
          <img
            src={user.backgroundPhotoUrl}
            alt={`${displayName} background photo`}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.38)_40%,rgba(2,6,23,0.78))]" />
        <div className="relative z-10 flex min-h-[320px] flex-col justify-end p-5 md:min-h-[360px]">
          <div className="flex flex-wrap items-center gap-4">
            <UserAvatar name={displayName} avatarUrl={user.avatarUrl} size={88} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">Public Profile</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{displayName}</h1>
              <p className="mt-2 text-sm text-white/85">{description}</p>
              <p className="mt-1 text-xs text-white/70">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <RoleBadge role={user.role} />
            {user.businessLocation ? <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white">{user.businessLocation}</span> : null}
            {user.businessCategory ? <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white">{user.businessCategory}</span> : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/feed" className="rounded-full bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white">
              Back to feed
            </Link>
            {isOwner ? (
              <Link href="/account/edit" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                Edit profile
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Uploaded attachments</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {mediaAttachments.length ? (
              mediaAttachments.map((attachment) => (
                <article key={attachment.id} className="overflow-hidden rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)]">
                  <img src={attachment.mediaUrl ?? ""} alt={attachment.body} className="h-52 w-full object-cover" />
                  <div className="p-3 text-xs text-[color:var(--ni-muted)]">{new Date(attachment.createdAt).toLocaleString()}</div>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-4 text-sm text-[color:var(--ni-muted)]">
                No attachments uploaded yet.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ni-muted)]">Description</p>
          <p className="text-sm text-[color:var(--ni-text)]">{description}</p>
          <Link href={messagingHref} className="rounded-full bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white">
            Open messaging system
          </Link>
        </aside>
      </div>
    </section>
  );
}

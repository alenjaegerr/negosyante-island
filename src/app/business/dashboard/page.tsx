import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BusinessDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === Role.business_pending) redirect("/business/pending");
  if (user.role !== Role.business_verified) redirect("/feed");

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const totals = posts.reduce(
    (acc, post) => {
      acc.likes += post.likes;
      acc.views += post.views;
      return acc;
    },
    { likes: 0, views: 0 },
  );

  const trends = await prisma.trend.findMany({
    take: 5,
    orderBy: { growthPercent: "desc" },
  });

  return (
    <section className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Good day, {user.businessName ?? user.name}</h1>
        <p className="text-sm text-slate-600">Verified Business Dashboard</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4">Total Posts: <strong>{posts.length}</strong></div>
        <div className="rounded-xl bg-white p-4">Total Likes: <strong>{totals.likes}</strong></div>
        <div className="rounded-xl bg-white p-4">Total Views: <strong>{totals.views}</strong></div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Trending tags for your market</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {trends.map((trend) => (
            <li key={trend.id} className="flex justify-between">
              <span>{trend.keyword}</span>
              <span className="text-emerald-700">+{trend.growthPercent}% growth</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

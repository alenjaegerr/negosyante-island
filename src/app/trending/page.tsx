import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TrendingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const trends = await prisma.trend.findMany({
    orderBy: [{ engagementPercent: "desc" }],
    take: 10,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Trending Q + Negosyante Insight</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {trends.map((trend) => {
          const safePercent = Number.isFinite(trend.engagementPercent)
            ? Math.max(0, Math.min(100, trend.engagementPercent))
            : 0;

          return (
            <article key={trend.id} className="rounded-xl border bg-white p-4">
              <h2 className="text-lg font-semibold text-sky-700">{trend.keyword}</h2>
              <p className="text-sm text-slate-600">Views: {trend.views.toLocaleString()}</p>
              <p className="text-sm text-slate-600">Engagement: {safePercent}%</p>
              <div className="mt-3 h-2 rounded bg-slate-200">
                <div className="h-2 rounded bg-emerald-500" style={{ width: `${safePercent}%` }} />
              </div>
              <p className="mt-2 text-sm text-emerald-700">Growth: +{trend.growthPercent}%</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

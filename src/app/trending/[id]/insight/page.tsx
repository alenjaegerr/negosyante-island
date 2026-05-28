import { redirect } from "next/navigation";

export default async function TrendingInsightRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/trending/${id}`);
}

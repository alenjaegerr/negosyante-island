import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getPublishedTrendingPosts } from "@/lib/trending-posts";
import { DiscoveryConsole } from "@/components/discovery-console";
import { localBusinesses } from "@/lib/local-businesses";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === Role.admin) redirect("/admin");
    if (user.role === Role.business_pending || user.role === Role.business_verified) {
      redirect("/business/home");
    }
    redirect("/feed");
  }

  const posts = await getPublishedTrendingPosts(24);

  return (
    <DiscoveryConsole posts={posts} businesses={localBusinesses} />
  );
}

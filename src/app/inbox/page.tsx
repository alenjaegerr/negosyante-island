import { redirect } from "next/navigation";
import { buildMessagingShellHref } from "@/lib/messaging";

type InboxPageProps = {
  searchParams: Promise<{ conversationId?: string; targetUserId?: string }>;
};

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const { conversationId, targetUserId } = await searchParams;
  redirect(buildMessagingShellHref({ conversationId, targetUserId }));
}

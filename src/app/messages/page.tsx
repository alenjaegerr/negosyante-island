import { redirect } from "next/navigation";
import { buildMessagingShellHref } from "@/lib/messaging";

type MessagesPageProps = {
  searchParams: Promise<{ conversationId?: string; targetUserId?: string }>;
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const { conversationId, targetUserId } = await searchParams;
  redirect(buildMessagingShellHref({ conversationId, targetUserId }));
}
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";

type Viewer = {
  id: string;
  name: string;
  businessName?: string | null;
  avatarUrl?: string | null;
  role: string;
};

type BusinessContext = {
  slug: string;
  name: string;
  avatarUrl?: string | null;
  tagline?: string | null;
  category?: string | null;
  location?: string | null;
};

type ConversationParticipant = {
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    businessName?: string | null;
    businessTagline?: string | null;
    businessCategory?: string | null;
    businessLocation?: string | null;
    role: string;
  };
};

type ConversationSummary = {
  id: string;
  participants: ConversationParticipant[];
  messages: Array<{
    id: string;
    body: string;
    kind?: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    appointmentAt?: string | null;
    createdAt: string;
    senderId: string;
    sender?: {
      id: string;
      name: string;
      avatarUrl?: string | null;
      businessName?: string | null;
      role: string;
    };
  }>;
  updatedAt: string;
  lastMessageAt?: string | null;
};

type ConversationMessage = ConversationSummary["messages"][number];

type Props = {
  viewer: Viewer;
  businessContext: BusinessContext;
  initialConversationId?: string | null;
  targetParticipant?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    businessName?: string | null;
    businessTagline?: string | null;
    businessCategory?: string | null;
    businessLocation?: string | null;
    role: string;
  } | null;
};

function formatTimestamp(value?: string | null) {
  if (!value) return "No activity yet";
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function previewMessage(message?: ConversationMessage) {
  if (!message) return "No messages yet";
  if (message.kind === "appointment" && message.appointmentAt) {
    return `Appointment request • ${new Date(message.appointmentAt).toLocaleString()}`;
  }
  if (message.mediaUrl) {
    return message.kind === "gif" ? "Sent a GIF" : message.kind === "image" ? "Sent an image" : "Sent an attachment";
  }
  return message.body;
}

export default function BusinessMessagePlatform({ viewer, businessContext, initialConversationId, targetParticipant }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"chat" | "profiles">(() => (targetParticipant || initialConversationId ? "chat" : "profiles"));
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState<string | null>(null);
  const [appointmentAt, setAppointmentAt] = useState("");
  const [composerMode, setComposerMode] = useState<"text" | "image" | "gif" | "appointment">("text");
  const [sending, setSending] = useState(false);
  const bootstrapRef = useRef(false);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const activeParticipant = useMemo(() => {
    if (!activeConversation) return null;
    return activeConversation.participants.find((participant) => participant.user.id !== viewer.id)?.user ?? activeConversation.participants[0]?.user ?? null;
  }, [activeConversation, viewer.id]);

  const threadParticipant = activeParticipant ?? targetParticipant;
  const targetProfileLabel = threadParticipant ? threadParticipant.businessName ?? threadParticipant.name : businessContext.name;
  const targetProfileHref = threadParticipant
    ? threadParticipant.businessName
      ? `/business/message/${threadParticipant.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`
      : `/profile/${threadParticipant.id}`
    : `/business/${businessContext.slug}`;

  useEffect(() => {
    let ignore = false;

    async function loadConversations() {
      const response = await fetch("/api/conversations");
      if (!response.ok) return;
      const data = await response.json();
      if (ignore) return;
      const nextConversations: ConversationSummary[] = data.conversations ?? [];
      setConversations(nextConversations);

      if (initialConversationId && nextConversations.some((conversation) => conversation.id === initialConversationId)) {
        setActiveConversationId(initialConversationId);
        return;
      }

      if (targetParticipant) {
        const matchingConversation = nextConversations.find((conversation) =>
          conversation.participants.some((participant) => participant.user.id === targetParticipant.id),
        );

        if (matchingConversation) {
          setActiveConversationId(matchingConversation.id);
          return;
        }

        if (!bootstrapRef.current) {
          bootstrapRef.current = true;
          const createResponse = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ participantIds: [targetParticipant.id] }),
          });

          if (createResponse.ok && !ignore) {
            const createData = await createResponse.json();
            const conversationId = createData.conversation?.id;
            if (conversationId) {
              setActiveConversationId(conversationId);
              await loadConversations();
            }
          }
          return;
        }
      }

      setActiveConversationId((current) => {
        if (current && nextConversations.some((conversation) => conversation.id === current)) {
          return current;
        }
        return nextConversations[0]?.id ?? null;
      });
    }

    loadConversations();
    return () => {
      ignore = true;
    };
  }, [initialConversationId, targetParticipant]);

  useEffect(() => {
    if (!activeConversationId) return;

    let ignore = false;

    async function loadMessages() {
      const response = await fetch(`/api/conversations/${activeConversationId}/messages`);
      if (!response.ok) return;
      const data = await response.json();
      if (ignore) return;
      setMessages(data.messages ?? []);
    }

    loadMessages();
    return () => {
      ignore = true;
    };
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId && mobileView !== "chat") {
      requestAnimationFrame(() => setMobileView("chat"));
    }
  }, [activeConversationId, mobileView]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function handleAttachmentChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSelectedAttachment(null);
      setSelectedAttachmentType(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedAttachment(typeof reader.result === "string" ? reader.result : null);
      setSelectedAttachmentType(file.type);
      setComposerMode(file.type.includes("gif") ? "gif" : "image");
    };
    reader.readAsDataURL(file);
  }

  async function sendMessage() {
    if (!activeConversationId) return;
    const body = draft.trim();
    if (!body && !selectedAttachment && !appointmentAt) return;

    setSending(true);
    const payload: Record<string, string | null> = {
      body: body || (composerMode === "appointment" ? "Appointment request" : ""),
      kind: composerMode,
      mediaUrl: selectedAttachment,
      mediaType: selectedAttachmentType,
      appointmentAt: appointmentAt || null,
    };

    const response = await fetch(`/api/conversations/${activeConversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      setMessages((current) => [...current, data.message]);
      setDraft("");
      setSelectedAttachment(null);
      setSelectedAttachmentType(null);
      setAppointmentAt("");
      setComposerMode("text");
      router.refresh();
    }

    setSending(false);
  }

  return (
    <section className="mx-auto flex h-[calc(100dvh-8.5rem)] w-full max-w-7xl flex-col gap-1.5 overflow-hidden px-2 py-2 sm:px-4 md:h-[calc(100dvh-6.5rem)] md:gap-3 md:py-3">
      <div className="shrink-0 rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-2 py-1 shadow-sm sm:px-4 sm:py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] text-sm font-extrabold text-[color:var(--ni-brand)]">
              💬
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-black uppercase tracking-[0.24em] text-[color:var(--ni-text-strong)] sm:text-[14px]">MESSAGES</p>
            </div>
          </div>

        </div>

        <div className="mt-2 flex gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileView("profiles")}
            className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${mobileView === "profiles" ? "border-[color:var(--ni-brand)] bg-[color:var(--ni-accent-soft)] text-[color:var(--ni-brand)]" : "border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] text-[color:var(--ni-text-strong)]"}`}
          >
            👤 Profiles
          </button>
          <button
            type="button"
            onClick={() => setMobileView("chat")}
            className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${mobileView === "chat" ? "border-[color:var(--ni-brand)] bg-[color:var(--ni-accent-soft)] text-[color:var(--ni-brand)]" : "border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] text-[var(--ni-text-strong)]"}`}
          >
            💬 Message
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:gap-4">
        <aside className={`order-2 min-h-0 flex-1 flex-col rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-2 shadow-sm sm:p-3 lg:order-none lg:flex lg:flex-none lg:max-h-none ${mobileView === "profiles" ? "flex" : "hidden"}`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[color:var(--ni-text-strong)] sm:text-lg">Profiles</h2>
            <span className="rounded-full border border-[color:var(--ni-border)] px-2 py-0.5 text-xs text-[color:var(--ni-muted)]">{conversations.length}</span>
          </div>

          <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 lg:max-h-none">
            {conversations.map((conversation) => {
              const other = conversation.participants.find((participant) => participant.user.id !== viewer.id)?.user ?? conversation.participants[0]?.user;
              if (!other) return null;
              const lastMessage = conversation.messages[0];
              const isActive = conversation.id === activeConversationId;
              const profileMeta = [other.businessCategory ?? other.role, other.businessLocation].filter(Boolean).join(" • ");
              const profileHint = other.businessTagline ?? (lastMessage ? previewMessage(lastMessage) : "Ready for a first message");

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    setActiveConversationId(conversation.id);
                    setMobileView("chat");
                  }}
                  className={`flex w-full items-start gap-3 rounded-xl border p-2.5 text-left transition ${isActive ? "border-[color:var(--ni-brand)] bg-[color:var(--ni-accent-soft)]" : "border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] hover:bg-[color:var(--ni-surface-3)]"}`}
                >
                  <UserAvatar name={other.businessName ?? other.name} avatarUrl={other.avatarUrl} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-semibold text-[color:var(--ni-text-strong)]">{other.businessName ?? other.name}</p>
                      <div className="flex items-center gap-2 text-[11px] font-semibold">
                        {isActive ? (
                          <span className="rounded-full border border-[color:var(--ni-brand)] bg-[color:var(--ni-accent-soft)] px-2 py-0.5 text-[color:var(--ni-brand)]">Selected</span>
                        ) : null}
                        <span className="shrink-0 text-[color:var(--ni-muted)]">{formatTimestamp(lastMessage?.createdAt ?? conversation.lastMessageAt)}</span>
                      </div>
                    </div>
                    {profileMeta ? <p className="mt-1 truncate text-[10px] font-semibold text-[color:var(--ni-muted)]">{profileMeta}</p> : null}
                    <p className="mt-1 line-clamp-2 text-[11px] text-[color:var(--ni-text)]">{profileHint}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className={`order-1 min-h-0 flex-1 flex-col rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-2 shadow-sm sm:p-4 lg:order-none lg:flex ${mobileView === "chat" ? "flex" : "hidden"}`}>
          {activeConversation && activeParticipant ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[color:var(--ni-border)] pb-2 sm:gap-3 sm:pb-3">
                <div className="flex min-w-0 items-center gap-2">
                  <UserAvatar name={activeParticipant.businessName ?? activeParticipant.name} avatarUrl={activeParticipant.avatarUrl} size={36} />
                  <div>
                    <h2 className="truncate text-sm font-semibold text-[color:var(--ni-text-strong)]">{activeParticipant.businessName ?? activeParticipant.name}</h2>
                    <p className="truncate text-[10px] text-[color:var(--ni-text)]">
                      {activeParticipant.businessCategory ?? activeParticipant.role} {activeParticipant.businessLocation ? `• ${activeParticipant.businessLocation}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold sm:justify-end">
                  <Link href={`/profile/${activeParticipant.id}`} className="rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-1.5 text-[color:var(--ni-text-strong)]">
                    Open profile
                  </Link>
                  {activeParticipant.businessName ? (
                    <Link href={`/business/${businessContext.slug}`} className="rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-1.5 text-[color:var(--ni-text-strong)]">
                      Open business profile
                    </Link>
                  ) : null}
                </div>
              </div>

              <div ref={scrollRef} className="mt-2 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1 sm:mt-3">
                {messages.map((message) => {
                  const isMine = message.senderId === viewer.id;
                  return (
                    <article key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl border px-3 py-2.5 ${isMine ? "border-[color:var(--ni-brand)] bg-[color:var(--ni-accent-soft)]" : "border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)]"}`}>
                        <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em] text-[color:var(--ni-muted)]">
                          <span>{isMine ? "You" : message.sender?.businessName ?? message.sender?.name ?? "Participant"}</span>
                          <span>{formatTimestamp(message.createdAt)}</span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-[13px] text-[color:var(--ni-text-strong)]">{message.body}</p>
                        {message.kind === "appointment" && message.appointmentAt ? (
                          <div className="mt-2 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                            Appointment request • {new Date(message.appointmentAt).toLocaleString()}
                          </div>
                        ) : null}
                        {message.mediaUrl ? (
                          <div className="mt-2 overflow-hidden rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]">
                            <img src={message.mediaUrl} alt={message.kind === "gif" ? "GIF attachment" : "Attachment"} className="max-h-56 w-full object-contain" />
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="shrink-0 rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-1.5 sm:p-2">
                <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-[color:var(--ni-text-strong)] sm:gap-2">
                  <button type="button" onClick={() => setComposerMode("text")} className={`rounded-full px-2.5 py-1 ${composerMode === "text" ? "bg-[color:var(--ni-brand-cta)] text-white" : "border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]"}`}>Message</button>
                  <button type="button" onClick={() => setComposerMode("image")} className={`rounded-full px-2.5 py-1 ${composerMode === "image" ? "bg-[color:var(--ni-brand-cta)] text-white" : "border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]"}`}>Image</button>
                  <button type="button" onClick={() => setComposerMode("gif")} className={`rounded-full px-2.5 py-1 ${composerMode === "gif" ? "bg-[color:var(--ni-brand-cta)] text-white" : "border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]"}`}>GIF</button>
                  <button type="button" onClick={() => setComposerMode("appointment")} className={`rounded-full px-2.5 py-1 ${composerMode === "appointment" ? "bg-[color:var(--ni-brand-cta)] text-white" : "border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]"}`}>Appointment</button>
                </div>

                <div className="mt-1.5 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] sm:mt-2">
                  <div className="min-w-0">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      rows={2}
                      placeholder={composerMode === "appointment" ? "Describe the appointment request" : "Write your message"}
                      className="w-full rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-2.5 py-1.5 text-[13px] text-[color:var(--ni-text-strong)] placeholder:text-[color:var(--ni-muted)]"
                    />
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold sm:gap-2">
                      <label className="cursor-pointer rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-2 py-0.5 text-[color:var(--ni-text-strong)]">
                        Attach image / GIF
                        <input type="file" accept="image/*,.gif" className="hidden" onChange={handleAttachmentChange} />
                      </label>
                      <label className="rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-2 py-0.5 text-[color:var(--ni-text-strong)]">
                        Appointment time
                        <input type="datetime-local" value={appointmentAt} onChange={(event) => setAppointmentAt(event.target.value)} className="ml-2 bg-transparent text-[10px] outline-none" />
                      </label>
                    </div>
                    {selectedAttachment ? (
                      <div className="mt-2 overflow-hidden rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]">
                        <img src={selectedAttachment} alt="Attachment preview" className="max-h-36 w-full object-contain" />
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-row gap-2 md:flex-col md:self-start">
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={sending}
                      className="rounded-xl bg-[color:var(--ni-brand-cta)] px-2.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
                    >
                      {sending ? "Sending..." : composerMode === "appointment" ? "Request" : "Send"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft("");
                        setSelectedAttachment(null);
                        setSelectedAttachmentType(null);
                        setAppointmentAt("");
                        setComposerMode("text");
                      }}
                      className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-2.5 py-1.5 text-[12px] font-semibold text-[color:var(--ni-text-strong)]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : targetParticipant ? (
            <div className="flex min-h-0 flex-1 flex-col space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--ni-border)] pb-3">
                <div className="flex items-center gap-3">
                  <UserAvatar name={targetParticipant.businessName ?? targetParticipant.name} avatarUrl={targetParticipant.avatarUrl} size={52} />
                  <div>
                    <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">{targetParticipant.businessName ?? targetParticipant.name}</h2>
                    <p className="text-sm text-[color:var(--ni-text)]">
                      {targetParticipant.businessCategory ?? targetParticipant.role} {targetParticipant.businessLocation ? `• ${targetParticipant.businessLocation}` : ""}
                    </p>
                  </div>
                </div>
                <div className="rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ni-text-strong)]">
                  Opening conversation...
                </div>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-8 text-center text-sm text-[color:var(--ni-muted)]">
                Preparing the conversation with this profile.
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-8 text-center text-sm text-[color:var(--ni-muted)]">
              Select a profile on the left to open the full conversation.
            </div>
          )}
        </main>

      </div>
    </section>
  );
}

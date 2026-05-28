"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ForumCommentFormProps = {
  threadId: string;
  onPosted?: () => void;
};

export default function ForumCommentForm({ threadId, onPosted }: ForumCommentFormProps) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");
  const router = useRouter();

  async function onAttachmentChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setMediaUrl(typeof reader.result === "string" ? reader.result : null);
      setMediaType(file.type || "image/*");
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;

    setStatus("saving");
    const response = await fetch(`/api/forums/threads/${threadId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, mediaUrl, mediaType }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setContent("");
    setMediaUrl(null);
    setMediaType(null);
    setStatus("saved");
    onPosted?.();
    router.refresh();
    setTimeout(() => setStatus("idle"), 1200);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Join the thread</h3>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={3}
        placeholder="Write your reply"
        className="mt-2 w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text-strong)]"
      />
      <label className="mt-2 block rounded border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text)]">
        <span className="font-semibold text-[color:var(--ni-text-strong)]">Add image / GIF</span>
        <input type="file" accept="image/*,.gif" className="mt-2 block w-full text-xs" onChange={onAttachmentChange} />
      </label>
      {mediaUrl ? (
        <div className="mt-2 overflow-hidden rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)]">
          <img src={mediaUrl} alt="Comment attachment preview" className="max-h-64 w-full object-contain" />
        </div>
      ) : null}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-sm font-semibold text-white"
        >
          {status === "saving" ? "Posting..." : "Reply"}
        </button>
        {status === "saved" ? <span className="text-xs text-emerald-600">Sent!</span> : null}
        {status === "error" ? <span className="text-xs text-rose-600">Failed to send.</span> : null}
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ForumThreadFormProps = {
  onCreated?: () => void;
};

export default function ForumThreadForm({ onCreated }: ForumThreadFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setStatus("saving");
    const response = await fetch("/api/forums/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, mediaUrl, mediaType }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setTitle("");
    setBody("");
    setMediaUrl(null);
    setMediaType(null);
    setStatus("saved");
    onCreated?.();
    router.refresh();
    setTimeout(() => setStatus("idle"), 1200);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Start a thread</h2>
      <p className="mt-1 text-sm text-[color:var(--ni-text)]">Ask a question, share an update, or start a business discussion.</p>

      <div className="mt-3 space-y-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Thread title"
          className="w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text-strong)]"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What do you want to share with the island?"
          rows={4}
          className="w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text-strong)]"
        />
        <label className="block rounded border border-dashed border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-sm text-[color:var(--ni-text)]">
          <span className="font-semibold text-[color:var(--ni-text-strong)]">Add image / GIF</span>
          <input type="file" accept="image/*,.gif" className="mt-2 block w-full text-xs" onChange={onAttachmentChange} />
        </label>
        {mediaUrl ? (
          <div className="overflow-hidden rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)]">
            <img src={mediaUrl} alt="Forum attachment preview" className="max-h-64 w-full object-contain" />
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1.5 text-sm font-semibold text-white"
        >
          {status === "saving" ? "Posting..." : "Post thread"}
        </button>
        {status === "saved" ? <span className="text-xs text-emerald-600">Posted!</span> : null}
        {status === "error" ? <span className="text-xs text-rose-600">Failed to post.</span> : null}
      </div>
    </form>
  );
}

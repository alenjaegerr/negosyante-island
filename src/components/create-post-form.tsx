"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreatePostForm() {
  const router = useRouter();
  const [content, setContent] = useState("");

  async function createPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      setContent("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={createPost} className="space-y-2 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4">
      <textarea className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" placeholder="Share what is trending on the island..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
      <button className="rounded bg-[var(--ni-brand-cta)] px-4 py-2 text-white" type="submit">Post</button>
    </form>
  );
}

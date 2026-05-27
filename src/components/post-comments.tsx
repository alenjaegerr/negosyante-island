"use client";

import { useEffect, useState } from "react";

type CommentItem = {
  id: string;
  content: string;
  author?: { name?: string | null; businessName?: string | null; avatarUrl?: string | null } | null;
};

export default function PostComments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`).then((r) => r.json()).then((d) => setComments(d.comments || [])).catch(() => setComments([]));
  }, [postId]);

  async function submit() {
    const safe = text.trim();
    if (!safe) return;
    const res = await fetch(`/api/posts/${postId}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: safe }) });
    if (!res.ok) return;
    const { comment } = await res.json();
    setComments((c) => [...c, comment]);
    setText("");
  }

  return (
    <div className="mt-3">
      <div className="space-y-2">
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded border px-2 py-1 text-sm" placeholder="Write a comment" />
          <button onClick={submit} className="rounded bg-[color:var(--ni-brand-cta)] px-3 py-1 text-sm text-white">Comment</button>
        </div>
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-2 text-sm">
              <div className="text-xs text-[color:var(--ni-muted)]">{c.author?.businessName ?? c.author?.name}</div>
              <div className="mt-1">{c.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

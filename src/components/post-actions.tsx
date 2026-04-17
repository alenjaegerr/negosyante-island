"use client";

import { useState } from "react";

type Post = {
  id: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
};

export function PostActions({ post }: { post: Post }) {
  const [counts, setCounts] = useState(post);

  async function interact(type: "like" | "comment" | "share" | "view") {
    const response = await fetch(`/api/posts/${post.id}/interact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });

    if (response.ok) {
      const data = await response.json();
      setCounts((prev) => ({ ...prev, ...data.post }));
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-sm">
      <button className="rounded border border-rose-400/40 bg-rose-500/15 px-2 py-1 text-rose-100" onClick={() => interact("like")}>❤️ {counts.likes}</button>
      <button className="rounded border border-blue-400/40 bg-blue-500/15 px-2 py-1 text-blue-100" onClick={() => interact("comment")}>💬 {counts.comments}</button>
      <button className="rounded border border-emerald-400/40 bg-emerald-500/15 px-2 py-1 text-emerald-100" onClick={() => interact("share")}>🔁 {counts.shares}</button>
      <button className="rounded border border-amber-400/40 bg-amber-500/15 px-2 py-1 text-amber-100" onClick={() => interact("view")}>👁️ {counts.views}</button>
    </div>
  );
}

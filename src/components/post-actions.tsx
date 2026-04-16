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
      <button className="rounded bg-rose-100 px-2 py-1" onClick={() => interact("like")}>❤️ {counts.likes}</button>
      <button className="rounded bg-blue-100 px-2 py-1" onClick={() => interact("comment")}>💬 {counts.comments}</button>
      <button className="rounded bg-emerald-100 px-2 py-1" onClick={() => interact("share")}>🔁 {counts.shares}</button>
      <button className="rounded bg-amber-100 px-2 py-1" onClick={() => interact("view")}>👁️ {counts.views}</button>
    </div>
  );
}

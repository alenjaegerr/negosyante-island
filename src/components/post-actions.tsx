"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Post = {
  id: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
};

type PostActionsProps = {
  post: Post;
  isAuthenticated?: boolean;
  authPromptHref?: string;
  canDelete?: boolean;
};

export function PostActions({ post, isAuthenticated = true, authPromptHref = "/signup", canDelete = false }: PostActionsProps) {
  const [counts, setCounts] = useState(post);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const buttonClass =
    "rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-2 py-1 text-[var(--ni-text-strong)] transition-colors hover:border-[color:var(--ni-brand)] hover:bg-[var(--ni-accent-soft)] hover:text-[var(--ni-brand)]";

  async function deletePost() {
    if (!canDelete || isDeleting) return;
    const confirmed = window.confirm("Delete this post? This cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (response.ok) {
        router.refresh();
      }
    } finally {
      setIsDeleting(false);
    }
  }

  async function interact(type: "like" | "comment" | "share" | "view") {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

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
    <div className="mt-3">
      <div className="flex flex-wrap gap-2 text-sm">
        <button className={buttonClass} onClick={() => interact("like")}>❤️ {counts.likes}</button>
        <button className={buttonClass} onClick={() => interact("comment")}>💬 {counts.comments}</button>
        <button className={buttonClass} onClick={() => interact("share")}>🔁 {counts.shares}</button>
        <button className={buttonClass} onClick={() => interact("view")}>👁️ {counts.views}</button>
        {canDelete ? (
          <button
            className="rounded border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-rose-100 transition-colors hover:border-rose-300 hover:bg-rose-500/20"
            onClick={deletePost}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "🗑️ Delete"}
          </button>
        ) : null}
      </div>

      {!isAuthenticated && showAuthPrompt ? (
        <div className="mt-2 rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-3 py-2 text-xs text-[color:var(--ni-text)]">
          Create an account to react, comment, or share.
          <Link href={authPromptHref} className="ml-2 inline-flex font-semibold text-[color:var(--ni-brand)]">
            Sign up
          </Link>
        </div>
      ) : null}
    </div>
  );
}

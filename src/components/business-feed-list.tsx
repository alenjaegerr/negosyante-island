"use client";

import { useEffect, useMemo, useState } from "react";
import type { LocalBusinessPost } from "@/lib/local-businesses";

type BusinessFeedListProps = {
  businessSlug: string;
  posts: LocalBusinessPost[];
};

type PostState = {
  likes: number;
  isLiked: boolean;
  comments: string[];
};

export function BusinessFeedList({ businessSlug, posts }: BusinessFeedListProps) {
  const initialState = useMemo<Record<string, PostState>>(() => {
    const state: Record<string, PostState> = {};
    for (const post of posts) {
      state[post.id] = { likes: 0, isLiked: false, comments: [] };
    }
    return state;
  }, [posts]);

  const [state, setState] = useState(initialState);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      const results = await Promise.all(
        posts.map(async (post) => {
          const response = await fetch(`/api/business/${businessSlug}/feed/${post.id}/interactions`);
          if (!response.ok) return null;
          const data = await response.json();
          return {
            id: post.id,
            likes: Number(data.likes ?? 0),
            isLiked: Boolean(data.isLiked),
            comments: Array.isArray(data.comments) ? data.comments.map((comment: { authorName: string; content: string }) => `${comment.authorName}: ${comment.content}`) : [],
          };
        }),
      );

      if (ignore) return;

      setState((prev) => {
        const next = { ...prev };
        for (const result of results) {
          if (!result) continue;
          next[result.id] = {
            likes: result.likes,
            isLiked: result.isLiked,
            comments: result.comments,
          };
        }
        return next;
      });
    }

    loadStats();
    return () => {
      ignore = true;
    };
  }, [businessSlug, posts]);

  async function likePost(postId: string, isLiked: boolean) {
    const response = await fetch(`/api/business/${businessSlug}/feed/${postId}/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: isLiked ? "unlike" : "like" }),
    });

    if (!response.ok) return;
    const data = await response.json();
    setState((prev) => ({
      ...prev,
      [postId]: {
        likes: Number(data.likes ?? prev[postId]?.likes ?? 0),
        isLiked: Boolean(data.isLiked),
        comments: Array.isArray(data.comments) ? data.comments.map((comment: { authorName: string; content: string }) => `${comment.authorName}: ${comment.content}`) : prev[postId]?.comments ?? [],
      },
    }));
  }

  async function addComment(postId: string) {
    const text = (drafts[postId] ?? "").trim();
    if (!text) return;

    const response = await fetch(`/api/business/${businessSlug}/feed/${postId}/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "comment", content: text }),
    });

    if (!response.ok) return;
    const data = await response.json();
    setState((prev) => ({
      ...prev,
      [postId]: {
        likes: Number(data.likes ?? prev[postId]?.likes ?? 0),
        isLiked: Boolean(data.isLiked),
        comments: Array.isArray(data.comments) ? data.comments.map((comment: { authorName: string; content: string }) => `${comment.authorName}: ${comment.content}`) : prev[postId]?.comments ?? [],
      },
    }));
    setDrafts((prev) => ({ ...prev, [postId]: "" }));
  }

  return (
    <div className="mt-5 space-y-3">
      {posts.map((post) => {
        const postState = state[post.id] ?? { likes: 0, isLiked: false, comments: [] };
        return (
          <article key={post.id} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-flex-bold text-base text-[var(--ni-text-strong)]">{post.title}</h2>
              <span className="text-xs text-[var(--ni-text)]">{post.postedAt}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--ni-text)]">{post.excerpt}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => likePost(post.id, postState.isLiked)}
                className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1 text-xs font-semibold text-[var(--ni-text-strong)]"
              >
                {postState.isLiked ? "✅ Liked" : "👍 React"} ({postState.likes})
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={drafts[post.id] ?? ""}
                  onChange={(event) => setDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))}
                  className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1.5 text-xs text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]"
                  placeholder="Write a comment"
                />
                <button
                  type="button"
                  onClick={() => addComment(post.id)}
                  className="rounded bg-cyan-700 px-2 py-1.5 text-xs font-semibold text-white"
                >
                  Comment
                </button>
              </div>

              {postState.comments.length > 0 ? (
                <ul className="space-y-1">
                  {postState.comments.map((comment, index) => (
                    <li key={`${post.id}-${index}`} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1 text-xs text-[var(--ni-text)]">
                      {comment}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

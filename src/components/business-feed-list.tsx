"use client";

import { useMemo, useState } from "react";
import type { LocalBusinessPost } from "@/lib/local-businesses";

type BusinessFeedListProps = {
  posts: LocalBusinessPost[];
};

type PostState = {
  likes: number;
  comments: string[];
};

export function BusinessFeedList({ posts }: BusinessFeedListProps) {
  const initialState = useMemo<Record<string, PostState>>(() => {
    const state: Record<string, PostState> = {};
    for (const post of posts) {
      state[post.id] = { likes: 0, comments: [] };
    }
    return state;
  }, [posts]);

  const [state, setState] = useState(initialState);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function likePost(postId: string) {
    setState((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        likes: prev[postId].likes + 1,
      },
    }));
  }

  function addComment(postId: string) {
    const text = (drafts[postId] ?? "").trim();
    if (!text) return;
    setState((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        comments: [...prev[postId].comments, text],
      },
    }));
    setDrafts((prev) => ({ ...prev, [postId]: "" }));
  }

  return (
    <div className="mt-5 space-y-3">
      {posts.map((post) => {
        const postState = state[post.id] ?? { likes: 0, comments: [] };
        return (
          <article key={post.id} className="rounded border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-flex-bold text-base text-slate-900">{post.title}</h2>
              <span className="text-xs text-slate-500">{post.postedAt}</span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{post.excerpt}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => likePost(post.id)}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
              >
                👍 React ({postState.likes})
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={drafts[post.id] ?? ""}
                  onChange={(event) => setDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
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
                    <li key={`${post.id}-${index}`} className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
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

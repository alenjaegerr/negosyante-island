"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { maybeCompressMedia } from "@/components/sitewide-media-upload-enhancer";

export function CreatePostForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  async function createPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const imageFile = formData.get("imageFile");
    const gifFile = formData.get("gifFile");
    const videoFile = formData.get("videoFile");
    const hasImage = imageFile instanceof File && imageFile.size > 0;
    const hasGif = gifFile instanceof File && gifFile.size > 0;
    const hasVideo = videoFile instanceof File && videoFile.size > 0;

    if (!String(formData.get("content") ?? "").trim() && !hasImage && !hasGif && !hasVideo) {
      return;
    }

    if (imageFile instanceof File && imageFile.size > 0) {
      formData.set("imageFile", await maybeCompressMedia(imageFile));
    }

    if (gifFile instanceof File && gifFile.size > 0) {
      formData.set("gifFile", await maybeCompressMedia(gifFile));
    }

    if (videoFile instanceof File && videoFile.size > 0) {
      formData.set("videoFile", await maybeCompressMedia(videoFile));
    }

    const response = await fetch("/api/posts", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      setContent("");
      formRef.current?.reset();
      router.refresh();
    }
  }

  return (
    <form ref={formRef} onSubmit={createPost} className="space-y-3 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4">
      <textarea
        name="content"
        className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]"
        placeholder="Share what is trending on the island..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />

      <div className="grid gap-2 text-sm md:grid-cols-3">
        <label className="rounded-lg border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-[var(--ni-text-strong)]">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ni-muted)]">Image</span>
          <input name="imageFile" type="file" accept="image/*" className="mt-2 block w-full text-xs text-[var(--ni-text-strong)]" />
        </label>
        <label className="rounded-lg border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-[var(--ni-text-strong)]">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ni-muted)]">GIF</span>
          <input name="gifFile" type="file" accept="image/gif" className="mt-2 block w-full text-xs text-[var(--ni-text-strong)]" />
        </label>
        <label className="rounded-lg border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-[var(--ni-text-strong)]">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ni-muted)]">Video</span>
          <input name="videoFile" type="file" accept="video/mp4" className="mt-2 block w-full text-xs text-[var(--ni-text-strong)]" />
        </label>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ni-muted)]" htmlFor="post-hashtags">
          Hashtags
        </label>
        <input
          id="post-hashtags"
          name="hashtags"
          type="text"
          placeholder="#CoffeePH #IslandLatte or coffee, island, trend"
          className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]"
        />
        <p className="text-xs text-[color:var(--ni-muted)]">Add hashtags here, or include them in the post body. We’ll turn them into tags automatically.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded bg-[var(--ni-brand-cta)] px-4 py-2 text-white" type="submit">Post</button>
        <p className="text-xs text-[var(--ni-muted)]">You can upload one image, GIF, or MP4 video alongside your post.</p>
      </div>
    </form>
  );
}

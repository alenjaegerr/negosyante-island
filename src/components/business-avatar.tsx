"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

type BusinessAvatarProps = {
  slug: string;
  initials: string;
  online: boolean;
  canUpload: boolean;
  avatarUrl?: string | null;
};

export function BusinessAvatar({ slug, initials, online, canUpload, avatarUrl }: BusinessAvatarProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!canUpload) return;

    async function loadAvatar() {
      const response = await fetch("/api/me/avatar");
      if (!response.ok) return;
      const data = await response.json();
      if (ignore) return;
      setImageSrc(data.avatarUrl ?? null);
    }

    loadAvatar();
    return () => {
      ignore = true;
    };
  }, [canUpload, slug]);

  const resolvedAvatarUrl = imageSrc ?? avatarUrl ?? null;

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const formData = new FormData();
    formData.set("avatar", file);

    const response = await fetch("/api/me/avatar", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Upload failed" }));
      setUploadError(data.error ?? "Upload failed");
      return;
    }

    const data = await response.json();
    setImageSrc(data.avatarUrl ?? null);
  }

  return (
    <div className="relative shrink-0">
      {resolvedAvatarUrl ? (
        <Image
          src={resolvedAvatarUrl}
          alt="Business profile"
          width={80}
          height={80}
          className="h-20 w-20 rounded-full border-4 border-cyan-700 object-cover"
        />
      ) : (
        <div className="font-reddit flex h-20 w-20 items-center justify-center rounded-full border-4 border-cyan-700 bg-cyan-100 text-2xl font-extrabold text-cyan-900">
          {initials}
        </div>
      )}
      <span
        className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${online ? "bg-emerald-500" : "bg-zinc-400"}`}
        aria-hidden
      />
      {canUpload ? (
        <div>
          <label className="mt-2 block cursor-pointer rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
            Upload photo
            <input className="hidden" type="file" accept="image/*" onChange={onUpload} />
          </label>
          {uploadError ? <p className="mt-1 text-[11px] text-rose-700">{uploadError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

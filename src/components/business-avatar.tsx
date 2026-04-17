"use client";

import Image from "next/image";
import { useState } from "react";
import type { ChangeEvent } from "react";

type BusinessAvatarProps = {
  slug: string;
  initials: string;
  online: boolean;
  canUpload: boolean;
};

export function BusinessAvatar({ slug, initials, online, canUpload }: BusinessAvatarProps) {
  const imageKey = `ni-business-avatar-${slug}`;
  const [imageSrc, setImageSrc] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(imageKey);
  });

  function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : null;
      if (!value) return;
      setImageSrc(value);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(imageKey, value);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative shrink-0">
      {imageSrc ? (
        <Image
          src={imageSrc}
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
        <label className="mt-2 block cursor-pointer rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
          Upload photo
          <input className="hidden" type="file" accept="image/*" onChange={onUpload} />
        </label>
      ) : null}
    </div>
  );
}

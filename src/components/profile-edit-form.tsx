"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageCropDialog from "@/components/image-crop-dialog";

type ProfileEditFormProps = {
  redirectTo: string;
};

type CropTarget = {
  kind: "avatar" | "background";
  file: File;
};

async function uploadCroppedImage(file: File, kind: "avatar" | "background") {
  const fd = new FormData();
  fd.append("kind", kind);
  fd.append("file", file);

  const response = await fetch("/api/uploads/user", { method: "POST", body: fd });
  if (!response.ok) {
    throw new Error("upload-failed");
  }

  const data = await response.json();
  if (typeof data?.url !== "string") {
    throw new Error("missing-upload-url");
  }

  return data.url as string;
}

export function ProfileEditForm({ redirectTo }: ProfileEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessTagline, setBusinessTagline] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [backgroundPhotoUrl, setBackgroundPhotoUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const response = await fetch("/api/me");
      if (!response.ok) return;

      const data = await response.json();
      if (ignore) return;

      setName(data.user?.name ?? "");
      setBusinessName(data.user?.businessName ?? "");
      setBusinessTagline(data.user?.businessTagline ?? "");
      setBusinessCategory(data.user?.businessCategory ?? "");
      setBusinessLocation(data.user?.businessLocation ?? "");
      setAvatarUrl(data.user?.avatarUrl ?? "");
      setBackgroundPhotoUrl(data.user?.backgroundPhotoUrl ?? "");
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");

    const response = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        businessName,
        businessTagline,
        businessCategory,
        businessLocation,
        avatarUrl,
        backgroundPhotoUrl,
      }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("saved");
    setTimeout(() => router.push(redirectTo), 700);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label className="block">
        <div className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Display Name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-2" />
      </label>

      <label className="block">
        <div className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Business Name</div>
        <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1 w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-2" />
      </label>

      <label className="block">
        <div className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Tagline / Short description</div>
        <input value={businessTagline} onChange={(e) => setBusinessTagline(e.target.value)} className="mt-1 w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-2" />
      </label>

      <label className="block">
        <div className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Category</div>
        <input value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} className="mt-1 w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-2" />
      </label>

      <label className="block">
        <div className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Location (city)</div>
        <input value={businessLocation} onChange={(e) => setBusinessLocation(e.target.value)} className="mt-1 w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-2" />
      </label>

      <label className="block">
        <div className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Avatar</div>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setStatus(null);
              setCropTarget({ kind: "avatar", file });
            }}
            className="mt-1"
          />
          {uploadingAvatar ? <span className="text-sm">Uploading...</span> : null}
        </div>
        {avatarUrl ? <div className="mt-2 text-xs text-[color:var(--ni-muted)]">Current: <a className="text-sky-600 underline" href={avatarUrl}>{avatarUrl}</a></div> : null}
      </label>

      <label className="block">
        <div className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Background photo</div>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setStatus(null);
              setCropTarget({ kind: "background", file });
            }}
            className="mt-1"
          />
          {uploadingBackground ? <span className="text-sm">Uploading...</span> : null}
        </div>
        {backgroundPhotoUrl ? <div className="mt-2 text-xs text-[color:var(--ni-muted)]">Current: <a className="text-sky-600 underline" href={backgroundPhotoUrl}>{backgroundPhotoUrl}</a></div> : null}
      </label>

      <div className="flex items-center gap-2">
        <button type="submit" className="rounded bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white">Save</button>
        {status === "saving" ? <p className="text-sm">Saving...</p> : null}
        {status === "saved" ? <p className="text-sm text-emerald-600">Saved!</p> : null}
        {status === "error" ? <p className="text-sm text-rose-600">Failed to save</p> : null}
        {status === "avatar-upload-error" ? <p className="text-sm text-rose-600">Avatar upload failed</p> : null}
        {status === "background-upload-error" ? <p className="text-sm text-rose-600">Background upload failed</p> : null}
      </div>

      <ImageCropDialog
        open={Boolean(cropTarget)}
        file={cropTarget?.file ?? null}
        aspect={cropTarget?.kind === "avatar" ? 1 : 16 / 9}
        outputWidth={cropTarget?.kind === "avatar" ? 512 : 1600}
        outputHeight={cropTarget?.kind === "avatar" ? 512 : 900}
        title={cropTarget?.kind === "avatar" ? "Crop your avatar" : "Crop your background photo"}
        description={cropTarget?.kind === "avatar" ? "Drag the square crop to frame your face or logo." : "Frame the scene for your profile header and cards."}
        onCancel={() => setCropTarget(null)}
        onConfirm={async (croppedFile) => {
          if (!cropTarget) return;
          if (cropTarget.kind === "avatar") setUploadingAvatar(true);
          if (cropTarget.kind === "background") setUploadingBackground(true);

          try {
            const url = await uploadCroppedImage(croppedFile, cropTarget.kind);
            if (cropTarget.kind === "avatar") setAvatarUrl(url);
            if (cropTarget.kind === "background") setBackgroundPhotoUrl(url);
          } catch {
            setStatus(cropTarget.kind === "avatar" ? "avatar-upload-error" : "background-upload-error");
          } finally {
            setUploadingAvatar(false);
            setUploadingBackground(false);
            setCropTarget(null);
          }
        }}
      />
    </form>
  );
}

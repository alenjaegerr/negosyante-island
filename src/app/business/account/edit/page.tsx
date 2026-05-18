"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditBusinessAccount() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = await res.json();
      if (ignore) return;
      setName(data.user?.name ?? "");
      setBusinessName(data.user?.businessName ?? "");
      setAvatarUrl(data.user?.avatarUrl ?? "");
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, businessName, avatarUrl }),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setStatus("saved");
    setTimeout(() => router.push("/business/account"), 700);
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5">
        <h1 className="text-2xl font-semibold text-[color:var(--ni-text-strong)]">Edit Profile</h1>
        <p className="mt-1 text-sm text-[color:var(--ni-text)]">Update your display name, business name, and profile picture URL.</p>
      </div>

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
          <div className="text-sm font-semibold text-[color:var(--ni-text-strong)]">Avatar URL</div>
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="mt-1 w-full rounded border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] p-2" />
        </label>

        <div className="flex items-center gap-2">
          <button type="submit" className="rounded bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white">Save</button>
          {status === "saving" ? <p className="text-sm">Saving...</p> : null}
          {status === "saved" ? <p className="text-sm text-emerald-600">Saved!</p> : null}
          {status === "error" ? <p className="text-sm text-rose-600">Failed to save</p> : null}
        </div>
      </form>
    </section>
  );
}

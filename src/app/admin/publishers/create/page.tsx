"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePublisherPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/publishers/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      router.push(`/admin?trendingSuccess=publisher_created`);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-5">
        <h1 className="text-2xl font-semibold text-[var(--ni-text-strong)]">Create Publisher Account</h1>
        <p className="mt-1 text-sm text-[var(--ni-text)]">Create a verified publisher account for your authors or staff.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4">
        {error ? <div className="mb-3 rounded bg-rose-500/10 p-2 text-sm text-rose-600">{error}</div> : null}

        <div className="grid gap-2 md:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded border p-2" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded border p-2" />
        </div>

        <div className="mt-2">
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Temporary password" className="w-full rounded border p-2" />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button type="submit" disabled={loading} className="rounded bg-[var(--ni-brand)] px-3 py-2 text-sm font-semibold text-[var(--ni-surface-1)]">{loading ? "Creating…" : "Create Publisher"}</button>
        </div>
      </form>
    </section>
  );
}

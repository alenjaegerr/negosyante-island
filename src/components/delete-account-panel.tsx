"use client";

import { useState } from "react";

type DeleteAccountPanelProps = {
  accountLabel: string;
};

export function DeleteAccountPanel({ accountLabel }: DeleteAccountPanelProps) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/me/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Account deletion failed.");
        return;
      }

      window.location.href = data.redirectTo ?? "/trending";
    } catch {
      setError("Account deletion failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-rose-400/60 bg-rose-500/10 p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-rose-700">Delete account</h2>
      <p className="mt-2 text-sm text-[color:var(--ni-text)]">
        This anonymizes {accountLabel}, removes profile details, blocks future login, and keeps existing public posts and forum activity as Deleted User.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm font-semibold text-[color:var(--ni-text-strong)]">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[color:var(--ni-text-strong)]">
          Type DELETE to confirm
          <input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-2 text-sm"
            required
          />
        </label>
        {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-max rounded border border-rose-700 bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Deleting..." : "Delete my account"}
        </button>
      </form>
    </div>
  );
}

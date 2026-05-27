"use client";

import React from "react";

type Article = { id: string; title: string };

export function PublisherInsightForm({ articles }: { articles: Article[] }) {
  return (
    <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3">
      <h3 className="text-sm font-semibold">Negosyante Insight</h3>
      <p className="mt-1 text-xs text-[var(--ni-muted)]">Add or update an insight for an existing article.</p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const editId = (form.elements.namedItem("editId") as HTMLSelectElement).value;
          const insightTitle = (form.elements.namedItem("insightTitle") as HTMLInputElement).value;
          const insightBody = (form.elements.namedItem("insightBody") as HTMLTextAreaElement).value;
          const insightSignalsRaw = (form.elements.namedItem("insightSignals") as HTMLTextAreaElement).value;
          const insightSignals = insightSignalsRaw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
          const insightStat1Label = (form.elements.namedItem("insightStat1Label") as HTMLInputElement).value || "";
          const insightStat1Value = Number((form.elements.namedItem("insightStat1Value") as HTMLInputElement).value) || 0;
          const insightStat1Color = (form.elements.namedItem("insightStat1Color") as HTMLSelectElement).value || "bg-cyan-500";

          const insightStats = [{ label: insightStat1Label, value: insightStat1Value, color: insightStat1Color }];

          try {
            const res = await fetch("/api/admin/trending-posts/insight", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ editId, insightTitle, insightBody, insightSignals, insightStats }),
            });
            if (res.ok) {
              window.location.reload();
            } else {
              const data = await res.json();
              alert(data?.error || "Failed to save insight");
            }
          } catch (err) {
            console.error(err);
            alert("Failed to save insight");
          }
        }}
      >
        <label className="text-xs">Article</label>
        <select name="editId" className="rounded border p-2 w-full">
          {articles.map((a) => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>

        <label className="text-xs mt-2">Insight title</label>
        <input name="insightTitle" className="rounded border p-2 w-full" />

        <label className="text-xs mt-2">Insight body</label>
        <textarea name="insightBody" rows={3} className="rounded border p-2 w-full" />

        <label className="text-xs mt-2">Insight signals</label>
        <textarea name="insightSignals" rows={2} className="rounded border p-2 w-full" placeholder="One per line or comma-separated" />

        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <input name="insightStat1Label" placeholder="Stat 1 label" className="rounded border p-2" />
          <input name="insightStat1Value" type="number" min={0} max={100} placeholder="Value" className="rounded border p-2" />
          <select name="insightStat1Color" className="rounded border p-2">
            <option value="bg-cyan-500">Cyan</option>
            <option value="bg-amber-400">Amber</option>
            <option value="bg-rose-500">Rose</option>
            <option value="bg-emerald-400">Emerald</option>
            <option value="bg-indigo-500">Indigo</option>
          </select>
        </div>

        <div className="mt-3">
          <button type="submit" className="rounded bg-[var(--ni-brand)] px-3 py-2 text-sm font-semibold text-[var(--ni-surface-1)]">Save Insight</button>
        </div>
      </form>
    </div>
  );
}

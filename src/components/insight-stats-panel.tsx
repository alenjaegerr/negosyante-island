"use client"
import React from "react";

type Stat = { label: string; value: number; color?: string };

const mockStats: Stat[] = [
  { label: "Buzz Share", value: 78, color: "bg-rose-500" },
  { label: "Engagement", value: 64, color: "bg-indigo-500" },
  { label: "Hashtag Reach", value: 52, color: "bg-amber-400" },
  { label: "Sentiment Positive", value: 31, color: "bg-green-400" },
];

export default function InsightStatsPanel({ visible = true }: { visible?: boolean }) {
  return (
    <aside className="w-full">
      <div className="rounded-2xl border bg-[color:var(--ni-surface-1)] border-[color:var(--ni-border)] p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">Negosyante Insight</p>
        <h2 className="mt-3 text-sm font-medium text-[color:var(--ni-text-strong)]">Trend statistics</h2>

        <div className="mt-4 space-y-3">
          {mockStats.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between text-xs text-[color:var(--ni-text)] mb-1">
                <span>{s.label}</span>
                <span className="font-semibold">{s.value}%</span>
              </div>
              <div className="h-3 rounded-full bg-[color:var(--ni-surface-2)] overflow-hidden">
                <div className={`${s.color} h-full rounded-full`} style={{ width: `${s.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-[color:var(--ni-muted)]">Data: sample mock from 1.2B user index (dev)</div>
        <a
          href="/login"
          className="mt-4 inline-flex w-full justify-center rounded-full bg-[color:var(--ni-brand-cta)] px-3 py-2 text-sm font-semibold text-white"
        >
          Sign up / Login to verify
        </a>
      </div>
    </aside>
  );
}

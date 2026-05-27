"use client";
import React from "react";

type Stat = { label: string; value: number; color?: string; note?: string };

type InsightStatsPanelProps = {
  visible?: boolean;
  eyebrow?: string;
  title?: string;
  stats?: Stat[];
  signals?: string[];
  footnote?: string;
  meta?: string;
  cta?: { href: string; label: string } | null;
};

const mockStats: Stat[] = [
  { label: "Buzz Share", value: 78, color: "bg-rose-500" },
  { label: "Engagement", value: 64, color: "bg-indigo-500" },
  { label: "Hashtag Reach", value: 52, color: "bg-amber-400" },
  { label: "Sentiment Positive", value: 31, color: "bg-green-400" },
];

const defaultSignals = [
  "Cross-platform chatter",
  "Local business pickup",
  "High-intent viewers",
];

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export default function InsightStatsPanel({
  visible = true,
  eyebrow = "Negosyante Insight",
  title = "Trend statistics",
  stats,
  signals,
  footnote = "Signal refresh: every 6 hours",
  meta,
  cta,
}: InsightStatsPanelProps) {
  if (!visible) return null;

  const resolvedStats = (stats && stats.length ? stats : mockStats).map((stat) => ({
    ...stat,
    value: clampPercent(stat.value),
  }));
  const resolvedSignals = signals && signals.length ? signals : defaultSignals;
  const resolvedCta = cta === undefined ? { href: "/login", label: "Sign up / Login to verify" } : cta;

  return (
    <aside className="w-full">
      <div className="rounded-2xl border bg-[color:var(--ni-surface-1)] border-[color:var(--ni-border)] p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--ni-muted)]">{eyebrow}</p>
        <h2 className="mt-3 text-sm font-medium text-[color:var(--ni-text-strong)]">{title}</h2>

        <div className="mt-4 space-y-3">
          {resolvedStats.map((stat) => (
            <div key={stat.label}>
              <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--ni-text)]">
                <span>{stat.label}</span>
                <span className="font-semibold">{stat.value}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[color:var(--ni-surface-2)]">
                <div className={`${stat.color ?? "bg-cyan-500"} h-full rounded-full`} style={{ width: `${stat.value}%` }} />
              </div>
              {stat.note ? <p className="mt-1 text-[11px] text-[color:var(--ni-muted)]">{stat.note}</p> : null}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {resolvedSignals.map((signal) => (
            <span key={signal} className="rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--ni-text)]">
              {signal}
            </span>
          ))}
        </div>

        <div className="mt-4 text-xs text-[color:var(--ni-muted)]">{footnote}</div>
        {meta ? <div className="mt-1 text-[11px] text-[color:var(--ni-muted)]">{meta}</div> : null}

        {resolvedCta ? (
          <a
            href={resolvedCta.href}
            className="mt-4 inline-flex w-full justify-center rounded-full bg-[color:var(--ni-brand-cta)] px-3 py-2 text-sm font-semibold text-white"
          >
            {resolvedCta.label}
          </a>
        ) : null}
      </div>
    </aside>
  );
}

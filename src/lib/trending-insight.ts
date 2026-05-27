import type { InsightStat } from "@/lib/site-settings";

const defaultColors = ["bg-cyan-500", "bg-amber-400", "bg-rose-500", "bg-emerald-400"] as const;

export const defaultTrendingInsightStats: InsightStat[] = [
  { label: "Story Heat", value: 56, color: "bg-rose-500" },
  { label: "Share Velocity", value: 51, color: "bg-amber-400" },
  { label: "Buyer Fit", value: 58, color: "bg-emerald-400" },
  { label: "Deal Confidence", value: 64, color: "bg-indigo-500" },
];

export const defaultTrendingInsightSignals = ["Realtime spikes", "Rapid quote replies", "News tie-ins"];

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export function normalizeInsightStats(rawValue: unknown, fallback: InsightStat[] = defaultTrendingInsightStats): InsightStat[] {
  if (!Array.isArray(rawValue) || !rawValue.length) {
    return fallback;
  }

  return rawValue.slice(0, 4).map((value, index) => {
    const fallbackStat = fallback[index] ?? {
      label: `Stat ${index + 1}`,
      value: 50,
      color: defaultColors[index] ?? "bg-cyan-500",
    };
    const stat = typeof value === "object" && value !== null ? (value as Partial<InsightStat>) : {};

    return {
      label: typeof stat.label === "string" && stat.label.trim() ? stat.label.trim() : fallbackStat.label,
      value: clampPercent(Number.isFinite(Number(stat.value)) ? Number(stat.value) : fallbackStat.value),
      color: typeof stat.color === "string" && stat.color.trim() ? stat.color.trim() : fallbackStat.color,
      note: typeof stat.note === "string" && stat.note.trim() ? stat.note.trim() : fallbackStat.note,
    };
  });
}

export function normalizeInsightSignals(rawValue: unknown, fallback: string[] = defaultTrendingInsightSignals): string[] {
  if (Array.isArray(rawValue)) {
    const values = rawValue
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean);
    return values.length ? values : fallback;
  }

  if (typeof rawValue === "string") {
    const values = rawValue
      .split(/[\n,]/)
      .map((value) => value.trim())
      .filter(Boolean);
    return values.length ? values : fallback;
  }

  return fallback;
}

export function formatInsightDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

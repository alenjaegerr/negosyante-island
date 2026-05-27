import { prisma } from "@/lib/prisma";

export type InsightStat = {
  label: string;
  value: number;
  color: string;
  note?: string;
};

export type InsightBarConfig = {
  eyebrow: string;
  title: string;
  footnote: string;
  ctaLabel: string;
  buttonLabel: string;
  stats: InsightStat[];
  signals: string[];
};

const insightColorDefaults = ["bg-cyan-500", "bg-amber-400", "bg-rose-500", "bg-emerald-400"] as const;

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function parseStatValue(rawValue: string | undefined, fallbackValue: number) {
  const parsedValue = Number.parseInt(rawValue ?? "", 10);
  return Number.isFinite(parsedValue) ? clampPercent(parsedValue) : fallbackValue;
}

function parseDelimitedList(rawValue: string | undefined, fallbackValues: string[]) {
  const parsedValues =
    rawValue
      ?.split(/[\n,]/)
      .map((value) => value.trim())
      .filter(Boolean) ?? [];

  return parsedValues.length ? parsedValues : fallbackValues;
}

export function getInsightBarConfig(
  settings: Map<string, string>,
  fallback: Pick<InsightBarConfig, "eyebrow" | "title" | "footnote" | "ctaLabel" | "buttonLabel" | "stats" | "signals">,
): InsightBarConfig {
  const stats = Array.from({ length: 4 }, (_, index) => {
    const statNumber = index + 1;
    const fallbackStat = fallback.stats[index] ?? {
      label: `Stat ${statNumber}`,
      value: 50,
      color: insightColorDefaults[index],
    };

    return {
      label: settings.get(`insightStat${statNumber}Label`)?.trim() || fallbackStat.label,
      value: parseStatValue(settings.get(`insightStat${statNumber}Value`) ?? undefined, fallbackStat.value),
      color: settings.get(`insightStat${statNumber}Color`)?.trim() || fallbackStat.color,
      note: settings.get(`insightStat${statNumber}Note`)?.trim() || fallbackStat.note,
    } satisfies InsightStat;
  });

  return {
    eyebrow: settings.get("insightBarEyebrow")?.trim() || fallback.eyebrow,
    title: settings.get("insightBarTitle")?.trim() || fallback.title,
    footnote: settings.get("insightBarFootnote")?.trim() || fallback.footnote,
    ctaLabel: settings.get("insightBarCtaLabel")?.trim() || fallback.ctaLabel,
    buttonLabel: settings.get("insightPrimaryButtonLabel")?.trim() || fallback.buttonLabel,
    stats,
    signals: parseDelimitedList(settings.get("insightSignals") ?? undefined, fallback.signals),
  };
}

export async function getSiteSettings() {
  try {
    return await prisma.siteSetting.findMany();
  } catch {
    return [] as Array<{ key: string; value: string }>;
  }
}

export async function getSiteSettingMap() {
  const settings = await getSiteSettings();
  return new Map(settings.map((setting) => [setting.key, setting.value]));
}

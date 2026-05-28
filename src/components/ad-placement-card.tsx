import Link from "next/link";
import type { AdPlacementConfig } from "@/lib/site-settings";

type AdPlacementCardProps = {
  config: AdPlacementConfig;
  show: boolean;
  compact?: boolean;
};

export function AdPlacementCard({ config, show, compact = false }: AdPlacementCardProps) {
  if (!show) return null;

  return (
    <section className={`overflow-hidden rounded-2xl border border-[color:var(--ni-border)] bg-[linear-gradient(135deg,rgba(2,132,199,0.16),rgba(14,165,233,0.1),rgba(255,255,255,0.7))] shadow-sm ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">{config.eyebrow}</p>
          <h2 className={`${compact ? "mt-1 text-lg" : "mt-2 text-2xl"} font-semibold text-[color:var(--ni-text-strong)]`}>{config.title}</h2>
        </div>
        <span className="rounded-full border border-cyan-600/30 bg-cyan-600/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-800">
          Ad slot
        </span>
      </div>

      <div className="mt-3 rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)]/90 p-4 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--ni-muted)]">{config.sponsorName}</p>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--ni-text)]">{config.body}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href={config.ctaHref} className="rounded-full bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white">
            {config.ctaLabel}
          </Link>
          <p className="text-xs text-[color:var(--ni-muted)]">{config.footnote}</p>
        </div>
      </div>
    </section>
  );
}

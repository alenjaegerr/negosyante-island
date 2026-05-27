type OnlineStatusBadgeProps = {
  online: boolean;
  compact?: boolean;
};

export function OnlineStatusBadge({ online, compact = false }: OnlineStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${online ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-slate-500"}`}
        aria-hidden
      />
      {compact ? (online ? "Online" : "Offline") : online ? "Online now" : "Offline"}
    </span>
  );
}

type AdsenseSlotProps = {
  className?: string;
};

export default function AdsenseSlot({ className }: AdsenseSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

  if (!client || !slot) {
    return null;
  }

  return (
    <ins
      className={`adsbygoogle my-4 block min-h-[120px] rounded-lg border border-[color:var(--ni-border)] ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

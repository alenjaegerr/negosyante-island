type RoleBadgeProps = {
  role: string | null | undefined;
  isVerifiedBusiness?: boolean;
  compact?: boolean;
};

function formatRole(role: string | null | undefined, isVerifiedBusiness?: boolean) {
  if (!role) return { label: "Guest", tone: "bg-slate-200 text-slate-700" };
  if (role === "admin") return { label: "Member", tone: "bg-slate-100 text-slate-700" };
  if (role === "publisher") return { label: "Cultured Author", tone: "bg-indigo-50 text-indigo-700" };
  if (role === "publisher_verified") return { label: "Cultured Author ✅", tone: "bg-indigo-100 text-indigo-700" };
  if (role === "marketing_verified") return { label: "Verified Marketing Expert ✅", tone: "bg-amber-100 text-amber-700" };
  if (role === "marketing_pending") return { label: "Unverified Marketing Expert", tone: "bg-amber-50 text-amber-700" };
  if (role === "business_verified") return { label: "Verified Business ✅", tone: "bg-emerald-100 text-emerald-700" };
  if (role === "business_pending") return { label: "Unverified Business", tone: "bg-emerald-50 text-emerald-700" };
  if (role === "user") return { label: "Aspiring Negosyante", tone: "bg-sky-100 text-sky-700" };
  if (isVerifiedBusiness) return { label: "Verified Business ✅", tone: "bg-emerald-100 text-emerald-700" };
  return { label: "Aspiring Negosyante", tone: "bg-sky-100 text-sky-700" };
}

export default function RoleBadge({ role, isVerifiedBusiness, compact = false }: RoleBadgeProps) {
  const { label, tone } = formatRole(role, isVerifiedBusiness);

  return (
    <span className={`inline-flex items-center rounded-full ${compact ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-[11px]"} font-semibold ${tone}`}>
      {label}
    </span>
  );
}

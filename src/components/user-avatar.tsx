"use client";

import Image from "next/image";

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
};

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "NI";
}

export function UserAvatar({ name, avatarUrl, size = 40, className = "" }: UserAvatarProps) {
  const initials = initialsFromName(name);
  const safeSrc =
    typeof avatarUrl === "string" && avatarUrl.length > 0
      ? avatarUrl.startsWith("/") || avatarUrl.startsWith("http")
        ? avatarUrl
        : `/${avatarUrl}`
      : null;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      {safeSrc ? (
        <Image src={safeSrc} alt={name} width={size} height={size} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-accent-soft)] text-[color:var(--ni-brand)]">
          <span className="text-xs font-extrabold">{initials}</span>
        </div>
      )}
    </div>
  );
}

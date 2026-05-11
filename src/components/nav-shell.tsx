"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { BrandLogo } from "@/components/brand-logo";

type NavShellProps = {
  isAuthenticated: boolean;
  role: string | null;
  displayName: string | null;
  businessName: string | null;
};

export function NavShell({ isAuthenticated, role, displayName, businessName }: NavShellProps) {
  const pathname = usePathname();
  const theme = useSyncExternalStore<"light" | "dark">(
    (onStoreChange) => {
      const onThemeChange = () => onStoreChange();
      window.addEventListener("storage", onThemeChange);
      window.addEventListener("ni-theme-change", onThemeChange);
      return () => {
        window.removeEventListener("storage", onThemeChange);
        window.removeEventListener("ni-theme-change", onThemeChange);
      };
    },
    () => {
      const storedTheme = window.localStorage.getItem("ni-theme");
      const documentTheme = document.documentElement.getAttribute("data-theme");
      if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
      if (documentTheme === "light" || documentTheme === "dark") return documentTheme;
      return "light";
    },
    () => "light",
  );

  const workspaceHref =
    role === "admin"
      ? "/admin"
      : role === "business_pending" || role === "business_verified"
        ? "/business/home"
        : isAuthenticated
          ? "/feed"
          : "/login";
  const workspaceLabel =
    role === "admin"
      ? "Admin"
      : role === "business_pending" || role === "business_verified"
        ? "Business Hub"
        : "Island Feed";

  const internetHref = "/";
  const homeHref = isAuthenticated ? workspaceHref : "/";

  const modeLabel =
    role === "business_pending" || role === "business_verified"
      ? businessName ?? displayName ?? "Business Account"
      : displayName ?? "User Account";

  const initials = modeLabel
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("ni-theme", theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("ni-theme", nextTheme);
    window.dispatchEvent(new Event("ni-theme-change"));
  }

  const links = [
    { href: internetHref, label: "Signal Browser" },
    { href: workspaceHref, label: workspaceLabel },
    { href: isAuthenticated ? "/notifications" : "/signup", label: isAuthenticated ? "Alerts" : "Join" },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const isSignalRoute = pathname === "/";

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur ${
        isSignalRoute
          ? "border-white/10 bg-[#07080d]/90 text-white"
          : "border-[color:var(--ni-border)] bg-[var(--ni-bg)]/92"
      }`}
    >
      <div className="w-full mx-auto flex max-w-8xl items-center justify-between gap-4 px-3 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href={homeHref} aria-label="Go to home" className="flex items-center">
            <BrandLogo compact />
          </Link>
          <nav className="hidden gap-8 pl-4 md:flex">
            {links.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`font-reddit rounded-full px-3 py-1.5 text-sm font-extrabold uppercase transition ${
                  isActiveLink(item.href)
                    ? isSignalRoute
                      ? "bg-cyan-200/10 text-cyan-100"
                      : "bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]"
                    : isSignalRoute
                      ? "text-white/80 hover:bg-white/10 hover:text-white"
                      : "text-[var(--ni-text-strong)] hover:bg-[var(--ni-surface-2)] hover:text-[var(--ni-brand)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className={`rounded border px-3 py-1 text-[12px] font-extrabold transition ${
              isSignalRoute
                ? "border-white/20 bg-white/[0.08] text-white/80 hover:border-white/30 hover:text-white"
                : "border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] text-[var(--ni-text-strong)] hover:border-[color:var(--ni-brand)] hover:text-[var(--ni-brand)]"
            }`}
          >
            {theme === "dark" ? "DARK" : "LIGHT"}
          </button>

          {!isAuthenticated ? (
            <Link
              href="/login"
              className={`font-reddit rounded border px-3 py-1 text-sm font-extrabold transition ${
                isSignalRoute
                  ? "border-white/20 bg-white/[0.08] text-white/80 hover:border-white/30 hover:text-white"
                  : "border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] text-[var(--ni-text-strong)] hover:border-[color:var(--ni-brand)]"
              }`}
            >
              BUSINESS LOGIN
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${
                  isSignalRoute
                    ? "border-cyan-200/30 bg-cyan-200/10 text-cyan-100"
                    : "border-cyan-300/50 bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]"
                }`}
              >
                {initials}
              </span>
              <span className={`hidden truncate text-sm md:inline-block ${isSignalRoute ? "text-white/80" : ""}`}>
                {modeLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

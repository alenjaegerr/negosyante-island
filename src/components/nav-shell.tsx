"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { BrandLogo } from "@/components/brand-logo";

type NavShellProps = {
  isAuthenticated: boolean;
  role: string | null;
  displayName: string | null;
  businessName: string | null;
};

export function NavShell({ isAuthenticated, role, displayName, businessName }: NavShellProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const latestHref =
    role === "admin"
      ? "/admin"
      : role === "business_pending" || role === "business_verified"
        ? "/business/dashboard"
        : "/feed";

  const internetHref = isAuthenticated ? "/trending" : "/login";

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
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
    { href: latestHref, label: "Latest" },
    { href: internetHref, label: "The Internet" },
    { href: "#", label: "Contact Us" },
  ];

  const roleLinks = [
    ...(role === "business_pending" || role === "business_verified" ? [{ href: "/business/home", label: "Business Home" }] : []),
    ...(role === "business_pending" ? [{ href: "/business/dashboard", label: "Business Dashboard" }] : []),
    ...(role === "business_pending" ? [{ href: "/business/pending", label: "Business Verify" }] : []),
    ...(role === "business_verified" ? [{ href: "/business/dashboard", label: "Business Dashboard" }] : []),
    ...(role === "admin" ? [{ href: "/admin", label: "Admin Panel" }] : []),
  ];

  const authLinks = isAuthenticated
    ? [
        ...links,
        { href: "/notifications", label: "Notifications" },
        ...roleLinks,
        { href: "/feed", label: "My Feed" },
      ]
    : [
        ...links,
        { href: "/login", label: "Login" },
        { href: "/signup", label: "Signup" },
      ];

  return (
    <header className="border-b border-[color:var(--ni-border)] bg-[var(--ni-bg)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-3 py-3">
        <div className="flex items-center gap-4">
          <Link href={isAuthenticated ? "/feed" : "/"} aria-label="Go to home" className="flex items-center">
            <BrandLogo compact />
          </Link>
          <nav className="hidden gap-6 pl-4 md:flex">
            {links.map((item) => (
              <Link key={item.label} href={item.href} className="font-reddit text-sm font-extrabold uppercase tracking-figma-tight hover:text-[var(--ni-brand)]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-1 text-[12px] font-extrabold text-[var(--ni-text-strong)] hover:border-[color:var(--ni-brand)] hover:text-[var(--ni-brand)] md:inline-flex"
          >
            {theme === "dark" ? "DARK" : "LIGHT"}
          </button>

          {!isAuthenticated ? (
            <Link href="/login" className="font-reddit rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-1 text-sm font-extrabold text-[var(--ni-text-strong)] hover:border-[color:var(--ni-brand)]">
              BUSINESS LOGIN
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/50 bg-[var(--ni-accent-soft)] text-sm text-[var(--ni-brand)]">
                {initials}
              </span>
              <span className="hidden truncate text-sm md:inline-block">{modeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

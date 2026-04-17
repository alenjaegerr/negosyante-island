"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

type NavShellProps = {
  isAuthenticated: boolean;
  role: string | null;
  displayName: string | null;
  businessName: string | null;
};

export function NavShell({ isAuthenticated, role, displayName, businessName }: NavShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const storedTheme = window.localStorage.getItem("ni-theme");
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
  });

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
    setTheme(nextTheme);
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
    <>
      <header className="border-b border-[color:var(--ni-border)] bg-[var(--ni-bg)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-2 py-2 sm:px-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="font-reddit tracking-figma-tight rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1 text-[9px] font-extrabold text-[var(--ni-text-strong)] sm:text-[15px]"
          >
            THEME: {theme === "dark" ? "DARK MODE 🌙" : "LIGHT MODE ☀️"}
          </button>
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="font-reddit tracking-figma-tight rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1 text-[10px] font-extrabold text-[var(--ni-text-strong)] sm:px-3 sm:text-base"
            >
              BUSINESS LOGIN/SIGNUP 💼
            </Link>
          ) : (
            <div className="font-reddit tracking-figma-tight flex items-center gap-2 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1 text-[10px] font-extrabold text-[var(--ni-text-strong)] sm:px-3 sm:text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/50 bg-[var(--ni-accent-soft)] text-[10px] text-[var(--ni-brand)]">
                {initials}
              </span>
              <span className="max-w-[120px] truncate sm:max-w-[220px]">{modeLabel}</span>
            </div>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-2 px-2 py-2 sm:items-center sm:gap-4 sm:px-4 sm:py-3">
          <Link href={isAuthenticated ? "/feed" : "/"} aria-label="Go to home" className="min-w-0 max-w-[72%] shrink">
            <BrandLogo compact />
          </Link>

          <div className="ml-auto flex shrink-0 flex-col items-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="font-roboto-mono tracking-figma-tight inline-flex items-center gap-2 border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-2 py-1.5 text-[10px] text-[var(--ni-text-strong)] sm:px-3 sm:py-2 sm:text-base"
            >
              NAVIGATE
              <span className="text-base leading-none">☰</span>
            </button>
            <nav className="font-reddit tracking-figma-tight hidden items-center gap-4 text-[13px] font-extrabold text-[var(--ni-text-strong)] md:flex">
              {links.map((item) => (
                <Link key={item.label} href={item.href} className="hover:text-[var(--ni-brand)]">
                  {item.label.toUpperCase()}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-200 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[88%] max-w-sm border-l border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-5 shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between">
          <p className="font-roboto-mono text-sm tracking-figma-tight text-[var(--ni-text-strong)]">NAVIGATION</p>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="font-reddit rounded border border-[color:var(--ni-border)] px-2 py-1 text-sm font-extrabold text-[var(--ni-text-strong)]"
          >
            Close
          </button>
        </div>

        <nav className="mt-6 space-y-2">
          {authLinks.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="font-reddit tracking-figma-tight block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-sm font-extrabold text-[var(--ni-text-strong)] hover:border-[var(--ni-brand)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 border-t border-[color:var(--ni-border)] pt-4">
          {isAuthenticated ? (
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="w-full rounded border border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] px-3 py-2 text-sm text-[var(--ni-brand)]">
                Logout
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setIsOpen(false)} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-center text-sm text-[var(--ni-text-strong)]">
                Login
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)} className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-center text-sm text-[var(--ni-text-strong)]">
                Signup
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

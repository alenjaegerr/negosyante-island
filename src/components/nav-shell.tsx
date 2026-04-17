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

  const links = [
    { href: "/feed", label: "Latest" },
    { href: "/trending", label: "The Internet" },
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
      <header className="border-b border-black/10 bg-[var(--ni-bg)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-3 py-2 sm:px-4">
          <div className="font-reddit tracking-figma-tight rounded border border-black/20 bg-lime-50 px-2 py-1 text-[10px] font-extrabold sm:text-[15px]">
            THEME: LIGHT MODE 💡☀️
          </div>
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="font-reddit tracking-figma-tight rounded border border-black/25 bg-lime-50 px-2 py-1 text-[11px] font-extrabold sm:px-3 sm:text-base"
            >
              BUSINESS LOGIN/SIGNUP 💼
            </Link>
          ) : (
            <div className="font-reddit tracking-figma-tight flex items-center gap-2 rounded border border-black/25 bg-lime-50 px-2 py-1 text-[11px] font-extrabold sm:px-3 sm:text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-black/25 bg-cyan-100 text-[10px] text-cyan-900">
                {initials}
              </span>
              <span className="max-w-[140px] truncate sm:max-w-[220px]">{modeLabel}</span>
            </div>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-3 py-3 sm:px-4">
          <Link href={isAuthenticated ? "/feed" : "/"} aria-label="Go to home" className="shrink-0">
            <BrandLogo compact />
          </Link>

          <div className="flex flex-col items-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="font-roboto-mono tracking-figma-tight inline-flex items-center gap-2 border border-black/30 bg-zinc-200 px-3 py-2 text-[10px] sm:text-base"
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
        className={`fixed right-0 top-0 z-50 h-full w-[88%] max-w-sm border-l border-cyan-500 bg-[var(--ni-bg)] p-5 shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between">
          <p className="font-roboto-mono text-sm tracking-figma-tight">NAVIGATION</p>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="font-reddit rounded border border-black/20 px-2 py-1 text-sm font-extrabold"
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
              className="font-reddit tracking-figma-tight block rounded border border-black/15 bg-white px-3 py-2 text-sm font-extrabold hover:border-cyan-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 border-t border-black/10 pt-4">
          {isAuthenticated ? (
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="w-full rounded border border-black/20 bg-black px-3 py-2 text-sm text-white">
                Logout
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setIsOpen(false)} className="rounded border border-black/20 bg-white px-3 py-2 text-center text-sm">
                Login
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)} className="rounded border border-black/20 bg-white px-3 py-2 text-center text-sm">
                Signup
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

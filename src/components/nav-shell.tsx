"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

type NavShellProps = {
  isAuthenticated: boolean;
  role: string | null;
  displayName: string | null;
  businessName: string | null;
  avatarUrl?: string | null;
};

type NavLinkItem = {
  href: string;
  label: string;
  shortLabel?: string;
};

export function NavShell({ isAuthenticated, role, displayName, businessName, avatarUrl }: NavShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isMobileHeaderHidden, setIsMobileHeaderHidden] = useState(false);
  const profileHoverTimer = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const storedTheme = window.localStorage.getItem("ni-theme");
    const documentTheme = document.documentElement.getAttribute("data-theme");

    return storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : documentTheme === "light" || documentTheme === "dark"
        ? documentTheme
        : "light";
  });

  const homeHref =
    role === "admin"
      ? "/admin"
      : role === "publisher" || role === "publisher_verified"
        ? "/publisher/dashboard"
        : role === "business_pending" || role === "business_verified" || role === "marketing_pending" || role === "marketing_verified"
          ? "/business/home"
          : "/feed";
  const trendingHref = "/trending";
  const currentSearchQuery = searchParams.get("q") ?? "";
  const forumHref = "/theinternet";
  const isMessagingRoute = pathname.startsWith("/business/message");
  const messagingBackHref = pathname.startsWith("/business/message") ? "/b2bm" : "/b2bm";
  const isBusinessRole = role === "business_pending" || role === "business_verified" || role === "marketing_pending" || role === "marketing_verified";
  const isAdmin = role === "admin";
  const isPublisher = role === "publisher" || role === "publisher_verified";

  const showHome =
    role === "admin" ||
    isBusinessRole ||
    isPublisher;

  const modeLabel =
    isBusinessRole
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
    requestAnimationFrame(() => {
      setIsOpen(false);
      setIsProfileOpen(false);
      setIsMoreOpen(false);
      setIsRegionOpen(false);
    });
  }, [pathname]);

  useEffect(() => {
    function updateHeaderVisibility() {
      const nextScrollY = window.scrollY;
      const isMobile = window.innerWidth < 768;

      if (!isMobile) {
        setIsMobileHeaderHidden(false);
        lastScrollY.current = nextScrollY;
        return;
      }

      if (nextScrollY <= 8) {
        setIsMobileHeaderHidden(false);
        lastScrollY.current = nextScrollY;
        return;
      }

      const previousScrollY = lastScrollY.current;
      if (nextScrollY > previousScrollY + 6) {
        setIsMobileHeaderHidden(true);
      } else if (nextScrollY < previousScrollY - 6) {
        setIsMobileHeaderHidden(false);
      }

      lastScrollY.current = nextScrollY;
    }

    updateHeaderVisibility();
    window.addEventListener("scroll", updateHeaderVisibility, { passive: true });
    window.addEventListener("resize", updateHeaderVisibility);

    return () => {
      window.removeEventListener("scroll", updateHeaderVisibility);
      window.removeEventListener("resize", updateHeaderVisibility);
    };
  }, [pathname]);

  useEffect(() => {
    if (isMessagingRoute) {
      document.body.dataset.shellMode = "message";
      return () => {
        delete document.body.dataset.shellMode;
      };
    }

    delete document.body.dataset.shellMode;
  }, [isMessagingRoute]);

  useEffect(() => {
    if (!isProfileOpen && !isMoreOpen && !isRegionOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsMoreOpen(false);
        setIsRegionOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileOpen, isMoreOpen, isRegionOpen]);

  useLayoutEffect(() => {
    const storedTheme = window.localStorage.getItem("ni-theme");
    const documentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : documentTheme === "light" || documentTheme === "dark"
          ? documentTheme
          : "light";

    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("ni-theme", nextTheme);
    window.dispatchEvent(new Event("ni-theme-change"));
  }, []);

  function toggleTheme() {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      window.localStorage.setItem("ni-theme", nextTheme);
      window.dispatchEvent(new Event("ni-theme-change"));
      return nextTheme;
    });
  }

  const links = [
    ...(showHome ? [{ href: homeHref, label: "🏠 Home" }] : []),
    { href: trendingHref, label: "🔥 Trending" },
    { href: forumHref, label: "🏝️ ISLAND FORUMS" },
    ...(isAuthenticated ? [{ href: "/b2bm", label: "💫 B2BM Interaction" }] : []),
  ];

  const roleLinks: NavLinkItem[] = [
    ...(isBusinessRole
      ? [{ href: "/business/dashboard", label: "📊 Business Dashboard", shortLabel: "📊 Dashboard" }]
      : []),
    ...(role === "business_pending" || role === "marketing_pending"
      ? [{ href: "/business/pending", label: "✅ Business Verify", shortLabel: "✅ Verify" }]
      : []),
    ...(role === "admin" ? [{ href: "/admin", label: "🛠 Admin Panel", shortLabel: "🛠 Admin" }] : []),
  ];

  const authLinks = isAuthenticated
    ? [
        ...links,
        ...(isPublisher ? [{ href: "/publisher/dashboard", label: "✍️ Publisher Dashboard", shortLabel: "✍️ Publisher" }] : []),
        { href: "/notifications", label: "🔔 Notifications", shortLabel: "🔔 Alerts" },
        ...roleLinks,
        { href: "/feed", label: "🧵 My Feed", shortLabel: "🧵 Feed" },
      ]
    : [
        ...links,
        { href: "/about", label: "ℹ️ About", shortLabel: "ℹ️ About" },
        { href: "/login", label: "🔑 Login" },
        { href: "/signup", label: "📝 Signup" },
      ];

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const isActiveLink = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  const accountHref = isBusinessRole ? "/business/account" : "/account";
  const regionLinks = [
    { href: "/feed", label: "Philippines", shortLabel: "🇵🇭" },
    { href: "/international", label: "International", shortLabel: "🌐" },
  ];
  const desktopNavSections = [
    {
      label: "Main",
      links: [
        ...(showHome ? [{ href: homeHref, label: "🏠 Home", shortLabel: "🏠 Home" }] : []),
        { href: trendingHref, label: "🔥 Trending", shortLabel: "🔥 Trending" },
        ...(isPublisher ? [{ href: "/publisher/dashboard", label: "✍️ Publisher Dashboard", shortLabel: "✍️ Publisher" }] : []),
      ],
    },
    {
      label: "Community",
      links: [
        { href: forumHref, label: "🏝️ Island Forums", shortLabel: "🏝️ Forums" },
        ...(isAuthenticated ? [{ href: "/b2bm", label: "💫 B2BM Interaction", shortLabel: "💫 B2BM" }] : []),
      ],
    },
    {
      label: "Business",
      links: roleLinks,
    },
    {
      label: "Account",
      links: isAuthenticated
        ? [
            { href: "/notifications", label: "🔔 Notifications", shortLabel: "🔔 Alerts" },
            { href: "/feed", label: "🧵 My Feed", shortLabel: "🧵 Feed" },
          ]
        : [
            { href: "/about", label: "ℹ️ About", shortLabel: "ℹ️ About" },
            { href: "/login", label: "🔑 Login", shortLabel: "🔑 Login" },
            { href: "/signup", label: "📝 Signup", shortLabel: "📝 Signup" },
          ],
    },
  ].filter((section) => section.links.length > 0);
  const moreDesktopLinks = desktopNavSections.find((section) => section.label === "Account")?.links ?? [];

  const mobilePrimaryLinks = [
    ...(showHome ? [{ href: isAuthenticated ? homeHref : trendingHref, icon: "🏠", label: "Home" }] : []),
    { href: trendingHref, icon: "🔥", label: "Trending" },
    { href: forumHref, icon: "🏝️", label: "Forums" },
    ...(isAuthenticated ? [{ href: "/b2bm", icon: "💫", label: "B2BM" }] : []),
  ].slice(0, 4);
  const mobileNavGridClass =
    mobilePrimaryLinks.length >= 4
      ? "grid-cols-5"
      : mobilePrimaryLinks.length === 3
        ? "grid-cols-4"
        : "grid-cols-3";

  if (isMessagingRoute) {
    return (
      <div data-nav-shell>
      <header className={`sticky top-0 z-30 border-b border-[color:var(--ni-border)] bg-[var(--ni-bg)] transition-transform duration-300 will-change-transform md:translate-y-0 ${isMobileHeaderHidden ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-2 py-1.5 sm:px-4 sm:py-2">
          <Link href={messagingBackHref} className="shrink-0">
            <BrandLogo compact />
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <Link
              href={accountHref}
              aria-label="Open account"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] text-[color:var(--ni-text-strong)] transition-colors hover:border-[var(--ni-brand)] hover:text-[var(--ni-brand)]"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt={modeLabel} width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/50 bg-[var(--ni-accent-soft)] text-[10px] text-[var(--ni-brand)]">
                  {initials}
                </span>
              )}
            </Link>
          </div>
        </div>

      </header>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--ni-border)] bg-[var(--ni-surface-1)]/96 backdrop-blur md:hidden">
        <div className={`mx-auto grid w-full max-w-screen-2xl ${mobileNavGridClass} gap-1 px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] font-reddit text-[10px] font-extrabold text-[var(--ni-text-strong)]`}>
          {mobilePrimaryLinks.map((item) => {
            const isActive = isActiveLink(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-1 py-1 text-center leading-tight ${
                  isActive ? "border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]" : ""
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md border border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] px-1 py-1 text-center leading-tight text-[var(--ni-brand)]"
          >
            <span className="text-base leading-none">☰</span>
            <span>Menu</span>
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-200 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed inset-x-0 bottom-0 z-50 h-[78vh] w-full max-w-none border-t border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-5 shadow-2xl transition-transform duration-300 ${isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"} md:bottom-0 md:left-auto md:right-0 md:top-0 md:h-full md:w-[24rem] md:max-w-sm md:border-l md:border-t-0 md:translate-y-0 md:rounded-none`}
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

        <nav className="mt-4 grid gap-2 font-reddit sm:grid-cols-2 md:space-y-2 md:grid-cols-1">
          {authLinks.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`tracking-figma-tight block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-sm font-extrabold text-[var(--ni-text-strong)] hover:border-[var(--ni-brand)] ${
                isActiveLink(item.href) ? "border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link
              href={accountHref}
              onClick={() => setIsOpen(false)}
              className={`tracking-figma-tight block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-sm font-extrabold text-[var(--ni-text-strong)] hover:border-[var(--ni-brand)] ${
                isActiveLink(accountHref) ? "border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]" : ""
              }`}
            >
              ⚙️ Account Settings
            </Link>
          ) : null}
        </nav>

        <div className="mt-4 border-t border-[color:var(--ni-border)] pt-4">
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
      </div>
    );
  }

  return (
    <div data-nav-shell>
      <header className={`sticky top-0 z-30 border-b border-[color:var(--ni-border)] bg-[var(--ni-bg)] transition-transform duration-300 will-change-transform md:translate-y-0 ${isMobileHeaderHidden ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="mx-auto hidden w-full max-w-screen-2xl grid-cols-[auto_minmax(14rem,34rem)_auto] items-center gap-3 px-2 py-1 sm:px-4 md:grid">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === "dark"}
              className="font-reddit tracking-figma-tight w-max border border-[color:var(--ni-border)] bg-transparent px-2 py-1 text-[10px] font-extrabold text-[var(--ni-text)] transition-colors hover:text-[var(--ni-brand)]"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              THEME: {theme === "dark" ? "DARK MODE 🌛" : "LIGHT MODE ☀️"}
            </button>
            <Link
              href="/select-region"
              className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1 text-[9px] font-extrabold text-[var(--ni-text-strong)] transition-colors hover:border-[color:var(--ni-brand)] hover:text-[var(--ni-brand)]"
            >
              SELECT REGION
            </Link>
          </div>
          <form action="/search" className="mx-auto w-full">
            <label className="sr-only" htmlFor="site-search">
              Search
            </label>
            <div className="flex h-8 items-center border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2">
              <span className="text-xs leading-none text-[var(--ni-brand)]">⌕</span>
              <input
                id="site-search"
                name="q"
                type="search"
                placeholder="Search Negosyante Island"
                defaultValue={currentSearchQuery}
                className="font-reddit tracking-figma-tight min-w-0 flex-1 bg-transparent px-2 text-[11px] font-extrabold text-[var(--ni-text-strong)] outline-none placeholder:text-[var(--ni-text)]"
              />
            </div>
          </form>
          <div className="flex items-center justify-self-end gap-2">
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setIsRegionOpen((current) => !current);
                  setIsMoreOpen(false);
                  setIsProfileOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={isRegionOpen}
                className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1 text-[9px] font-extrabold text-[var(--ni-text-strong)] transition-colors hover:border-[color:var(--ni-brand)] hover:text-[var(--ni-brand)]"
              >
                REGION: 🇵🇭 ▾
              </button>
              {isRegionOpen ? (
                <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-48 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 shadow-xl">
                  <div className="space-y-2">
                    <Link href="/feed" onClick={() => setIsRegionOpen(false)} className="block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-[11px] font-extrabold text-[var(--ni-text-strong)]">
                      Philippines
                    </Link>
                    <Link href="/international" onClick={() => setIsRegionOpen(false)} className="block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-[11px] font-extrabold text-[var(--ni-text-strong)]">
                      International
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="font-reddit tracking-figma-tight justify-self-end border border-[color:var(--ni-border)] px-2 py-1 text-[10px] font-extrabold text-[var(--ni-text)] transition-colors hover:text-[var(--ni-brand)]"
              >
                BUSINESS LOGIN/SIGNUP 💼
              </Link>
            ) : (
              <div
                className="relative justify-self-end"
                onMouseEnter={() => {
                  if (profileHoverTimer.current) window.clearTimeout(profileHoverTimer.current);
                  setIsProfileOpen(true);
                }}
                onMouseLeave={() => {
                  // small delay to avoid flicker when moving between button and menu
                  profileHoverTimer.current = window.setTimeout(() => setIsProfileOpen(false), 180);
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((current) => !current)}
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                  className="font-reddit tracking-figma-tight flex items-center gap-2 border border-[color:var(--ni-border)] px-2 py-1 text-[10px] font-extrabold text-[var(--ni-text)] transition-colors hover:text-[var(--ni-brand)]"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={modeLabel}
                      width={28}
                      height={28}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/50 bg-[var(--ni-accent-soft)] text-[10px] text-[var(--ni-brand)]">
                      {initials}
                    </span>
                  )}
                  <span className="max-w-[120px] truncate sm:max-w-[220px]">{modeLabel}</span>
                </button>

                {isProfileOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 shadow-xl"
                  >
                    <div className="space-y-2">
                      <Link href={accountHref} className="block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-[11px] font-extrabold text-[var(--ni-text-strong)]">
                        Account Settings
                      </Link>
                      <form action="/api/auth/logout" method="post">
                        <button
                          type="submit"
                          className="w-full rounded border border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] px-3 py-2 text-[11px] font-extrabold text-[var(--ni-brand)]"
                        >
                          Logout
                        </button>
                      </form>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-2 px-2 py-2 sm:px-4 sm:py-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)]">
          <Link href={isAuthenticated ? homeHref : trendingHref} aria-label="Go to home" className="min-w-0 max-w-[72%] shrink md:max-w-none md:justify-self-start">
            <BrandLogo compact />
          </Link>

          <nav className="hidden min-w-0 items-center justify-center text-xs font-extrabold text-[var(--ni-text-strong)] md:flex lg:text-[13px]">
            {desktopNavSections.map((section) => (
              <div key={section.label} className={`${section.label === "Account" ? "hidden xl:flex" : "flex"} items-center`}>
                {section.links.map((item) => {
                  const isActive = isActiveLink(item.href);

                  return (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`font-reddit tracking-figma-tight -ml-px whitespace-nowrap border-x border-[color:var(--ni-border)] px-1.5 py-1 leading-none transition-colors first:ml-0 hover:bg-[var(--ni-accent-soft)] hover:text-[var(--ni-brand)] lg:px-2 ${
                        isActive ? "bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]" : ""
                      }`}
                    >
                      {(item.shortLabel ?? item.label).toUpperCase()}
                    </Link>
                  );
                })}
              </div>
            ))}
            {moreDesktopLinks.length > 0 ? (
              <div className="relative xl:hidden">
                <button
                  type="button"
                  onClick={() => setIsMoreOpen((current) => !current)}
                  className={`font-reddit tracking-figma-tight whitespace-nowrap border-x border-[color:var(--ni-border)] px-1.5 py-1 leading-none transition-colors hover:bg-[var(--ni-accent-soft)] hover:text-[var(--ni-brand)] lg:px-2 ${
                    isMoreOpen ? "bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]" : ""
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={isMoreOpen}
                >
                  MORE ▾
                </button>
                {isMoreOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-30 mt-1 w-40 border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-1 shadow-xl"
                  >
                    {moreDesktopLinks.map((item) => {
                      const isActive = isActiveLink(item.href);

                      return (
                        <Link
                          key={`${item.href}-${item.label}-more`}
                          href={item.href}
                          onClick={() => setIsMoreOpen(false)}
                          className={`font-reddit tracking-figma-tight block whitespace-nowrap px-2 py-1.5 text-[10px] font-extrabold text-[var(--ni-text-strong)] hover:bg-[var(--ni-accent-soft)] hover:text-[var(--ni-brand)] ${
                            isActive ? "bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]" : ""
                          }`}
                        >
                          {item.label.toUpperCase()}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </nav>

          <div className="relative ml-auto flex shrink-0 items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={() => {
                setIsRegionOpen((current) => !current);
                setIsMoreOpen(false);
                setIsProfileOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={isRegionOpen}
              aria-label="Change region"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] text-[14px] text-[var(--ni-text-strong)] transition-colors hover:border-[var(--ni-brand)] hover:text-[var(--ni-brand)]"
            >
              🌐
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === "dark"}
              aria-label="Toggle theme"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] text-[14px] text-[var(--ni-text-strong)] transition-colors hover:border-[var(--ni-brand)] hover:text-[var(--ni-brand)]"
            >
              {theme === "dark" ? "🌛" : "☀️"}
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen((current) => !current);
                  setIsMoreOpen(false);
                  setIsRegionOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                aria-label="Open account menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] text-[color:var(--ni-text-strong)] transition-colors hover:border-[var(--ni-brand)] hover:text-[var(--ni-brand)]"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={modeLabel} width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/50 bg-[var(--ni-accent-soft)] text-[10px] text-[var(--ni-brand)]">
                    {initials}
                  </span>
                )}
              </button>
            ) : (
              <Link
                href="/login"
                aria-label="Login"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] text-[14px] text-[var(--ni-text-strong)] transition-colors hover:border-[var(--ni-brand)] hover:text-[var(--ni-brand)]"
              >
                👤
              </Link>
            )}
            {isRegionOpen ? (
              <div role="menu" className="absolute right-10 top-full z-30 mt-2 w-44 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 shadow-xl">
                <div className="space-y-2">
                  <Link href="/feed" onClick={() => setIsRegionOpen(false)} className="block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-[11px] font-extrabold text-[var(--ni-text-strong)]">
                    Philippines
                  </Link>
                  <Link href="/international" onClick={() => setIsRegionOpen(false)} className="block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-[11px] font-extrabold text-[var(--ni-text-strong)]">
                    International
                  </Link>
                </div>
              </div>
            ) : null}
            {isProfileOpen ? (
              <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-44 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-2 shadow-xl">
                <div className="space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link href={accountHref} onClick={() => setIsProfileOpen(false)} className="block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-[11px] font-extrabold text-[var(--ni-text-strong)]">
                        Account Settings
                      </Link>
                      <form action="/api/auth/logout" method="post">
                        <button type="submit" className="w-full rounded border border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] px-3 py-2 text-[11px] font-extrabold text-[var(--ni-brand)]">
                          Logout
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsProfileOpen(false)} className="block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-[11px] font-extrabold text-[var(--ni-text-strong)]">
                        Login
                      </Link>
                      <Link href="/signup" onClick={() => setIsProfileOpen(false)} className="block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-[11px] font-extrabold text-[var(--ni-text-strong)]">
                        Signup
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation"
            className="hidden md:inline-flex items-center gap-2 justify-self-end rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-3 py-2 text-[12px] font-extrabold tracking-figma-tight text-[var(--ni-text-strong)] transition-colors hover:border-[var(--ni-brand)] hover:text-[var(--ni-brand)]"
          >
            <span className="text-[14px] leading-none">☰</span>
            <span>NAVIGATE</span>
          </button>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--ni-border)] bg-[var(--ni-surface-1)]/96 backdrop-blur md:hidden">
        <div className={`mx-auto grid w-full max-w-screen-2xl ${mobileNavGridClass} gap-1 px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] font-reddit text-[10px] font-extrabold text-[var(--ni-text-strong)]`}>
          {mobilePrimaryLinks.map((item) => {
            const isActive = isActiveLink(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-1 py-1 text-center leading-tight ${
                  isActive ? "border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]" : ""
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md border border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] px-1 py-1 text-center leading-tight text-[var(--ni-brand)]"
          >
            <span className="text-base leading-none">☰</span>
            <span>Menu</span>
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-200 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed inset-x-0 bottom-0 z-50 h-[78vh] w-full max-w-none border-t border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-5 shadow-2xl transition-transform duration-300 ${isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"} md:bottom-0 md:left-auto md:right-0 md:top-0 md:h-full md:w-[24rem] md:max-w-sm md:border-l md:border-t-0 md:translate-y-0 md:rounded-none`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between">
          <p className="font-roboto-mono text-sm tracking-figma-tight text-[var(--ni-text-strong)]">NAVIGATION</p>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="font-reddit rounded border border-[color:var(--ni-border)] px-2 py-1 text-sm font-extrabold text-[var(--ni-text-strong)]"
          >
            ✕ Close
          </button>
        </div>

        <nav className="mt-6 grid gap-2 font-reddit sm:grid-cols-2 md:space-y-2 md:grid-cols-1">
          {authLinks.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`tracking-figma-tight block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-sm font-extrabold text-[var(--ni-text-strong)] hover:border-[var(--ni-brand)] ${
                isActiveLink(item.href) ? "border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link
              href={accountHref}
              onClick={() => setIsOpen(false)}
              className={`tracking-figma-tight block rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-3 py-2 text-sm font-extrabold text-[var(--ni-text-strong)] hover:border-[var(--ni-brand)] ${
                isActiveLink(accountHref) ? "border-[color:var(--ni-brand)] bg-[var(--ni-accent-soft)] text-[var(--ni-brand)]" : ""
              }`}
            >
              ⚙️ Account Settings
            </Link>
          ) : null}
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
    </div>
  );
}

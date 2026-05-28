"use client";

import Link from "next/link";
import { useState } from "react";

type ConsentMode = "essential" | "analytics";
const CONSENT_COOKIE = "ni-cookie-consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

function readConsentCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return value === "essential" || value === "analytics" ? (value as ConsentMode) : null;
}

function writeConsentCookie(mode: ConsentMode) {
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(mode)}; path=/; max-age=${CONSENT_MAX_AGE}; samesite=lax`;
  window.dispatchEvent(new Event("ni-cookie-consent-change"));
}

export function getCookieConsentMode() {
  return readConsentCookie();
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(() => !readConsentCookie());

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto w-[calc(100%-1.5rem)] max-w-3xl rounded-3xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 shadow-2xl sm:inset-x-4 sm:bottom-4 sm:w-auto sm:p-5 pointer-events-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="font-reddit text-xs font-extrabold tracking-figma-tight text-cyan-700">COOKIE PREFERENCES</p>
          <h2 className="text-lg font-semibold text-[color:var(--ni-text-strong)]">Essential cookies are on.</h2>
          <p className="text-sm leading-relaxed text-[color:var(--ni-text)]">
            Negosyante Island only uses essential cookies by default. Choosing analytics helps us improve our services and community tools for everyone. Read the <Link href="/privacy-policy" className="font-semibold text-[var(--ni-brand)]">Privacy Policy</Link> and <Link href="/legal" className="font-semibold text-[var(--ni-brand)]">Terms</Link>.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              writeConsentCookie("essential");
              setVisible(false);
            }}
            className="rounded-full border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] px-4 py-2 text-sm font-semibold text-[color:var(--ni-text-strong)] pointer-events-auto"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => {
              writeConsentCookie("analytics");
              setVisible(false);
            }}
            className="rounded-full bg-[color:var(--ni-brand-cta)] px-4 py-2 text-sm font-semibold text-white pointer-events-auto"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}

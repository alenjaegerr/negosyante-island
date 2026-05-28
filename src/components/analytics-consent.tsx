"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getCookieConsentMode } from "@/components/cookie-consent-banner";

type AnalyticsConsentProps = {
  gaId?: string | null;
};

export default function AnalyticsConsentScripts({ gaId }: AnalyticsConsentProps) {
  const [consent, setConsent] = useState<"essential" | "analytics" | null>(() => getCookieConsentMode());

  useEffect(() => {
    function handleConsentChange() {
      setConsent(getCookieConsentMode());
    }

    window.addEventListener("ni-cookie-consent-change", handleConsentChange);
    return () => window.removeEventListener("ni-cookie-consent-change", handleConsentChange);
  }, []);

  if (!gaId || consent !== "analytics") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-setup" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);} 
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}

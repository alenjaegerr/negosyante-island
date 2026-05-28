"use client";

import { useEffect, useState } from "react";

function formatTimestamp(value: Date) {
  const datePart = value.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timePart = value.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${datePart} • ${timePart}`;
}

export function LiveIndicator() {
  const [timestamp, setTimestamp] = useState(() => formatTimestamp(new Date()));

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimestamp(formatTimestamp(new Date()));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="font-reddit inline-flex max-w-full items-center gap-1.5 rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-2 py-1 text-[10px] font-semibold tracking-figma-tight text-[color:var(--ni-text)] sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[18px]">
      <span className="min-w-0 whitespace-nowrap font-semibold leading-none text-[color:var(--ni-text-strong)]" suppressHydrationWarning>{timestamp || "Loading time..."}</span>
      <span className="text-[color:var(--ni-muted)]" aria-hidden="true">•</span>
      <span className="live-pulse-text whitespace-nowrap text-[10px] font-semibold uppercase leading-none tracking-[0.18em] sm:text-[18px]">LIVE</span>
    </div>
  );
}

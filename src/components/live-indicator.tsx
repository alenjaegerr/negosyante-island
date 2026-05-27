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
    <div className="font-reddit inline-flex items-center gap-2 rounded-full border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] px-3 py-1.5 text-[18px] font-semibold tracking-figma-tight text-[color:var(--ni-text)] sm:px-4">
      <span className="text-[18px] font-semibold leading-none text-[color:var(--ni-text-strong)]" suppressHydrationWarning>{timestamp || "Loading time..."}</span>
      <span className="text-[color:var(--ni-muted)]" aria-hidden="true">•</span>
      <span className="live-pulse-text text-[18px] font-semibold uppercase leading-none tracking-[0.18em]">LIVE</span>
    </div>
  );
}

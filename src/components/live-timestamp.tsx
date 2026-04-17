"use client";

import { useMemo, useSyncExternalStore } from "react";

function formatDateTime(value: Date) {
  const date = new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(value);

  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(value);

  return `${date} ${time}`;
}

export function LiveTimestamp() {
  const nowMs = useSyncExternalStore(
    (onStoreChange) => {
      const timer = window.setInterval(onStoreChange, 1000);
      return () => window.clearInterval(timer);
    },
    () => Date.now(),
    () => 0,
  );

  const display = useMemo(() => (nowMs > 0 ? formatDateTime(new Date(nowMs)) : "Loading clock..."), [nowMs]);

  return <>{display}</>;
}

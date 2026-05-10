"use client";

import { useMemo, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let currentNowMs = Date.now();
let ticker: number | null = null;

function emitChange() {
  currentNowMs = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (ticker === null) {
    ticker = window.setInterval(emitChange, 1000);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && ticker !== null) {
      window.clearInterval(ticker);
      ticker = null;
    }
  };
}

function getSnapshot() {
  return currentNowMs;
}

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
    subscribe,
    getSnapshot,
    () => 0,
  );

  const display = useMemo(() => (nowMs > 0 ? formatDateTime(new Date(nowMs)) : "Loading clock..."), [nowMs]);

  return <>{display}</>;
}

"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const display = useMemo(() => (now ? formatDateTime(now) : "Loading clock..."), [now]);

  return <>{display}</>;
}

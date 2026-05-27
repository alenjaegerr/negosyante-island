"use client";

import { useEffect } from "react";

function pingPresence() {
  if (typeof navigator === "undefined") return;

  const payload = new Blob([], { type: "application/json" });
  navigator.sendBeacon("/api/presence", payload);
}

export function PresenceHeartbeat() {
  useEffect(() => {
    pingPresence();

    const interval = window.setInterval(() => {
      pingPresence();
    }, 60_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pingPresence();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}

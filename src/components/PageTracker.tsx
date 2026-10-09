"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Counts a page view on every navigation. No cookies; see /api/track. */
export default function PageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const body = JSON.stringify({ path: location.pathname });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
    }
  }, [pathname]);
  return null;
}

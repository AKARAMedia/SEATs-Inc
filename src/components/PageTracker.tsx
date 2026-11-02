"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Counts a page view on every navigation. No cookies; see /api/track. */
export default function PageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    // Each beacon runs the Worker + two database writes, so count a page only once per tab session
    // (reloads and back/forward don't inflate the numbers either).
    try {
      const seen = JSON.parse(sessionStorage.getItem("seats:pv") ?? "[]") as string[];
      if (seen.includes(location.pathname)) return;
      sessionStorage.setItem("seats:pv", JSON.stringify([...seen, location.pathname].slice(-50)));
    } catch {
      // storage unavailable: just count it
    }
    const body = JSON.stringify({ path: location.pathname });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
    }
  }, [pathname]);
  return null;
}

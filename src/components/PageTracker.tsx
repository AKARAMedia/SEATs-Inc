"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { TRACK_SAMPLE_RATE } from "@/lib/track-sample";

/** Counts a page view on every navigation. No cookies; see /api/track. */
export default function PageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    // Each beacon runs the Worker + database writes, so only 1 tab session in TRACK_SAMPLE_RATE is
    // tracked (decided once per session); the server counts its beacons TRACK_SAMPLE_RATE times.
    // Within a tracked session a page is counted once (reloads and back/forward don't inflate it).
    try {
      let sampled = sessionStorage.getItem("seats:pvs");
      if (sampled === null) {
        sampled = Math.random() < 1 / TRACK_SAMPLE_RATE ? "1" : "0";
        sessionStorage.setItem("seats:pvs", sampled);
      }
      if (sampled !== "1") return;
    } catch {
      // storage unavailable: can't remember the decision, so roll the dice per page instead
      if (Math.random() >= 1 / TRACK_SAMPLE_RATE) return;
    }
    try {
      const seen = JSON.parse(sessionStorage.getItem("seats:pv") ?? "[]") as string[];
      if (seen.includes(location.pathname)) return;
      sessionStorage.setItem("seats:pv", JSON.stringify([...seen, location.pathname].slice(-50)));
    } catch {
      // storage unavailable: just count it
    }
    const body = JSON.stringify({ path: location.pathname, w: TRACK_SAMPLE_RATE });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
    }
  }, [pathname]);
  return null;
}

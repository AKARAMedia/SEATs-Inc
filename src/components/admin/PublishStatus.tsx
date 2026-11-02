"use client";

import { useEffect, useRef, useState } from "react";

type Status = { state: "off" | "building" | "live" | "failed"; updatedAt?: string; url?: string };

/**
 * Banner for the rebuild that publishes admin edits to the (static) public site: shows while it builds,
 * confirms when it's live, and warns if it failed. Hidden when the status can't be read (e.g. local dev).
 */
export default function PublishStatus() {
  const [status, setStatus] = useState<Status>({ state: "off" });
  const [justFinished, setJustFinished] = useState(false);
  const last = useRef<Status["state"]>("off");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const poll = async () => {
      let delay = 15000; // each check is a Worker request, so only look while the tab is in use
      if (document.visibilityState === "visible") {
        try {
          const res = await fetch("/api/admin/publish-status", { cache: "no-store" });
          const next: Status = res.ok ? await res.json() : { state: "off" };
          if (stopped) return;
          if (last.current === "building" && next.state === "live") {
            setJustFinished(true);
            setTimeout(() => setJustFinished(false), 10000);
          }
          last.current = next.state;
          setStatus(next);
          if (next.state === "building") delay = 8000;
          if (next.state === "off") delay = 60000; // not configured / unreadable: check rarely
        } catch {
          // network blip: keep what's shown and try again
        }
      }
      if (!stopped) timer = setTimeout(poll, delay);
    };

    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  if (status.state === "building")
    return <div className="bg-amber-100 px-4 py-2 text-center text-[13px] text-amber-900">Publishing your changes to the live website… this usually takes 2–3 minutes.</div>;
  if (status.state === "failed")
    return (
      <div className="bg-red-100 px-4 py-2 text-center text-[13px] text-red-900">
        The last publish failed, so recent changes are not on the live website yet.{" "}
        {status.url && (
          <a href={status.url} target="_blank" rel="noreferrer" className="underline">
            See details
          </a>
        )}
      </div>
    );
  if (justFinished) return <div className="bg-green-100 px-4 py-2 text-center text-[13px] text-green-900">Your changes are now live.</div>;
  return null;
}

"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const GAP = 20; // px — keep in sync with `gap-5` on the track

/**
 * Horizontal scroll-snap carousel with round prev/next buttons underneath.
 * Children are the slides; size them with `shrink-0 basis-… snap-start` (see the NOVA Marketing page).
 * The track is also swipeable / keyboard-scrollable, so the buttons are an enhancement, not the only way in.
 */
export default function CardCarousel({
  children,
  prevLabel = "Previous",
  nextLabel = "Next",
}: {
  children: ReactNode;
  prevLabel?: string;
  nextLabel?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const raf = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const slide = el.firstElementChild as HTMLElement | null;
    el.scrollBy({ left: dir * (slide ? slide.offsetWidth + GAP : el.clientWidth), behavior: "smooth" });
  };

  const btn =
    "grid size-10 place-items-center rounded-full border border-[#1f2430] transition-all duration-200 disabled:cursor-default disabled:opacity-30";

  return (
    <div>
      <div
        ref={track}
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div className="mt-4 flex justify-center gap-3">
        <button type="button" aria-label={prevLabel} disabled={edge.start} onClick={() => go(-1)} className={`${btn} bg-white text-[#1f2430] enabled:hover:bg-[#1f2430] enabled:hover:text-white`}>
          <svg aria-hidden viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </button>
        <button type="button" aria-label={nextLabel} disabled={edge.end} onClick={() => go(1)} className={`${btn} bg-[#1f2430] text-white enabled:hover:bg-[#0080cc] enabled:hover:border-[#0080cc]`}>
          <svg aria-hidden viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Plays an entrance animation the first time the block scrolls into view.
 *
 * Children opt in with the `.rv` classes from globals.css (`rv rv-up | rv-left | rv-pop | rv-wave | rv-fade | rv-slide`,
 * delay via the `--d` CSS variable). They render hidden (`data-state="pending"`) until the wrapper becomes visible,
 * then `data-state="in"` starts their animations. It fires once. Without IntersectionObserver the content just shows.
 * The state lives in a data attribute, not React state, so it never triggers a re-render.
 */
export default function RevealOnView({ children, className = "", threshold = 0.2 }: { children: ReactNode; className?: string; threshold?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.dataset.state = "in";
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.state = "in";
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} data-state="pending" className={`nova-reveal ${className}`}>
      {children}
    </div>
  );
}

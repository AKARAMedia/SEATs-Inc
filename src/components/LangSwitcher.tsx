"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { ChevronDown } from "./icons";

const LABEL = { en: "ENGLISH", ja: "JAPANESE" } as const;

// US flag drawn on a 190×100 grid (official 1.9:1): 13 stripes, a canton 76 wide × 7 stripes tall, and 50
// five-point stars in 9 staggered rows (6, 5, 6, 5, …). Computed once at module load.
const STRIPE_H = 100 / 13;
const CANTON_H = STRIPE_H * 7;
function starPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.382;
    return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}
const US_STARS: string[] = [];
for (let row = 1; row <= 9; row++) {
  const odd = row % 2 === 1;
  for (let col = 0; col < (odd ? 6 : 5); col++) {
    US_STARS.push(starPoints((odd ? 1 + col * 2 : 2 + col * 2) * (76 / 12), row * (CANTON_H / 10), 3.4));
  }
}

/** Vector flags (crisp at any screen density; the old 18×12 PNGs went blurry when enlarged). */
function Flag({ lang }: { lang: Lang }) {
  return (
    <span className="inline-flex h-[16px] w-[30px] shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/15" aria-hidden>
      <svg viewBox="0 0 190 100" preserveAspectRatio="none" className="size-full">
        {lang === "ja" ? (
          <>
            <rect width="190" height="100" fill="#fff" />
            <circle cx="95" cy="50" r="30" fill="#bc002d" />
          </>
        ) : (
          <>
            <rect width="190" height="100" fill="#fff" />
            {Array.from({ length: 7 }, (_, i) => (
              <rect key={i} y={i * 2 * STRIPE_H} width="190" height={STRIPE_H} fill="#b22234" />
            ))}
            <rect width="76" height={CANTON_H} fill="#3c3b6e" />
            {US_STARS.map((p, i) => (
              <polygon key={i} points={p} fill="#fff" />
            ))}
          </>
        )}
      </svg>
    </span>
  );
}

/**
 * Same page in the other language. Both languages share one URL, so this only asks middleware.ts to
 * save the language in a cookie (?lang=) and come straight back to the same page.
 *
 * The page is prerendered under its internal route (/ja/news-event, /en/news-event), so the pathname can
 * carry that language prefix. It must not end up in the link: middleware.ts redirects /ja/... and /en/...
 * to the clean URL and *saves that prefix's language in the cookie*, which would undo the language
 * just chosen (a Japanese page's "English" link would land on Japanese again).
 */
export function altPath(pathname: string, to: Lang) {
  const clean = (pathname || "/").replace(/^\/(?:ja|en)(?=\/|$)/, "") || "/";
  return `${clean}?lang=${to}`;
}

function Current({ lang, open, onToggle }: { lang: Lang; open?: boolean; onToggle?: () => void }) {
  return (
    <button
      type="button"
      className="site-header-icon flex h-10 items-center gap-2 rounded-md px-2 text-heading transition-colors hover:bg-black/5"
      aria-haspopup="true"
      aria-expanded={open ?? false}
      aria-label={LABEL[lang]}
      title={LABEL[lang]}
      onClick={onToggle}
    >
      <Flag lang={lang} />
      <ChevronDown className={`size-[9px] opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

/** Static placeholder rendered while the current path is unknown (prerendered app shells). */
export function LangSwitcherFallback({ lang }: { lang: Lang }) {
  return (
    <div>
      <Current lang={lang} />
    </div>
  );
}

export default function LangSwitcher({ lang, className = "" }: { lang: Lang; className?: string }) {
  const pathname = usePathname();
  const other: Lang = lang === "en" ? "ja" : "en";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Tap/click toggles the menu (hover and focus alone don't work on touch screens, e.g. iPhone Safari never
  // focuses a tapped button). Tapping elsewhere or pressing Esc closes it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const show = "visible translate-y-0 opacity-100";
  return (
    <div ref={rootRef} className={`group relative ${className}`}>
      <Current lang={lang} open={open} onToggle={() => setOpen((o) => !o)} />
      {/* pt-1.5 is a transparent bridge so the pointer can travel from the button to the card without losing hover */}
      <div
        className={`absolute right-0 top-full z-50 pt-1.5 transition duration-150 [@media(hover:hover)]:group-hover:visible [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 ${
          open ? show : "invisible -translate-y-1 opacity-0"
        }`}
      >
        <div className="rounded-lg bg-white p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.14)] ring-1 ring-black/5">
          {/* Plain link, not next/link: it must be a full page request so the cookie is set and the page reloads in the new language */}
          <a
            href={altPath(pathname, other)}
            rel="nofollow"
            lang={other}
            aria-label={other === "ja" ? "Japanese" : "English"}
            title={other === "ja" ? "Japanese" : "English"}
            className="flex h-10 w-12 items-center justify-center rounded-md transition-colors hover:bg-black/5"
          >
            <Flag lang={other} />
          </a>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Lang } from "@/lib/i18n";

const KEY = "seats_cookies_accepted";
const TEXT = {
  en: "We use cookies to improve your experience on our website. By browsing this website, you agree to our use of cookies.",
  ja: "当ウェブサイトでは、お客様の体験向上のためにCookieを使用しています。本サイトを閲覧することにより、Cookieの使用に同意したものとみなされます。",
};

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function accepted() {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export default function CookieBanner({ lang }: { lang: Lang }) {
  // Server snapshot = accepted, so the banner never flashes during SSR/hydration
  const isAccepted = useSyncExternalStore(subscribe, accepted, () => true);
  const barRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);

  // The bar is `fixed`, so it doesn't push page content — reserve a same-height spacer
  // (rendered last, after <Footer>) so it never covers the footer or a bottom CTA band.
  useEffect(() => {
    if (isAccepted || !barRef.current) return;
    const el = barRef.current;
    const update = () => setBarHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isAccepted]);

  if (isAccepted) return null;
  return (
    <>
      <div ref={barRef} className="fixed inset-x-0 bottom-0 z-[60] bg-white px-[30px] py-[15px] shadow-[0_0_9px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-5 max-[767px]:flex-col max-[767px]:text-center">
          <p className="text-[16px] text-text">{TEXT[lang]}</p>
          <button
            type="button"
            className="shrink-0 rounded-[5px] bg-[#2035f2] px-[14px] py-[10px] text-[13px] font-semibold uppercase leading-[16px] text-white hover:bg-[#1d30dc]"
            onClick={() => {
              try {
                localStorage.setItem(KEY, "1");
              } catch {}
              listeners.forEach((l) => l());
            }}
          >
            {lang === "ja" ? "同意する" : "Accept"}
          </button>
        </div>
      </div>
      <div aria-hidden style={{ height: barHeight }} />
    </>
  );
}

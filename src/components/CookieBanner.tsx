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
// localStorage can be missing or throw (private mode, in-app browsers like LINE/Facebook, blocked site data).
// Fall back to a cookie, then to an in-memory flag, so the Accept button always closes the banner.
let dismissed = false;
function accepted() {
  if (dismissed) return true;
  try {
    if (localStorage.getItem(KEY)) return true;
  } catch {}
  try {
    return document.cookie.split("; ").some((c) => c.startsWith(`${KEY}=`));
  } catch {
    return false;
  }
}
function accept() {
  dismissed = true;
  try {
    localStorage.setItem(KEY, "1");
  } catch {}
  try {
    document.cookie = `${KEY}=1; max-age=31536000; path=/; SameSite=Lax`;
  } catch {}
  listeners.forEach((l) => l());
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
      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-0 z-[60] bg-white pt-[15px] pr-[max(30px,env(safe-area-inset-right))] pb-[max(15px,env(safe-area-inset-bottom))] pl-[max(30px,env(safe-area-inset-left))] shadow-[0_0_9px_rgba(0,0,0,0.1)] max-[767px]:pt-[12px] max-[767px]:pr-[max(16px,env(safe-area-inset-right))] max-[767px]:pl-[max(16px,env(safe-area-inset-left))]"
      >
        {/* dvh = the visible height (vh ignores mobile browser toolbars). The text scrolls if the screen is
            very short, so the Accept button never leaves the screen. */}
        <div className="flex max-h-[45dvh] items-center justify-between gap-5 max-[767px]:flex-col max-[767px]:gap-3 max-[767px]:text-center">
          <p className="min-h-0 overflow-y-auto overscroll-contain text-[16px] text-text max-[767px]:text-[13px] max-[767px]:leading-[1.5]">{TEXT[lang]}</p>
          <button
            type="button"
            className="shrink-0 rounded-[5px] bg-[#2035f2] px-[14px] py-[10px] text-[13px] font-semibold uppercase leading-[16px] text-white hover:bg-[#1d30dc] max-[767px]:w-full"
            onClick={accept}
          >
            {lang === "ja" ? "同意する" : "Accept"}
          </button>
        </div>
      </div>
      <div aria-hidden style={{ height: barHeight }} />
    </>
  );
}

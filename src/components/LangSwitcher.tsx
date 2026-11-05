"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { ChevronDown } from "./icons";

const LABEL = { en: "ENGLISH", ja: "JAPANESE" } as const;
const FLAG = { en: "/media/flags/en_US.png", ja: "/media/flags/ja.png" } as const;

/**
 * Same page in the other language. Both languages share one URL, so this only asks middleware.ts to
 * save the language in a cookie (?lang=) and come straight back to the same page.
 */
export function altPath(pathname: string, to: Lang) {
  return `${pathname || "/"}?lang=${to}`;
}

function Current({ lang }: { lang: Lang }) {
  return (
    <button
      type="button"
      className="site-header-icon flex h-10 items-center gap-1.5 text-[15px] font-semibold uppercase text-heading"
      aria-haspopup="true"
    >
      <Image src={FLAG[lang]} alt="" width={18} height={12} unoptimized />
      <span>{LABEL[lang]}</span>
      <ChevronDown className="size-[8px] opacity-50" />
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
  return (
    <div className={`group relative ${className}`}>
      <Current lang={lang} />
      <div className="invisible absolute right-0 top-full z-50 min-w-[160px] rounded-[5px] bg-white p-2.5 opacity-0 shadow-[0_0_3px_rgba(0,0,0,0.15)] transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        {/* Plain link, not next/link: it must be a full page request so the cookie is set and the page reloads in the new language */}
        <a
          href={altPath(pathname, other)}
          rel="nofollow"
          lang={other}
          className="flex items-center gap-2 px-2 py-2 text-[14px] text-[#838383] hover:text-heading"
        >
          <Image src={FLAG[other]} alt="" width={18} height={12} unoptimized />
          {other === "ja" ? "Japanese" : "English"}
        </a>
      </div>
    </div>
  );
}

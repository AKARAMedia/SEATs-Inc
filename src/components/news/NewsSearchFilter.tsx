"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Lang } from "@/lib/i18n";

const T = {
  results: { en: "Search results for", ja: "検索結果:" },
  none: { en: "No posts found.", ja: "該当する記事はありません。" },
  clear: { en: "Show all", ja: "すべて表示" },
};

/** Applies ?s=term from the Home search box by hiding non-matching server-rendered cards. */
export default function NewsSearchFilter({ lang }: { lang: Lang }) {
  const q = (useSearchParams().get("s") ?? "").trim().toLowerCase();
  const router = useRouter();

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>("#news-grid > [data-search]");
    let shown = 0;
    cards.forEach((c) => {
      const match = !q || (c.dataset.search ?? "").includes(q);
      c.hidden = !match;
      if (match) shown++;
    });
    document.getElementById("news-none")?.toggleAttribute("hidden", shown > 0);
  }, [q]);

  if (!q) return null;
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 text-[15px]">
      <span>
        {T.results[lang]} <strong>“{q}”</strong>
      </span>
      <button
        type="button"
        className="text-primary underline hover:text-accent"
        onClick={() => router.replace(lang === "ja" ? "/ja/news-event/" : "/news-event/")}
      >
        {T.clear[lang]}
      </button>
      <p id="news-none" hidden className="w-full text-[#888]">
        {T.none[lang]}
      </p>
    </div>
  );
}

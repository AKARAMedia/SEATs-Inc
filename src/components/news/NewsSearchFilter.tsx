"use client";

import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";

const T = {
  results: { en: "Search results for", ja: "検索結果:" },
  none: { en: "No posts found.", ja: "該当する記事はありません。" },
  clear: { en: "Show all", ja: "すべて表示" },
};

/** Shows the ?s=term banner for a search the server already applied to the rendered cards. */
export default function NewsSearchFilter({ lang, q, hasResults }: { lang: Lang; q: string; hasResults: boolean }) {
  const router = useRouter();
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
      {!hasResults && <p className="w-full text-[#888]">{T.none[lang]}</p>}
    </div>
  );
}

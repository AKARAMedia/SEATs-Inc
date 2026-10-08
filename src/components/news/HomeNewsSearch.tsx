"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { SearchIcon } from "@/components/icons";

export default function HomeNewsSearch({ lang }: { lang: Lang }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  return (
    <form
      role="search"
      className="flex w-[413px] max-w-full items-center border-l border-black/10 pl-3 max-[767px]:w-full max-[767px]:rounded-[5px] max-[767px]:border max-[767px]:pl-0"
      onSubmit={(e) => {
        e.preventDefault();
        const base = lang === "ja" ? "/ja/news-event/" : "/news-event/";
        router.push(q.trim() ? `${base}?s=${encodeURIComponent(q.trim())}` : base);
      }}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={lang === "ja" ? "検索" : "Search"}
        aria-label={lang === "ja" ? "ニュースを検索" : "Search news"}
        className="h-[42px] flex-1 bg-transparent px-3 text-[14px] text-text outline-none placeholder:text-[#bbb]"
      />
      <button type="submit" aria-label="Search" className="px-4 text-primary hover:text-accent max-[767px]:hidden">
        <SearchIcon />
      </button>
    </form>
  );
}

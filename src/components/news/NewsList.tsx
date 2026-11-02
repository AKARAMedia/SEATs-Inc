"use client";

import { Suspense, useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import NewsCard from "@/components/news/NewsCard";
import NewsSearchFilter from "@/components/news/NewsSearchFilter";
import { pageItems } from "@/components/admin/ui/Pagination";
import { href, type Lang } from "@/lib/i18n";
import { PAGE_SIZE } from "@/lib/news-shared";
import type { NewsItem } from "@/lib/news";

type Slim = Omit<NewsItem, "body">;

/** Searching reads title + excerpt only (the static index has no post bodies). */
const matches = (i: Slim, q: string) => `${i.title}\n${i.excerpt}`.toLowerCase().includes(q.toLowerCase());

const searchHref = (lang: Lang, q: string, n: number) =>
  href(lang, `/news-event/?${new URLSearchParams({ s: q, ...(n > 1 && { page: String(n) }) })}`);

/** Search results (?s=term): the one thing a static page can't do on its own, so it runs in the browser. */
function Search({ lang, q }: { lang: Lang; q: string }) {
  const sp = useSearchParams();
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const [index, setIndex] = useState<Slim[] | null>(null);
  useEffect(() => {
    let live = true;
    fetch(href(lang, "/news-index.json"))
      .then((r) => r.json())
      .then((d: Slim[]) => live && setIndex(d))
      .catch(() => live && setIndex([]));
    return () => {
      live = false;
    };
  }, [lang]);

  const found = index && index.filter((i) => matches(i, q));
  const pages = found ? Math.max(1, Math.ceil(found.length / PAGE_SIZE)) : 1;
  const items = found ? found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : [];
  const go = (n: number) => (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    window.history.pushState(null, "", searchHref(lang, q, n));
    window.scrollTo({ top: 0 });
  };

  const base = "flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-[13px]";
  const idle = `${base} bg-white ring-1 ring-black/10 hover:bg-black/5`;
  const off = `${base} pointer-events-none bg-white text-[#bbb] ring-1 ring-black/5`;
  return (
    <>
      <NewsSearchFilter lang={lang} q={q} hasResults={items.length > 0 || !found} />
      <div className="grid min-h-[300px] grid-cols-1 gap-x-5 gap-y-5 tablet:grid-cols-2 desktop:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.slug} item={{ ...item, body: "" }} lang={lang} />
        ))}
      </div>
      {pages > 1 && (
        <nav className="mt-12 flex flex-wrap items-center justify-center gap-1" aria-label="Pagination">
          <a href={searchHref(lang, q, page - 1)} onClick={go(page - 1)} aria-label="Previous page" aria-disabled={page <= 1} className={page <= 1 ? off : idle}>
            ‹
          </a>
          {pageItems(page, pages).map((n, i) =>
            n === null ? (
              <span key={`gap${i}`} className="px-1 text-[#999]">
                …
              </span>
            ) : (
              <a key={n} href={searchHref(lang, q, n)} onClick={go(n)} aria-current={n === page ? "page" : undefined} className={n === page ? `${base} bg-primary font-semibold text-white` : idle}>
                {n}
              </a>
            ),
          )}
          <a href={searchHref(lang, q, page + 1)} onClick={go(page + 1)} aria-label="Next page" aria-disabled={page >= pages} className={page >= pages ? off : idle}>
            ›
          </a>
        </nav>
      )}
    </>
  );
}

function Live({ lang, children }: { lang: Lang; children: ReactNode }) {
  const q = useSearchParams().get("s")?.trim() ?? "";
  // The inline script in NewsGuard hid the static grid before first paint when the URL has ?s=
  useEffect(() => document.documentElement.removeAttribute("data-news-search"), [q]);
  return q ? <Search lang={lang} q={q} /> : <>{children}</>;
}

/** Shows the prerendered page (children) unless the URL has ?s=, in which case it shows search results. */
export default function NewsList({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <Suspense fallback={children}>
      <Live lang={lang}>{children}</Live>
    </Suspense>
  );
}

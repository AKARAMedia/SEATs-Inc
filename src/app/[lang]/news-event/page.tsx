import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, href } from "@/lib/i18n";
import { listNews } from "@/lib/news";
import NewsCard from "@/components/news/NewsCard";
import NewsSearchFilter from "@/components/news/NewsSearchFilter";
import Pagination from "@/components/admin/ui/Pagination";

export async function generateMetadata({ params }: PageProps<"/[lang]/news-event">): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "ja" ? "ニュース" : "News&Event",
    alternates: { languages: { en: "/news-event/", ja: "/ja/news-event/" } },
  };
}

export default async function NewsEventPage({ params, searchParams }: PageProps<"/[lang]/news-event">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const sp = await searchParams;
  const q = typeof sp.s === "string" ? sp.s.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);
  // PAGE_SIZE posts per page (lib/news.ts), server-paginated — avoids fetching/rendering
  // every published post on every request.
  const { items, pages } = await listNews(lang, { q: q || undefined, page });
  const pageHref = (n: number) => href(lang, `/news-event/${n > 1 || q ? `?${new URLSearchParams({ ...(q && { s: q }), ...(n > 1 && { page: String(n) }) })}` : ""}`);

  return (
    <div className="mx-auto max-w-[1222px] px-[15px] pb-[60px] pt-10">
      <NewsSearchFilter lang={lang} q={q} hasResults={items.length > 0} />
      <div
        id="news-grid"
        className="grid grid-cols-1 gap-x-5 gap-y-5 tablet:grid-cols-2 desktop:grid-cols-3"
      >
        {items.map((item, i) => (
          <NewsCard key={item.slug} item={item} lang={lang} priority={i < 3} />
        ))}
      </div>
      <div className="mt-12">
        <Pagination page={page} pages={pages} href={pageHref} />
      </div>
    </div>
  );
}

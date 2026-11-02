import NewsCard from "@/components/news/NewsCard";
import Pagination from "@/components/admin/ui/Pagination";
import { href, type Lang } from "@/lib/i18n";
import type { NewsItem } from "@/lib/news";

/** URL of a News & Event listing page. Every page is its own prerendered file (/news-event/page/2/ ...). */
export const newsPageHref = (lang: Lang, n: number) => href(lang, n > 1 ? `/news-event/page/${n}/` : "/news-event/");

/** One prerendered page of the News & Event grid, with pagination links to the other prerendered pages. */
export default function NewsStatic({ lang, items, page, pages }: { lang: Lang; items: Omit<NewsItem, "body">[]; page: number; pages: number }) {
  return (
    <div id="news-static">
      <div id="news-grid" className="grid grid-cols-1 gap-x-5 gap-y-5 tablet:grid-cols-2 desktop:grid-cols-3">
        {items.map((item, i) => (
          <NewsCard key={item.slug} item={{ ...item, body: "" }} lang={lang} priority={i < 3} />
        ))}
      </div>
      <div className="mt-12">
        <Pagination page={page} pages={pages} href={(n) => newsPageHref(lang, n)} />
      </div>
    </div>
  );
}

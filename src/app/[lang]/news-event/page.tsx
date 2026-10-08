import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLang } from "@/lib/i18n";
import { listNews } from "@/lib/news";
import NewsCard from "@/components/news/NewsCard";
import NewsSearchFilter from "@/components/news/NewsSearchFilter";

export async function generateMetadata({ params }: PageProps<"/[lang]/news-event">): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "ja" ? "ニュース" : "News&Event",
    alternates: { languages: { en: "/news-event/", ja: "/ja/news-event/" } },
  };
}

export default async function NewsEventPage({ params }: PageProps<"/[lang]/news-event">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  // Live page lists every post on one page (no pagination)
  const { items } = await listNews(lang, { limit: 1000 });
  return (
    <div className="mx-auto max-w-[1222px] px-[15px] pb-[60px] pt-10">
      {/* Optional ?s= filter from the Home page search box; cards are server-rendered, filter only hides */}
      <Suspense>
        <NewsSearchFilter lang={lang} />
      </Suspense>
      <div
        id="news-grid"
        className="grid grid-cols-1 gap-x-5 gap-y-5 tablet:grid-cols-2 desktop:grid-cols-3"
      >
        {items.map((item, i) => (
          <div key={item.slug} data-search={`${item.title} ${item.excerpt}`.toLowerCase()}>
            <NewsCard item={item} lang={lang} priority={i < 3} />
          </div>
        ))}
      </div>
    </div>
  );
}

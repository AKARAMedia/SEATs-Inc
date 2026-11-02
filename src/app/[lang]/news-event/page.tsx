import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n";
import { listNews } from "@/lib/news";
import NewsGuard from "@/components/news/NewsGuard";
import NewsList from "@/components/news/NewsList";
import NewsStatic from "@/components/news/NewsStatic";

export async function generateMetadata({ params }: PageProps<"/[lang]/news-event">): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "ja" ? "ニュース" : "News&Event",
    alternates: { languages: { en: "/news-event/", ja: "/ja/news-event/" } },
  };
}

// Static page 1. Pages 2+ are prerendered too (page/[n]); only ?s= search runs in the browser (NewsList),
// because a prerendered page can't run a query per visitor.
export default async function NewsEventPage({ params }: PageProps<"/[lang]/news-event">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const { items, pages } = await listNews(lang, { page: 1 });

  return (
    <div className="mx-auto max-w-[1222px] px-[15px] pb-[60px] pt-10">
      <NewsGuard lang={lang} />
      <NewsList lang={lang}>
        <NewsStatic lang={lang} items={items} page={1} pages={pages} />
      </NewsList>
    </div>
  );
}

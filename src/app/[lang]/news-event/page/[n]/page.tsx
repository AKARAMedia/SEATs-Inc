import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, LANGS } from "@/lib/i18n";
import { listNews } from "@/lib/news";
import NewsStatic from "@/components/news/NewsStatic";

// Pages 2..N of News & Event, each prerendered at build time (page 1 is ../../page.tsx).
export async function generateStaticParams() {
  const all = await Promise.all(
    LANGS.map(async (lang) => {
      const { pages } = await listNews(lang, { page: 1 });
      return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ lang, n: String(i + 2) }));
    }),
  );
  return all.flat();
}

export async function generateMetadata({ params }: PageProps<"/[lang]/news-event/page/[n]">): Promise<Metadata> {
  const { lang, n } = await params;
  return {
    title: `${lang === "ja" ? "ニュース" : "News&Event"} - ${lang === "ja" ? "ページ" : "Page"} ${n}`,
    alternates: { languages: { en: `/news-event/page/${n}/`, ja: `/ja/news-event/page/${n}/` } },
  };
}

export default async function NewsEventPageN({ params }: PageProps<"/[lang]/news-event/page/[n]">) {
  const { lang, n } = await params;
  const page = Number(n);
  if (!isLang(lang) || !Number.isInteger(page) || page < 2) notFound();
  const { items, pages } = await listNews(lang, { page });
  if (page > pages) notFound();

  return (
    <div className="mx-auto max-w-[1222px] px-[15px] pb-[60px] pt-10">
      <NewsStatic lang={lang} items={items} page={page} pages={pages} />
    </div>
  );
}

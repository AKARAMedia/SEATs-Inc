import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLang, LANGS } from "@/lib/i18n";
import { getNews, listNews } from "@/lib/news";
import NewsArticle from "@/components/news/NewsArticle";

// News/Event post detail. Posts live at the site root (/<slug>/), same as WordPress permalinks.

// Every live post is prerendered at build time, in both languages (see scripts/export-static.ts)
export async function generateStaticParams() {
  const { items } = await listNews("en", { limit: 5000 });
  return LANGS.flatMap((lang) => items.map((i) => ({ lang, slug: i.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const item = await getNews(lang, slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.excerpt.slice(0, 160),
    openGraph: { title: item.title, images: item.imageUrl ? [item.imageUrl] : [], type: "article" },
  };
}

async function Post({ params }: { params: PageProps<"/[lang]/[slug]">["params"] }) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const item = await getNews(lang, decodeURIComponent(slug));
  if (!item) notFound();
  return <NewsArticle item={item} lang={lang} />;
}

export default function PostPage(props: PageProps<"/[lang]/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Post params={props.params} />
    </Suspense>
  );
}

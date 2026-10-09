import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLang, LANGS } from "@/lib/i18n";
import { allNewsSlugs, getNews } from "@/lib/news";
import NewsArticle from "@/components/news/NewsArticle";

// News/Event post detail. Posts live at the site root (/<slug>/), same as WordPress permalinks.

export async function generateStaticParams() {
  // Local dev with embedded PGlite: Next.js runs this in a separate worker process, and PGlite can't be
  // opened by two processes. Dev renders posts on demand anyway, so skip the DB here.
  if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL) return [{ slug: "__placeholder__" }];
  const slugs = await allNewsSlugs();
  // Must return at least one entry for the route to prerender
  return slugs.length ? slugs.map((s) => ({ slug: s.slug })) : [{ slug: "__placeholder__" }];
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
    alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, l === "ja" ? `/ja/${slug}/` : `/${slug}/`])) },
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

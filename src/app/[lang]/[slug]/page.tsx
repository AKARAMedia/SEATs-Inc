import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLang, LANGS, type Lang } from "@/lib/i18n";
import { allNewsSlugs, getNews } from "@/lib/news";
import ArticleLightbox from "@/components/news/ArticleLightbox";
import { justifyGalleries } from "@/lib/gallery";

// News/Event post detail. Posts live at the site root (/<slug>/), same as WordPress permalinks.

export async function generateStaticParams() {
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

function dateParts(iso: string, lang: Lang) {
  const d = new Date(iso);
  const tz = "Asia/Phnom_Penh";
  const day = d.toLocaleDateString("en-US", { day: "2-digit", timeZone: tz });
  const month = lang === "ja" ? d.toLocaleDateString("ja-JP", { month: "long", timeZone: tz }) : d.toLocaleDateString("en-US", { month: "short", timeZone: tz });
  return { day, month };
}

async function Post({ params }: { params: PageProps<"/[lang]/[slug]">["params"] }) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const item = await getNews(lang, decodeURIComponent(slug));
  if (!item) notFound();
  const { day, month } = dateParts(item.publishedAt, lang);

  return (
    <article className="mx-auto mb-10 max-w-[1222px] px-[15px] pt-10">
      <header className="text-center">
        {item.category && (
          <span className="mb-[23px] inline-block rounded-[3.33px] bg-primary px-2.5 text-[12px] font-semibold uppercase leading-[25px] text-white">
            {item.category.name}
          </span>
        )}
        <h1 className="mb-2.5 text-[32px] font-normal capitalize leading-[1.2] text-text max-[767px]:text-[24px]">
          {item.title}
        </h1>
      </header>

      <ArticleLightbox>
        <div className="relative mt-[26px] overflow-hidden rounded-[5px]">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={1192}
              height={894}
              priority
              sizes="(min-width: 1222px) 1192px, 100vw"
              className="h-auto w-full"
            />
          )}
          <time
            dateTime={item.publishedAt}
            className={`${item.imageUrl ? "absolute left-[15px] top-[15px]" : "inline-block"} w-[53px] rounded-[3.33px] bg-white text-center text-heading shadow-[0_0_9px_rgba(0,0,0,0.1)]`}
          >
            <span className="block pb-1 pt-1.5 text-[24px] leading-6">{day}</span>
            <span className="block pb-2 pt-0.5 text-[12px] font-semibold uppercase leading-3">{month}</span>
          </time>
        </div>

        <div
          className="prose-seats mt-[30px] [&_figure]:mb-5 [&_p]:mb-5 [&_p]:leading-[1.6]"
          dangerouslySetInnerHTML={{ __html: justifyGalleries(item.body) }}
        />
      </ArticleLightbox>
      <hr className="mt-[60px] border-black/10" />
    </article>
  );
}

export default function PostPage(props: PageProps<"/[lang]/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Post params={props.params} />
    </Suspense>
  );
}

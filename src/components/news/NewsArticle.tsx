import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import { href, t, type Lang } from "@/lib/i18n";
import type { NewsItem } from "@/lib/news";
import ArticleLightbox from "@/components/news/ArticleLightbox";
import { prepareArticleHtml } from "@/lib/gallery";
import { originalImage } from "@/lib/media";

function dateParts(iso: string, lang: Lang) {
  const d = new Date(iso);
  const tz = "Asia/Phnom_Penh";
  const day = d.toLocaleDateString("en-US", { day: "2-digit", timeZone: tz });
  const month = lang === "ja" ? d.toLocaleDateString("ja-JP", { month: "long", timeZone: tz }) : d.toLocaleDateString("en-US", { month: "short", timeZone: tz });
  return { day, month };
}

/** A news post as shown on the website (also used by the admin preview). */
export default function NewsArticle({ item, lang }: { item: NewsItem; lang: Lang }) {
  const { day, month } = dateParts(item.publishedAt, lang);

  return (
    <article className="mx-auto mb-10 max-w-[1222px] px-5 pt-6 tablet:px-[15px] tablet:pt-10">
      {/* Back to the list: a plain link, so it works without JavaScript and in both languages */}
      <Link
        href={href(lang, "/news-event/")}
        className="btn-back mb-5 tablet:mb-6"
      >
        <ChevronRight className="size-[9px] rotate-180" />
        {t(lang, { en: "Back to News & Event", ja: "ニュース＆イベントに戻る" })}
      </Link>
      <header className="text-center">
        {item.category && (
          <span className="mb-4 inline-block rounded-[3.33px] bg-primary px-2.5 text-[12px] font-semibold uppercase leading-[25px] text-white tablet:mb-[23px]">
            {item.category.name}
          </span>
        )}
        <h1 className="mb-2.5 text-balance break-words text-[22px] font-normal capitalize leading-[1.35] text-text tablet:text-[28px] tablet:leading-[1.25] desktop:text-[32px] desktop:leading-[1.2]">
          {item.title}
        </h1>
      </header>

      <ArticleLightbox>
        {/* Phones: the photo runs edge to edge (the article has 20px side padding) */}
        <div className="relative -mx-5 mt-5 overflow-hidden tablet:mx-0 tablet:mt-[26px] tablet:rounded-[5px]">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.title}
              data-full={originalImage(item.imageUrl)}
              width={1192}
              height={894}
              priority
              sizes="(min-width: 1222px) 1192px, 100vw"
              className="h-auto w-full"
            />
          )}
          <time
            dateTime={item.publishedAt}
            className={`${item.imageUrl ? "absolute left-3 top-3 tablet:left-[15px] tablet:top-[15px]" : "inline-block"} w-[48px] rounded-[3.33px] bg-white text-center text-heading shadow-[0_0_9px_rgba(0,0,0,0.1)] tablet:w-[53px]`}
          >
            <span className="block pb-1 pt-1.5 text-[22px] leading-6 tablet:text-[24px]">{day}</span>
            <span className="block pb-2 pt-0.5 text-[11px] font-semibold uppercase leading-3 tablet:text-[12px]">{month}</span>
          </time>
        </div>

        <div
          className="prose-seats mt-6 text-[15px] tablet:mt-[30px] tablet:text-[16px] [&_figure]:mb-5 [&_p]:mb-5 [&_p]:leading-[1.7] tablet:[&_p]:leading-[1.6]"
          dangerouslySetInnerHTML={{ __html: prepareArticleHtml(item.body) }}
        />
      </ArticleLightbox>
      <hr className="mt-10 border-black/10 tablet:mt-[60px]" />
    </article>
  );
}

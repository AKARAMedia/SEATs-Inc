import Image from "next/image";
import type { Lang } from "@/lib/i18n";
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
            className={`${item.imageUrl ? "absolute left-[15px] top-[15px]" : "inline-block"} w-[53px] rounded-[3.33px] bg-white text-center text-heading shadow-[0_0_9px_rgba(0,0,0,0.1)]`}
          >
            <span className="block pb-1 pt-1.5 text-[24px] leading-6">{day}</span>
            <span className="block pb-2 pt-0.5 text-[12px] font-semibold uppercase leading-3">{month}</span>
          </time>
        </div>

        <div
          className="prose-seats mt-[30px] [&_figure]:mb-5 [&_p]:mb-5 [&_p]:leading-[1.6]"
          dangerouslySetInnerHTML={{ __html: prepareArticleHtml(item.body) }}
        />
      </ArticleLightbox>
      <hr className="mt-[60px] border-black/10" />
    </article>
  );
}

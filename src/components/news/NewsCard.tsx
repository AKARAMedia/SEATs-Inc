import Image from "next/image";
import Link from "next/link";
import { formatDate, href, type Lang } from "@/lib/i18n";
import type { NewsItem } from "@/lib/news";
import { CalendarIcon } from "@/components/icons";

/** Trim like the live Essential Addons post list: 19 words (EN) / ~60 chars (JA), then "...". */
export function trimExcerpt(text: string, lang: Lang) {
  if (lang === "ja") return text.length > 60 ? text.slice(0, 60) + "..." : text;
  const words = text.split(/\s+/);
  return words.length > 19 ? words.slice(0, 19).join(" ") + "..." : text;
}

const READ_MORE = { en: "Read More", ja: "続きを表示する" };

export default function NewsCard({
  item,
  lang,
  showExcerpt = true,
  priority = false,
}: {
  item: NewsItem;
  lang: Lang;
  showExcerpt?: boolean;
  priority?: boolean;
}) {
  const url = href(lang, `/${item.slug}/`);
  return (
    <article className="relative isolate h-full px-[15px] after:absolute after:inset-x-0 after:top-[30%] after:-z-10 after:h-[70%] after:rounded-[5px] after:bg-[#f8f8fe] after:content-['']">
      <div>
        {item.imageUrl && (
          <Link href={url} className="mb-[30px] block overflow-hidden rounded-[5px]" tabIndex={-1} aria-hidden>
            <Image
              src={item.imageUrl}
              alt=""
              width={708}
              height={531}
              priority={priority}
              sizes="(min-width: 1025px) 354px, (min-width: 768px) 45vw, 92vw"
              className="h-auto w-full transition-transform duration-500 hover:scale-105"
            />
          </Link>
        )}
        <div className="pb-[25px] pl-[15px] pr-[10px]">
          <h2 className="mb-[15px] text-[14px] font-bold capitalize leading-[1.4] text-[#222]">
            <Link href={url} className="text-[#222] hover:text-accent">
              {item.title}
            </Link>
          </h2>
          <div className="my-[5px] flex items-center gap-1 text-[12px] leading-[12px] text-[#aaa]">
            <CalendarIcon className="size-[11px]" />
            <time dateTime={item.publishedAt}>{formatDate(item.publishedAt, lang)}</time>
          </div>
          {showExcerpt && (
            <>
              <p className="mb-5 mt-2 text-[13px] leading-[1.5] text-[#4d4d4d]">{trimExcerpt(item.excerpt, lang)}</p>
              <Link href={url} className="text-[12px] font-medium leading-[1.6] text-[#000bec] hover:text-accent">
                {READ_MORE[lang]}
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

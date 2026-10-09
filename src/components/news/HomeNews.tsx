import Link from "next/link";
import { href, type Lang } from "@/lib/i18n";
import { homeNews } from "@/lib/home";
import NewsCard from "./NewsCard";
import HomeNewsSearch from "./HomeNewsSearch";

const T = {
  title: { en: "News & Events", ja: "ニュース＆イベント" },
  more: { en: "Read More", ja: "続きを表示する" },
};

/** Home page "News & Events" block: header box with search + latest 3 posts + Read More button. */
export default async function HomeNews({ lang, pinnedIds = [] }: { lang: Lang; pinnedIds?: number[] }) {
  const items = await homeNews(lang, pinnedIds);
  return (
    <section className="mx-auto max-w-[1222px] px-[15px] pt-[50px]">
      <div className="mb-5 flex items-center justify-between gap-6 rounded-[5px] bg-white px-8 py-[22px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] max-[767px]:flex-col max-[767px]:items-stretch max-[767px]:px-2.5 max-[767px]:py-2.5">
        <h2 className="text-[30px] font-semibold leading-[1.4] text-primary max-[767px]:hidden">{T.title[lang]}</h2>
        <HomeNewsSearch lang={lang} />
      </div>
      <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2 desktop:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.slug} item={item} lang={lang} showExcerpt={false} />
        ))}
      </div>
      <div className="mt-[30px] text-center">
        <Link href={href(lang, "/news-event/")} className="btn-primary min-w-[150px]">
          {T.more[lang]}
        </Link>
      </div>
    </section>
  );
}

import type { Lang } from "@/lib/i18n";

/**
 * Runs before the news grid is painted, so old/shared URLs behave without a flash of the wrong content:
 *   /news-event/?page=3  ->  /news-event/page/3/   (each page is its own static file now)
 *   /news-event/?s=term  ->  hide the static grid until the search results replace it
 */
export default function NewsGuard({ lang }: { lang: Lang }) {
  const base = lang === "ja" ? "/ja/news-event/" : "/news-event/";
  const js = `(function(){var p=new URLSearchParams(location.search),n=parseInt(p.get("page"),10);if(p.get("s")){document.documentElement.setAttribute("data-news-search","1")}else if(n>1){location.replace(${JSON.stringify(base)}+"page/"+n+"/")}})()`;
  return (
    <>
      <style>{"html[data-news-search] #news-static{visibility:hidden}"}</style>
      <script dangerouslySetInnerHTML={{ __html: js }} />
    </>
  );
}

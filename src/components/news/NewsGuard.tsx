"use client";

import { useEffect, useSyncExternalStore } from "react";

const BASE = "/news-event/";

/**
 * Runs before the news grid is painted, so old/shared URLs behave without a flash of the wrong content:
 *   /news-event/?page=3  ->  /news-event/page/3/   (each page is its own static file now)
 *   /news-event/?s=term  ->  hide the static grid until the search results replace it
 *
 * On a full page load the inline <script> in the server HTML does this before first paint. React never runs a
 * <script> it creates in the browser (and warns about it), so on client-side navigation the script is not
 * rendered at all and the effect below does the ?page= redirect instead. (NewsList takes care of ?s= there.)
 */
const js = `(function(){var p=new URLSearchParams(location.search),n=parseInt(p.get("page"),10);if(p.get("s")){document.documentElement.setAttribute("data-news-search","1")}else if(n>1){location.replace(${JSON.stringify(BASE)}+"page/"+n+"/")}})()`;

const noop = () => () => {};

export default function NewsGuard() {
  // true while rendering on the server and while hydrating the server HTML (so the markup matches),
  // false for a component created in the browser during client-side navigation
  const fromServerHtml = useSyncExternalStore(noop, () => false, () => true);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const n = parseInt(p.get("page") ?? "", 10);
    if (!p.get("s") && n > 1) location.replace(`${BASE}page/${n}/`);
  }, []);

  return (
    <>
      <style>{"html[data-news-search] #news-static{visibility:hidden}"}</style>
      {fromServerHtml && <script dangerouslySetInnerHTML={{ __html: js }} />}
    </>
  );
}

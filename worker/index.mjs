// Entry point of the Worker (wrangler.jsonc "main"). Wraps the OpenNext handler for one reason:
// both languages share one URL (/overview/ is English or Japanese depending on the visitor's
// "seats-lang" cookie, see src/middleware.ts), so Cloudflare can no longer pick the right static file
// by URL alone.
//
// For a normal page request this looks at the cookie and fetches the matching prerendered file from the
// static assets (English at /overview/, Japanese at /ja/overview/, see scripts/export-static.ts). That is
// a plain asset lookup with almost no CPU, so it stays inside the Free plan's 10 ms limit. Everything
// else (admin, API, previews, redirects such as /ja/... -> clean URL and ?lang=, pages that weren't
// prerendered) goes to the normal OpenNext Worker, where middleware.ts handles it as before.
//
// wrangler.jsonc "assets.run_worker_first" sends only page-like requests here; /_next, /media, /uploads
// and /jp are still served by Cloudflare directly, without running any Worker.
import openNext from "../.open-next/worker.js";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "../.open-next/worker.js";

const LANG_COOKIE = "seats-lang";
// Handled by the full app (auth, API, image resizer), never by static files
const DYNAMIC = /^\/(admin|api|cdn-cgi|_next)(\/|$)/;
// Old language-prefixed URLs: middleware.ts redirects them to the clean URL and sets the cookie
const PREFIXED = /^\/(ja|en)(\/|$)/;

const wantsJapanese = (cookie) => (cookie ?? "").split(";").some((c) => c.trim() === `${LANG_COOKIE}=ja`);

export async function staticPage(request, env) {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const url = new URL(request.url);
  if (DYNAMIC.test(url.pathname) || PREFIXED.test(url.pathname) || url.searchParams.has("lang")) return null;

  // Japanese visitors: the /ja/ copy first, then the plain file (sitemap.xml, robots.txt, ...)
  const paths = wantsJapanese(request.headers.get("cookie")) ? [`/ja${url.pathname}`, url.pathname] : [url.pathname];
  for (const pathname of paths) {
    const target = new URL(url);
    target.pathname = pathname;
    target.search = "";
    const res = await env.ASSETS.fetch(new Request(target, request));
    // Redirects (e.g. missing trailing slash) and 404s go to the full app, which handles them
    if (res.status === 200 || res.status === 304) {
      const out = new Response(res.body, res);
      // Same URL, different file per cookie: caches must not mix them up
      out.headers.append("Vary", "Cookie");
      return out;
    }
  }
  return null;
}

const worker = {
  async fetch(request, env, ctx) {
    return (await staticPage(request, env)) ?? openNext.fetch(request, env, ctx);
  },
};

export default worker;

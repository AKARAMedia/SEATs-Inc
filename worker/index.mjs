// Entry point of the Worker (wrangler.jsonc "main"). Wraps the OpenNext handler for two reasons:
//
// 1. Public pages are rendered from the database on request (src/app/[lang]/layout.tsx), so an admin edit
//    shows up without a rebuild or redeploy. Rendering costs CPU, so every rendered page is kept in the
//    edge cache (Cache API) for PAGE_TTL seconds: most visits are a cache hit that costs almost nothing, and
//    only the first visit after the entry expires renders again. An edit therefore shows within PAGE_TTL
//    seconds. Both languages share one URL (/overview/ is English or Japanese depending on the visitor's
//    "seats-lang" cookie, see src/middleware.ts), so the language is part of the cache key.
//
// 2. Admin-uploaded images (/uploads/...): images that existed at the last build are static files
//    (scripts/export-static.ts); newer ones only exist in the database and are served by
//    src/app/uploads/[...key], then kept in the edge cache because their URLs never change.
//
// wrangler.jsonc "assets.run_worker_first" sends page-like requests and /uploads images here; /_next, /media
// and /jp are still served by Cloudflare directly, without running any Worker. The Cache API is per data
// center and only works on the custom domains (seats-inc.com), not on *.workers.dev.
import openNext from "../.open-next/worker.js";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "../.open-next/worker.js";

const LANG_COOKIE = "seats-lang";
// How long a rendered public page may be served from the edge cache (seconds). Lower = edits show sooner,
// higher = fewer renders (less CPU).
const PAGE_TTL = 60;
// Uploaded images never change under the same URL (the key contains a random UUID)
const UPLOAD_TTL = 60 * 60 * 24 * 30;
// Never cached: admin, API, previews of drafts, the image resizer and internals
const DYNAMIC = /^\/(admin|api|cdn-cgi|_next|preview)(\/|$)/;
// Old language-prefixed URLs: middleware.ts redirects them to the clean URL and sets the cookie
const PREFIXED = /^\/(ja|en)(\/|$)/;
const UPLOADS = /^\/uploads\//;

const wantsJapanese = (cookie) => (cookie ?? "").split(";").some((c) => c.trim() === `${LANG_COOKIE}=ja`);

// A copy of a response that can be stored in the cache under its own Cache-Control, leaving the original
// (whose body is still unread) to be returned to the visitor.
function storable(res, cacheControl) {
  const copy = new Response(res.clone().body, res);
  copy.headers.set("Cache-Control", cacheControl);
  copy.headers.delete("Vary");
  return copy;
}

// What the visitor's browser gets for a page: always ask the Worker again (a cheap edge-cache hit), and the
// same URL can be English or Japanese, so caches must not mix them up.
function forBrowser(res) {
  const out = new Response(res.body, res);
  out.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  const vary = out.headers.get("Vary");
  if (!vary) out.headers.set("Vary", "Cookie");
  else if (!/\bcookie\b/i.test(vary)) out.headers.set("Vary", `${vary}, Cookie`);
  return out;
}

async function cachedPage(request, env, ctx) {
  const url = new URL(request.url);
  const cacheable =
    request.method === "GET" && !DYNAMIC.test(url.pathname) && !PREFIXED.test(url.pathname) && !url.searchParams.has("lang");
  if (!cacheable) return openNext.fetch(request, env, ctx);

  const lang = wantsJapanese(request.headers.get("cookie")) ? "ja" : "en";
  const keyUrl = new URL(url);
  keyUrl.searchParams.set("__lang", lang);
  const key = new Request(keyUrl.toString());
  const cache = caches.default;

  const hit = await cache.match(key);
  if (hit) return forBrowser(hit);

  const res = await openNext.fetch(request, env, ctx);
  // Redirects, 404s and anything that sets a cookie are not cached
  if (res.status !== 200 || res.headers.has("set-cookie")) return res;
  ctx.waitUntil(cache.put(key, storable(res, `public, s-maxage=${PAGE_TTL}`)));
  return forBrowser(res);
}

async function cachedUpload(request, env, ctx) {
  // The static file when the build exported it (a plain asset lookup, almost no CPU)
  const asset = await env.ASSETS.fetch(request);
  if (asset.status === 200 || asset.status === 304) return asset;
  if (request.method !== "GET") return openNext.fetch(request, env, ctx);

  // Otherwise it exists only in the database: read it once, then serve it from the edge cache. No
  // "Vary: Cookie" here: an image doesn't depend on language.
  const cache = caches.default;
  const key = new Request(request.url);
  const hit = await cache.match(key);
  if (hit) return hit;
  const res = await openNext.fetch(request, env, ctx);
  if (res.status === 200) ctx.waitUntil(cache.put(key, storable(res, `public, max-age=${UPLOAD_TTL}, immutable`)));
  return res;
}

const worker = {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if ((request.method === "GET" || request.method === "HEAD") && UPLOADS.test(pathname)) return cachedUpload(request, env, ctx);
    return cachedPage(request, env, ctx);
  },
};

export default worker;

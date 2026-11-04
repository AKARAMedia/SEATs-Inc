import { asc, desc, eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { JOB_SITES, jobs, type JobSite } from "@/db/schema";

// Public, read-only job feed for other websites (e.g. seatsinc-career.com).
//   GET /api/jobs/                -> career-site jobs (open and closed — see `open` on each job)
//   GET /api/jobs/?site=main      -> jobs for seats-inc.com
//   GET /api/jobs/?lang=ja        -> Japanese title/description where translated
// Closed jobs are included (not dropped) so the public listing can show a closed position instead
//   of it just disappearing. Sort order is unaffected by open/closed (2026-11-03: an earlier version
//   sorted open jobs first, which pushed a newly-closed job to the very last page — effectively
//   invisible again, defeating the point of keeping it listed) — a job keeps its normal position
//   whether open or closed.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const site = (JOB_SITES as readonly string[]).includes(q.get("site") ?? "") ? (q.get("site") as JobSite) : "career";
  const ja = q.get("lang") === "ja";

  // This feed is polled very frequently by other sites, often with a client-sent no-cache directive
  // that would otherwise bypass Cloudflare's edge cache regardless of our own response headers - so
  // caching is done explicitly here with the Workers Cache API instead of relying on HTTP semantics.
  // Keyed on a normalized URL (just the params that affect the response) so HEAD requests (Next.js
  // derives these from GET) and any extra client headers all hit the same cache entry.
  // Only available in the Workers runtime (production) - `caches` doesn't exist under plain Node.js
  // (local dev), where there's no edge cache to worry about anyway.
  const cache = typeof caches !== "undefined" ? (caches as CacheStorage & { default: Cache }).default : null;
  const cacheKey = new Request(`https://cache.internal/api/jobs?site=${site}&lang=${ja ? "ja" : "en"}`);
  const cached = await cache?.match(cacheKey);
  if (cached) {
    const hit = new Response(cached.body, cached);
    hit.headers.set("X-Debug-Cache", "HIT");
    return hit;
  }

  await ready();
  const rows = await db
    .select()
    .from(jobs)
    .where(eq(jobs.site, site))
    .orderBy(asc(jobs.sortOrder), desc(jobs.createdAt));

  const data = rows.map((j) => ({
    id: j.id,
    slug: j.slug,
    title: (ja && j.titleJa) || j.titleEn,
    type: j.type,
    department: j.department,
    location: j.location,
    salaryRange: j.salaryRange,
    workDays: j.workDays,
    descriptionHtml: (ja && j.descriptionJa) || j.descriptionEn,
    open: j.open,
    postedAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }));

  const response = Response.json(
    { count: data.length, jobs: data },
    { headers: { ...CORS, "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", "X-Debug-Cache": cache ? "MISS" : "UNAVAILABLE" } },
  );
  await cache?.put(cacheKey, response.clone());
  return response;
}

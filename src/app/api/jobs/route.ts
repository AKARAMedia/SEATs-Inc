import { getCloudflareContext } from "@opennextjs/cloudflare";
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

// Minimal surface of the KV binding this route actually uses, so the project doesn't need the full
// @cloudflare/workers-types package just for this.
type JobsKV = { get(key: string): Promise<string | null>; put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void> };

// This feed is polled very frequently by other sites, from visitors spread across many different
// regions/colos. Cloudflare's Cache API (caches.default) is scoped per colo/tier, which gave
// inconsistent hits in practice - a request landing on a colo that hadn't seen a recent request still
// ran a live DB query. KV is globally readable, so a value written by one request is visible to the
// very next request anywhere, not just nearby ones.
function jobsKv(): JobsKV | null {
  try {
    return (getCloudflareContext().env as unknown as { JOBS_CACHE?: JobsKV }).JOBS_CACHE ?? null;
  } catch {
    return null; // local dev (plain Node, no Cloudflare context) - nothing to cache against
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const site = (JOB_SITES as readonly string[]).includes(q.get("site") ?? "") ? (q.get("site") as JobSite) : "career";
  const ja = q.get("lang") === "ja";
  const cacheKey = `jobs:${site}:${ja ? "ja" : "en"}`;

  const kv = jobsKv();
  const cached = await kv?.get(cacheKey);
  if (cached) return new Response(cached, { headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });

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

  const body = JSON.stringify({ count: data.length, jobs: data });
  await kv?.put(cacheKey, body, { expirationTtl: 300 });

  return new Response(body, { headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}

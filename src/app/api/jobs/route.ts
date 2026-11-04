import { asc, desc, eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { JOB_SITES, jobs, type JobSite } from "@/db/schema";

// This route is hit very frequently by other sites polling for job listings, and a Cache-Control
// response header alone isn't enough to get it cached at Cloudflare's edge for a Worker-owned custom
// domain - without this, every single poll ran a live DB query. `revalidate` puts it through the same
// ISR cache Next.js already uses for pages, so repeat requests within the window are served from cache.
export const revalidate = 300;

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

  return Response.json(
    { count: data.length, jobs: data },
    { headers: { ...CORS, "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}

import { and, asc, desc, eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { JOB_SITES, jobs, type JobSite } from "@/db/schema";

// Public, read-only job feed for other websites (e.g. seatsinc-career.com).
//   GET /api/jobs/                -> open career-site jobs
//   GET /api/jobs/?site=main      -> open jobs for seats-inc.com
//   GET /api/jobs/?lang=ja        -> Japanese title/description where translated
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
    .where(and(eq(jobs.site, site), eq(jobs.open, true)))
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
    postedAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
  }));

  return Response.json(
    { count: data.length, jobs: data },
    { headers: { ...CORS, "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}

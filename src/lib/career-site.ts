import "server-only";
import { and, asc, count, eq, ilike, or, sql } from "drizzle-orm";
import { db, ready } from "@/db";
import { jobApplications, jobs } from "@/db/schema";

export const CAREER_JOB_PAGE_SIZES = [10, 25, 50] as const;

/** Admin-only: one page of seatsinc-career.com jobs, open or closed, always fresh (no "use cache"). */
export async function listCareerSiteJobs({
  page = 1,
  size = 10,
  q = "",
  department = "",
}: { page?: number; size?: number; q?: string; department?: string } = {}) {
  await ready();
  const where = and(
    eq(jobs.site, "career"),
    department ? eq(jobs.department, department) : undefined,
    q ? or(ilike(jobs.titleEn, `%${q}%`), ilike(jobs.department, `%${q}%`), ilike(jobs.location, `%${q}%`)) : undefined,
  );
  const [{ total }] = await db.select({ total: count() }).from(jobs).where(where);
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), pages);
  const rows = await db
    .select({
      id: jobs.id,
      titleEn: jobs.titleEn,
      type: jobs.type,
      department: jobs.department,
      location: jobs.location,
      open: jobs.open,
      applications: sql<number>`(select count(*)::int from ${jobApplications} where ${jobApplications.jobId} = ${jobs.id})`,
      newApplications: sql<number>`(select count(*)::int from ${jobApplications} where ${jobApplications.jobId} = ${jobs.id} and ${jobApplications.status} = 'new')`,
    })
    .from(jobs)
    .where(where)
    .orderBy(asc(jobs.sortOrder), asc(jobs.id))
    .limit(size)
    .offset((current - 1) * size);
  return { rows, total, pages, page: current };
}

export async function getCareerSiteJob(id: number) {
  await ready();
  const [row] = await db.select().from(jobs).where(eq(jobs.id, id));
  return row && row.site === "career" ? row : null;
}

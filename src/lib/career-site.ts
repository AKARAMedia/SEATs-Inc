import "server-only";
import { asc, count, eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { jobs } from "@/db/schema";

export const CAREER_JOB_PAGE_SIZES = [10, 25, 50] as const;

/** Admin-only: one page of seatsinc-career.com jobs, open or closed, always fresh (no "use cache"). */
export async function listCareerSiteJobs({ page = 1, size = 10 }: { page?: number; size?: number } = {}) {
  await ready();
  const where = eq(jobs.site, "career");
  const [{ total }] = await db.select({ total: count() }).from(jobs).where(where);
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), pages);
  const rows = await db
    .select({ id: jobs.id, titleEn: jobs.titleEn, type: jobs.type, location: jobs.location, open: jobs.open })
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

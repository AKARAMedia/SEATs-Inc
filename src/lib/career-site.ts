import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { jobs } from "@/db/schema";

/** Admin-only: every seatsinc-career.com job, open or closed, always fresh (no "use cache"). */
export async function listCareerSiteJobs() {
  await ready();
  return db.select().from(jobs).where(eq(jobs.site, "career")).orderBy(asc(jobs.sortOrder));
}

export async function getCareerSiteJob(id: number) {
  await ready();
  const [row] = await db.select().from(jobs).where(eq(jobs.id, id));
  return row && row.site === "career" ? row : null;
}

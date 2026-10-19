import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, asc, count, desc, eq, gt, isNull, or } from "drizzle-orm";
import { db, ready } from "@/db";
import { jobApplications, jobs, type ApplicationStatus } from "@/db/schema";
import type { Lang } from "@/lib/i18n";

export const CAREERS_TAG = "careers";

export type PublicJob = { slug: string; title: string; department: string; location: string; type: string; description: string; closesAt: string | null };

function localize(j: typeof jobs.$inferSelect, lang: Lang): PublicJob {
  const ja = lang === "ja";
  return {
    slug: j.slug,
    title: (ja && j.titleJa) || j.titleEn,
    department: j.department,
    location: j.location,
    type: j.type,
    description: (ja && j.descriptionJa) || j.descriptionEn,
    closesAt: j.closesAt?.toISOString() ?? null,
  };
}

/** Open, not past its closing date, and belongs to this site (not the seatsinc-career.com jobs). */
const accepting = () => and(eq(jobs.site, "main"), eq(jobs.open, true), or(isNull(jobs.closesAt), gt(jobs.closesAt, new Date())));

/** Cache until the next closing date (if soon), so closed jobs disappear on time. */
async function careersLife() {
  const [next] = await db
    .select({ at: jobs.closesAt })
    .from(jobs)
    .where(and(eq(jobs.open, true), gt(jobs.closesAt, new Date())))
    .orderBy(asc(jobs.closesAt))
    .limit(1);
  const secs = next?.at ? Math.ceil((next.at.getTime() - Date.now()) / 1000) + 5 : Infinity;
  if (secs < 86400) cacheLife({ stale: 60, revalidate: Math.max(60, secs), expire: 86400 * 7 });
  else cacheLife("hours");
}

export async function listOpenJobs(lang: Lang): Promise<PublicJob[]> {
  "use cache";
  cacheTag(CAREERS_TAG);
  await ready();
  await careersLife();
  const rows = await db.select().from(jobs).where(accepting()).orderBy(asc(jobs.sortOrder), desc(jobs.createdAt));
  return rows.map((r) => localize(r, lang));
}

export async function getOpenJob(lang: Lang, slug: string) {
  "use cache";
  cacheTag(CAREERS_TAG);
  await ready();
  await careersLife();
  const [row] = await db.select().from(jobs).where(and(eq(jobs.slug, slug), accepting()));
  return row ? { id: row.id, ...localize(row, lang) } : null;
}

export async function newApplicationCount() {
  await ready();
  const [{ n }] = await db.select({ n: count() }).from(jobApplications).where(eq(jobApplications.status, "new"));
  return n;
}

export const STATUS_LABELS: Record<ApplicationStatus, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-red-50 text-red-700" },
  reviewing: { label: "Reviewing", cls: "bg-amber-50 text-amber-700" },
  interview: { label: "Interview", cls: "bg-sky-50 text-sky-700" },
  hired: { label: "Hired", cls: "bg-green-50 text-green-700" },
  rejected: { label: "Rejected", cls: "bg-black/5 text-[#777]" },
};

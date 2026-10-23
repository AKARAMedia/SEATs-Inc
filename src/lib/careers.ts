import "server-only";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { jobApplications, jobs, type ApplicationStatus } from "@/db/schema";
import type { Lang } from "@/lib/i18n";

export const CAREERS_TAG = "careers";

export type PublicJob = { slug: string; title: string; department: string; location: string; type: string; description: string; postedAt: string };

function localize(j: typeof jobs.$inferSelect, lang: Lang): PublicJob {
  const ja = lang === "ja";
  return {
    slug: j.slug,
    title: (ja && j.titleJa) || j.titleEn,
    department: j.department,
    location: j.location,
    type: j.type,
    description: (ja && j.descriptionJa) || j.descriptionEn,
    postedAt: j.createdAt.toISOString(),
  };
}

/** Open and belongs to this site (not the seatsinc-career.com jobs). */
const accepting = () => and(eq(jobs.site, "main"), eq(jobs.open, true));

export async function listOpenJobs(lang: Lang): Promise<PublicJob[]> {
  await ready();
  const rows = await db.select().from(jobs).where(accepting()).orderBy(asc(jobs.sortOrder), desc(jobs.createdAt));
  return rows.map((r) => localize(r, lang));
}

export async function getOpenJob(lang: Lang, slug: string) {
  await ready();
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

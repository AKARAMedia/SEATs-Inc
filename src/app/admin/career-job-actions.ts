"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, ready } from "@/db";
import { jobs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { sanitizeBody, slugify } from "@/lib/sanitize";
import type { FormState } from "./actions";

const CareerJobInput = z.object({
  title: z.string().trim().min(1, "Enter the job title").max(200),
  type: z.string().trim().min(1).max(60),
  department: z.string().trim().max(100).default(""),
  location: z.string().trim().max(300).default(""),
  salaryRange: z.string().trim().max(60).default(""),
  workDays: z.string().trim().max(60).default(""),
  responsibilitiesHtml: z.string().max(20000).default(""),
  slug: z.string().trim().max(120).default(""),
  closesAt: z.string().default(""),
});

export async function saveCareerJobAction(_: FormState, fd: FormData): Promise<FormState> {
  const who = await requireAdmin("careers");
  await ready();
  const parsed = CareerJobInput.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const d = parsed.data;
  const id = Number(fd.get("id")) || undefined;
  const slug = slugify(d.slug || d.title) || `career-job-${Date.now()}`;
  const [clash] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(id ? and(eq(jobs.slug, slug), ne(jobs.id, id)) : eq(jobs.slug, slug));
  if (clash) return { error: "Another job already uses this URL.", fieldErrors: { slug: "Already in use" } };

  const closesAt = d.closesAt ? new Date(d.closesAt.length === 16 ? `${d.closesAt}:00+07:00` : d.closesAt) : null;
  if (closesAt && Number.isNaN(closesAt.getTime())) return { error: "Invalid closing date.", fieldErrors: { closesAt: "Invalid date" } };

  const values = {
    site: "career" as const,
    titleEn: d.title,
    type: d.type,
    department: d.department,
    salaryRange: d.salaryRange,
    workDays: d.workDays,
    location: d.location,
    closesAt,
    descriptionEn: sanitizeBody(d.responsibilitiesHtml),
    slug,
    open: fd.get("open") === "on",
    updatedAt: new Date(),
  };
  let jobId = id;
  if (id) {
    await db.update(jobs).set(values).where(eq(jobs.id, id));
  } else {
    [{ id: jobId }] = await db.insert(jobs).values(values).returning({ id: jobs.id });
  }
  await logActivity(who, id ? "job.update" : "job.create", { type: "job", id: jobId, summary: `${d.title} (career site)` });
  redirect(`/admin/career-jobs/${jobId}/?flash=${id ? "saved" : "jobCreated"}`);
}

const QuickEditInput = z.object({
  type: z.string().trim().min(1).max(60),
  department: z.string().trim().max(100).default(""),
  location: z.string().trim().max(300).default(""),
  salaryRange: z.string().trim().max(60).default(""),
  workDays: z.string().trim().max(60).default(""),
});

export type QuickEditState = { error?: string } | undefined;

/** Edits just the list-level fields from the Career Jobs list, without opening the full job editor. */
export async function quickEditCareerJobAction(_: QuickEditState, fd: FormData): Promise<QuickEditState> {
  const who = await requireAdmin("careers");
  await ready();
  const id = Number(fd.get("id"));
  const parsed = QuickEditInput.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Please check the highlighted fields." };
  const [row] = await db
    .update(jobs)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(jobs.id, id), eq(jobs.site, "career")))
    .returning({ title: jobs.titleEn });
  if (!row) return { error: "Job not found." };
  await logActivity(who, "job.update", { type: "job", id, summary: `${row.title} (career site, quick edit)` });
  refresh();
}

export async function setCareerJobOpenAction(id: number, open: boolean) {
  const who = await requireAdmin("careers");
  await ready();
  const [row] = await db
    .update(jobs)
    .set({ open, updatedAt: new Date() })
    .where(and(eq(jobs.id, id), eq(jobs.site, "career")))
    .returning({ title: jobs.titleEn });
  await logActivity(who, open ? "job.open" : "job.close", { type: "job", id, summary: `${row?.title ?? ""} (career site)` });
  refresh();
}

export async function deleteCareerJobAction(fd: FormData) {
  const who = await requireAdmin("careers");
  await ready();
  const id = Number(fd.get("id"));
  const [row] = await db
    .delete(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.site, "career")))
    .returning({ title: jobs.titleEn });
  if (row) await logActivity(who, "job.delete", { type: "job", id, summary: `${row.title} (career site)` });
  redirect("/admin/career-jobs/?flash=jobDeleted");
}

// One-time: populate the 41 seatsinc-career.com postings on a fresh environment
// (e.g. production, which has its own DATABASE_URL separate from local dev).
// Safe to click more than once — upserts on slug, so re-running just re-syncs.
export async function importCareerJobsSeedAction() {
  const who = await requireAdmin("careers");
  await ready();
  const seed = (await import("@/data/career-jobs-seed.json")).default as {
    slug: string;
    titleEn: string;
    type: string;
    salaryRange: string;
    workDays: string;
    location: string;
    descriptionEn: string;
    sortOrder: number;
    postedAt: string;
    wpId: number | null;
  }[];
  for (const j of seed) {
    const values = {
      site: "career" as const,
      slug: j.slug,
      titleEn: j.titleEn,
      type: j.type,
      salaryRange: j.salaryRange,
      workDays: j.workDays,
      location: j.location,
      descriptionEn: j.descriptionEn,
      sortOrder: j.sortOrder,
      createdAt: new Date(j.postedAt),
      wpId: j.wpId,
    };
    await db.insert(jobs).values(values).onConflictDoUpdate({ target: jobs.slug, set: { ...values, updatedAt: new Date() } });
  }
  await logActivity(who, "job.create", { type: "job", summary: `Imported ${seed.length} career-site jobs from seed` });
  redirect("/admin/career-jobs/?flash=jobCreated");
}

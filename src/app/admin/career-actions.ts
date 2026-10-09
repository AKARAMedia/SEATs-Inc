"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, ready } from "@/db";
import { APPLICATION_STATUSES, JOB_TYPES, jobApplications, jobs, translationItems } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { CAREERS_TAG } from "@/lib/careers";
import { htmlText } from "@/lib/translation/text";
import { sanitizeBody, slugify } from "@/lib/sanitize";
import type { FormState } from "./actions";

const JobInput = z.object({
  titleEn: z.string().trim().min(1, "Enter the job title").max(200),
  titleJa: z.string().trim().max(200).default(""),
  department: z.string().trim().max(100).default(""),
  location: z.string().trim().max(100).default(""),
  type: z.enum(JOB_TYPES),
  descriptionEn: z.string().default(""),
  descriptionJa: z.string().default(""),
  slug: z.string().trim().max(120).default(""),
  closesAt: z.string().default(""),
});

export async function saveJobAction(_: FormState, fd: FormData): Promise<FormState> {
  const who = await requireAdmin("careers");
  await ready();
  const parsed = JobInput.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const d = parsed.data;
  const id = Number(fd.get("id")) || undefined;
  const slug = slugify(d.slug || d.titleEn) || `job-${Date.now()}`;
  const [clash] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(id ? and(eq(jobs.slug, slug), ne(jobs.id, id)) : eq(jobs.slug, slug));
  if (clash) return { error: "Another job already uses this URL.", fieldErrors: { slug: "Already in use" } };
  const closesAt = d.closesAt ? new Date(d.closesAt.length === 16 ? `${d.closesAt}:00+07:00` : d.closesAt) : null;
  if (closesAt && Number.isNaN(closesAt.getTime())) return { error: "Invalid closing date.", fieldErrors: { closesAt: "Invalid date" } };

  const values = {
    ...d,
    slug,
    closesAt,
    open: fd.get("open") === "on",
    descriptionEn: sanitizeBody(d.descriptionEn),
    descriptionJa: sanitizeBody(d.descriptionJa),
    updatedAt: new Date(),
  };
  let jobId = id;
  if (id) {
    const [prev] = await db.select().from(jobs).where(eq(jobs.id, id));
    await db.update(jobs).set(values).where(eq(jobs.id, id));
    if (prev && (prev.titleJa !== values.titleJa || htmlText(prev.descriptionJa) !== htmlText(values.descriptionJa))) {
      await db.delete(translationItems).where(eq(translationItems.key, `job:${id}`));
    }
  } else {
    [{ id: jobId }] = await db.insert(jobs).values(values).returning({ id: jobs.id });
  }
  await logActivity(who, id ? "job.update" : "job.create", { type: "job", id: jobId, summary: d.titleEn });
  updateTag(CAREERS_TAG);
  redirect(`/admin/careers/jobs/${jobId}/?flash=${id ? "saved" : "jobCreated"}`);
}

export async function setJobOpenAction(id: number, open: boolean) {
  const who = await requireAdmin("careers");
  await ready();
  const [row] = await db.update(jobs).set({ open, updatedAt: new Date() }).where(eq(jobs.id, id)).returning({ title: jobs.titleEn });
  await logActivity(who, open ? "job.open" : "job.close", { type: "job", id, summary: row?.title ?? "" });
  updateTag(CAREERS_TAG);
  refresh();
}

export async function deleteJobAction(fd: FormData) {
  const who = await requireAdmin("careers");
  await ready();
  const id = Number(fd.get("id"));
  // Applications are kept (job title is stored on each application)
  const [row] = await db.delete(jobs).where(eq(jobs.id, id)).returning({ title: jobs.titleEn });
  await db.delete(translationItems).where(eq(translationItems.key, `job:${id}`));
  if (row) await logActivity(who, "job.delete", { type: "job", id, summary: row.title });
  updateTag(CAREERS_TAG);
  redirect("/admin/careers/?flash=jobDeleted");
}

export async function setApplicationStatusAction(id: number, status: string) {
  const who = await requireAdmin("careers");
  await ready();
  if (!(APPLICATION_STATUSES as readonly string[]).includes(status)) return;
  const [row] = await db
    .update(jobApplications)
    .set({ status: status as (typeof APPLICATION_STATUSES)[number] })
    .where(eq(jobApplications.id, id))
    .returning({ name: jobApplications.name, job: jobApplications.jobTitle });
  if (row) await logActivity(who, "application.status", { type: "application", id, summary: `${row.name} (${row.job}) → ${status}` });
  refresh();
}

export async function saveApplicationNotesAction(id: number, notes: string) {
  await requireAdmin("careers");
  await ready();
  await db.update(jobApplications).set({ notes: notes.slice(0, 5000) }).where(eq(jobApplications.id, id));
  refresh();
}

export async function deleteApplicationAction(fd: FormData) {
  const who = await requireAdmin("careers");
  await ready();
  const id = Number(fd.get("id"));
  // Deleting the application also deletes its CV (cascade)
  const [row] = await db.delete(jobApplications).where(eq(jobApplications.id, id)).returning({ name: jobApplications.name });
  if (row) await logActivity(who, "application.delete", { type: "application", summary: row.name });
  redirect("/admin/careers/?tab=applications&flash=applicationDeleted");
}

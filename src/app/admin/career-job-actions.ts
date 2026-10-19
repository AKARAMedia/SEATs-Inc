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
  jobType: z.string().trim().min(1).max(60),
  salaryRange: z.string().trim().max(60).default(""),
  workDays: z.string().trim().max(60).default(""),
  workplace: z.string().trim().max(300).default(""),
  responsibilitiesHtml: z.string().max(20000).default(""),
  slug: z.string().trim().max(120).default(""),
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

  const values = {
    site: "career" as const,
    titleEn: d.title,
    type: d.jobType,
    salaryRange: d.salaryRange,
    workDays: d.workDays,
    location: d.workplace,
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

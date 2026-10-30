"use client";

import { startTransition, useActionState, useRef } from "react";
import { saveCareerJobAction } from "@/app/admin/career-job-actions";
import { CAREER_DEPARTMENTS, CAREER_JOB_TYPES } from "@/lib/career-departments";
import RichTextEditor from "./RichTextEditor";
import { FieldError, FormError } from "./ui/Field";
import { useUnsavedChanges } from "./ui/useUnsavedChanges";

export type CareerJobValues = {
  id?: number;
  title: string;
  type: string;
  department: string;
  location: string;
  salaryRange: string;
  workDays: string;
  responsibilitiesHtml: string;
  slug: string;
  closesAt: string; // yyyy-MM-ddTHH:mm Cambodia time, or ""
  open: boolean;
};

export default function CareerJobForm({ values }: { values: CareerJobValues }) {
  const [state, action, pending] = useActionState(saveCareerJobAction, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useUnsavedChanges(ref);
  // Postings imported from the old WordPress site use free-text types ("Full - Time", …); keep them selectable so saving doesn't change them
  const types = CAREER_JOB_TYPES.includes(values.type) ? CAREER_JOB_TYPES : [...CAREER_JOB_TYPES, values.type];

  // A department typed before this was a dropdown stays selectable so saving doesn't clear it
  const departments = !values.department || CAREER_DEPARTMENTS.includes(values.department) ? CAREER_DEPARTMENTS : [...CAREER_DEPARTMENTS, values.department];

  return (
    <form
      ref={ref}
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <FormError state={state} />
      <div className="grid gap-4 min-[1101px]:grid-cols-[1fr_300px]">
        <section className="admin-card min-w-0 space-y-4 p-4">
          <label className="block">
            <span className="admin-label">
              Job title <span className="text-red-600">*</span>
            </span>
            <input name="title" defaultValue={values.title} required className="admin-input text-[16px]" placeholder="e.g. Information System Engineer" />
            <FieldError state={state} field="title" />
          </label>
          <div>
            <span className="admin-label">Responsibilities</span>
            <RichTextEditor name="responsibilitiesHtml" defaultValue={values.responsibilitiesHtml} lang="en" placeholder="Responsibilities, qualifications, benefits…" />
          </div>
        </section>
        <aside className="admin-card h-fit space-y-4 p-4">
          <label className="flex items-start gap-2">
            <input type="checkbox" name="open" defaultChecked={values.open} className="mt-1 size-4 accent-[var(--color-primary)]" />
            <span>
              <span className="block text-[14px] font-semibold">Accepting applications</span>
              <span className="block text-[12px] text-[#777]">Shown on the Recruit page while open.</span>
            </span>
          </label>
          <label className="block">
            <span className="admin-label">Type</span>
            <select name="type" defaultValue={values.type} className="admin-input">
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="admin-label">Department</span>
            <select name="department" defaultValue={values.department} className="admin-input">
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="admin-label">Location</span>
            <input name="location" defaultValue={values.location} className="admin-input" />
          </label>
          <label className="block">
            <span className="admin-label">Salary Range</span>
            <input name="salaryRange" defaultValue={values.salaryRange} className="admin-input" placeholder="$500 - $900" />
          </label>
          <label className="block">
            <span className="admin-label">Work Days</span>
            <input name="workDays" defaultValue={values.workDays} className="admin-input" placeholder="Mon - Sat" />
          </label>
          <label className="block">
            <span className="admin-label">Closing date (optional)</span>
            <input type="datetime-local" name="closesAt" defaultValue={values.closesAt} className="admin-input" />
            <span className="mt-1 block text-[12px] text-[#999]">The job disappears from the website after this time (Cambodia time).</span>
            <FieldError state={state} field="closesAt" />
          </label>
          <label className="block">
            <span className="admin-label">URL</span>
            <input name="slug" defaultValue={values.slug} placeholder="auto from the title" pattern="[a-z0-9\-]*" className="admin-input font-mono text-[13px]" />
            <span className="mt-1 block text-[12px] text-[#999]">seatsinc-career.com/jobs/{values.slug || "…"}/</span>
            <FieldError state={state} field="slug" />
          </label>
          <button type="submit" disabled={pending} className="admin-btn w-full">
            {pending ? "Saving…" : values.id ? "Save job" : "Create job"}
          </button>
        </aside>
      </div>
    </form>
  );
}

"use client";

import { startTransition, useActionState, useRef } from "react";
import { saveJobAction } from "@/app/admin/career-actions";
import RichTextEditor from "../RichTextEditor";
import { FieldError, FormError } from "../ui/Field";
import { useUnsavedChanges } from "../ui/useUnsavedChanges";

export type JobValues = {
  id?: number;
  titleEn: string;
  titleJa: string;
  department: string;
  location: string;
  type: string;
  descriptionEn: string;
  descriptionJa: string;
  slug: string;
  closesAt: string; // yyyy-MM-ddTHH:mm Cambodia time, or ""
  open: boolean;
};

export default function JobForm({ values, types }: { values: JobValues; types: readonly string[] }) {
  const [state, action, pending] = useActionState(saveJobAction, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useUnsavedChanges(ref);

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
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {(["en", "ja"] as const).map((l) => {
            const ja = l === "ja";
            return (
              <section key={l} lang={l} className="admin-card min-w-0 space-y-4 p-4">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                  <span className="rounded bg-[#eef6fc] px-1.5 py-0.5 text-[11px] font-bold text-primary">{ja ? "JP" : "EN"}</span>
                  {ja ? "日本語" : "English"}
                  {ja && <span className="text-[12px] font-normal text-[#999]">— optional; English is shown when empty</span>}
                </h2>
                <label className="block">
                  <span className="admin-label">
                    {ja ? "職種名 (Job title)" : "Job title"} {!ja && <span className="text-red-600">*</span>}
                  </span>
                  <input name={ja ? "titleJa" : "titleEn"} defaultValue={ja ? values.titleJa : values.titleEn} required={!ja} className="admin-input text-[16px]" placeholder={ja ? "" : "e.g. Store Manager"} />
                  <FieldError state={state} field={ja ? "titleJa" : "titleEn"} />
                </label>
                <div>
                  <span className="admin-label">{ja ? "仕事内容 (Description)" : "Description"}</span>
                  <RichTextEditor
                    name={ja ? "descriptionJa" : "descriptionEn"}
                    defaultValue={ja ? values.descriptionJa : values.descriptionEn}
                    lang={l}
                    placeholder={ja ? "仕事内容、応募資格、待遇など…" : "Responsibilities, requirements, what we offer…"}
                  />
                </div>
              </section>
            );
          })}
        </div>
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
            <input name="department" defaultValue={values.department} className="admin-input" placeholder="e.g. PISA Food Retail" />
          </label>
          <label className="block">
            <span className="admin-label">Location</span>
            <input name="location" defaultValue={values.location} className="admin-input" />
          </label>
          <label className="block">
            <span className="admin-label">Closing date (optional)</span>
            <input type="datetime-local" name="closesAt" defaultValue={values.closesAt} className="admin-input" />
            <span className="mt-1 block text-[12px] text-[#999]">The job disappears from the website after this time (Cambodia time).</span>
            <FieldError state={state} field="closesAt" />
          </label>
          <label className="block">
            <span className="admin-label">URL</span>
            <input name="slug" defaultValue={values.slug} placeholder="auto from the English title" pattern="[a-z0-9\-]*" className="admin-input font-mono text-[13px]" />
            <span className="mt-1 block text-[12px] text-[#999]">seats-inc.com/careers/{values.slug || "…"}/</span>
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

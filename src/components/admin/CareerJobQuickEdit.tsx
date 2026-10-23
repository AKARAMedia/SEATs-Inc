"use client";

import { startTransition, useActionState, useState } from "react";
import { quickEditCareerJobAction, type QuickEditState } from "@/app/admin/career-job-actions";
import { CAREER_DEPARTMENTS, CAREER_JOB_TYPES } from "@/lib/career-departments";
import { toast } from "./ui/toast";

export type QuickEditValues = { id: number; type: string; department: string; location: string; salaryRange: string; workDays: string };

export default function CareerJobQuickEdit({ values }: { values: QuickEditValues }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<QuickEditState, FormData>(async (prev, fd) => {
    const result = await quickEditCareerJobAction(prev, fd);
    if (!result?.error) {
      toast("Job updated.");
      setOpen(false);
    }
    return result;
  }, undefined);

  const types = CAREER_JOB_TYPES.includes(values.type) ? CAREER_JOB_TYPES : [...CAREER_JOB_TYPES, values.type];
  const departments = !values.department || CAREER_DEPARTMENTS.includes(values.department) ? CAREER_DEPARTMENTS : [...CAREER_DEPARTMENTS, values.department];

  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)} className="admin-btn-secondary !py-1 text-[13px]">
        {open ? "Cancel" : "Quick edit"}
      </button>
      {open && (
        <form
          className="order-last mt-2 grid w-full grid-cols-2 gap-3 rounded-lg bg-[#fafbfc] p-3 ring-1 ring-black/5 sm:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(() => action(fd));
          }}
        >
          <input type="hidden" name="id" value={values.id} />
          <label className="block text-[12px]">
            <span className="mb-1 block text-[#777]">Type</span>
            <select name="type" defaultValue={values.type} className="admin-input !py-1 text-[13px]">
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-[12px]">
            <span className="mb-1 block text-[#777]">Department</span>
            <select name="department" defaultValue={values.department} className="admin-input !py-1 text-[13px]">
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="block text-[12px]">
            <span className="mb-1 block text-[#777]">Location</span>
            <input name="location" defaultValue={values.location} className="admin-input !py-1 text-[13px]" />
          </label>
          <label className="block text-[12px]">
            <span className="mb-1 block text-[#777]">Salary Range</span>
            <input name="salaryRange" defaultValue={values.salaryRange} className="admin-input !py-1 text-[13px]" />
          </label>
          <label className="block text-[12px]">
            <span className="mb-1 block text-[#777]">Work Days</span>
            <input name="workDays" defaultValue={values.workDays} className="admin-input !py-1 text-[13px]" />
          </label>
          {state?.error && <p className="col-span-full text-[12px] text-red-600">{state.error}</p>}
          <div className="col-span-full flex gap-2">
            <button type="submit" disabled={pending} className="admin-btn !py-1 text-[13px]">
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

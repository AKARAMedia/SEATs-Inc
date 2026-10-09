"use client";

import { useState, useTransition } from "react";
import { saveApplicationNotesAction, setApplicationStatusAction, setJobOpenAction } from "@/app/admin/career-actions";
import type { ApplicationStatus } from "@/db/schema";
import { toast } from "../ui/toast";

const STEPS: { key: ApplicationStatus; label: string; cls: string }[] = [
  { key: "new", label: "New", cls: "bg-red-600" },
  { key: "reviewing", label: "Reviewing", cls: "bg-amber-500" },
  { key: "interview", label: "Interview", cls: "bg-sky-600" },
  { key: "hired", label: "Hired", cls: "bg-green-600" },
  { key: "rejected", label: "Rejected", cls: "bg-[#777]" },
];

/** Status pipeline buttons + private notes for one application. */
export function ApplicationControls({ id, status, notes }: { id: number; status: ApplicationStatus; notes: string }) {
  const [cur, setCur] = useState(status);
  const [text, setText] = useState(notes);
  const [saved, setSaved] = useState(notes);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      <div>
        <p className="admin-label">Status</p>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Application status">
          {STEPS.map((s) => (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={cur === s.key}
              disabled={pending}
              onClick={() => {
                setCur(s.key);
                start(async () => {
                  await setApplicationStatusAction(id, s.key);
                  toast(`Marked as ${s.label}.`);
                });
              }}
              className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${cur === s.key ? `${s.cls} text-white` : "bg-black/5 text-[#555] hover:bg-black/10"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="admin-label">Internal notes</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Interview notes, next steps… (only visible in the admin)" className="admin-input" />
      </label>
      {text !== saved && (
        <button
          type="button"
          className="admin-btn"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await saveApplicationNotesAction(id, text);
              setSaved(text);
              toast("Notes saved.");
            })
          }
        >
          Save notes
        </button>
      )}
    </div>
  );
}

export function JobOpenToggle({ id, open }: { id: number; open: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => setJobOpenAction(id, !open).then(() => toast(open ? "Job closed — hidden from the website." : "Job opened — shown on the website.")))}
      className="admin-btn-secondary !py-1 text-[13px]"
    >
      {open ? "Close" : "Reopen"}
    </button>
  );
}

"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { deleteTermAction, saveTermAction } from "@/app/admin/translation-actions";
import type { GlossaryTerm } from "@/lib/translation/text";
import { confirmDialog } from "../ui/confirm";
import { toast } from "../ui/toast";

function TermForm({ term, onDone }: { term?: GlossaryTerm; onDone?: () => void }) {
  const [state, action, pending] = useActionState(saveTermAction, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state?.ok) return;
    toast(state.ok);
    if (!term) ref.current?.reset();
    onDone?.();
    (ref.current?.elements.namedItem("termEn") as HTMLInputElement | null)?.focus();
  }, [state, term, onDone]);
  const fe = state?.fieldErrors ?? {};
  return (
    <form
      ref={ref}
      className="grid items-start gap-2 sm:grid-cols-[1fr_1fr_1.2fr_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      {term && <input type="hidden" name="id" value={term.id} />}
      <input name="termEn" defaultValue={term?.termEn} placeholder="English, e.g. LOKA" aria-label="English term" aria-invalid={!!fe.termEn} className="admin-input" />
      <input name="termJa" defaultValue={term?.termJa} placeholder="日本語, e.g. ロカ" lang="ja" aria-label="Japanese term" aria-invalid={!!fe.termJa} className="admin-input" />
      <input name="note" defaultValue={term?.note} placeholder="Note (optional)" aria-label="Note" className="admin-input" />
      <div className="flex gap-1">
        <button type="submit" disabled={pending} className="admin-btn whitespace-nowrap">
          {term ? "Save" : "+ Add"}
        </button>
        {term && (
          <button type="button" onClick={onDone} className="admin-btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function GlossaryEditor({ terms }: { terms: GlossaryTerm[] }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const shown = terms.filter((t) => !q || `${t.termEn} ${t.termJa} ${t.note}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <section className="admin-card p-4">
        <h2 className="mb-2 text-[14px] font-semibold">Add a term</h2>
        <TermForm />
      </section>

      <section className="admin-card">
        <div className="flex items-center gap-3 border-b border-black/10 px-4 py-3">
          <h2 className="mr-auto text-[14px] font-semibold">
            {terms.length} term{terms.length === 1 ? "" : "s"}
          </h2>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="admin-input !w-48" aria-label="Search glossary" />
        </div>
        {shown.length ? (
          <ul className="divide-y divide-black/5">
            {shown.map((t) =>
              editing === t.id ? (
                <li key={t.id} className="bg-primary/5 px-4 py-3">
                  <TermForm term={t} onDone={() => setEditing(null)} />
                </li>
              ) : (
                <li key={t.id} className="grid items-center gap-2 px-4 py-2.5 text-[14px] sm:grid-cols-[1fr_1fr_1.2fr_auto]">
                  <span className="font-medium">{t.termEn}</span>
                  <span lang="ja">{t.termJa}</span>
                  <span className="text-[13px] text-[#888]">{t.note}</span>
                  <span className="flex gap-3 text-[13px]">
                    <button type="button" className="text-primary hover:underline" onClick={() => setEditing(t.id)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={async () => {
                        if (!(await confirmDialog({ title: `Delete “${t.termEn}”?`, confirmLabel: "Delete", danger: true }))) return;
                        const fd = new FormData();
                        fd.set("id", String(t.id));
                        await deleteTermAction(fd);
                        toast("Term deleted.");
                      }}
                    >
                      Delete
                    </button>
                  </span>
                </li>
              ),
            )}
          </ul>
        ) : (
          <p className="p-8 text-center text-[13px] text-[#999]">{terms.length ? "No terms match." : "No terms yet. Add company, brand and place names first."}</p>
        )}
      </section>
    </div>
  );
}

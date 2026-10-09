"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { publishTranslationAction, saveTranslationDraftAction } from "@/app/admin/translation-actions";
import type { Workspace, WorkspaceRow } from "@/lib/translation/center";
import { htmlText, termsIn, wordDiff } from "@/lib/translation/text";
import { confirmDialog } from "../ui/confirm";
import { Icon } from "../ui/icons";
import { toast } from "../ui/toast";
import { HtmlRowEditor, TextRowEditor } from "./RowEditor";
import { STATUS_STYLE } from "./status";

type Edit = { target: string; auto: boolean; outdated: boolean };
type State = "ok" | "empty" | "auto" | "outdated";

const stateOf = (e: Edit): State => (e.outdated ? "outdated" : !e.target.trim() ? "empty" : e.auto ? "auto" : "ok");

const ROW_STYLE: Record<State, { dot: string; label: string }> = {
  ok: { dot: "bg-green-500", label: "Translated" },
  empty: { dot: "bg-[#d0d5db]", label: "Not translated" },
  auto: { dot: "bg-amber-400", label: "Auto-filled — check" },
  outdated: { dot: "bg-orange-500", label: "English changed" },
};

function Diff({ before, after }: { before: string; after: string }) {
  return (
    <p className="text-[13px] leading-relaxed">
      {wordDiff(before, after).map((p, i) =>
        p.type === "same" ? (
          <span key={i}>{p.text}</span>
        ) : p.type === "del" ? (
          <del key={i} className="bg-red-100 text-red-700">
            {p.text}
          </del>
        ) : (
          <ins key={i} className="bg-green-100 font-semibold text-green-800 no-underline">
            {p.text}
          </ins>
        ),
      )}
    </p>
  );
}

export default function TranslationWorkspace({ ws }: { ws: Workspace }) {
  const router = useRouter();
  const [edits, setEdits] = useState<Edit[]>(() => ws.rows.map((r) => ({ target: r.target, auto: r.state === "auto", outdated: r.state === "outdated" })));
  const [save, setSave] = useState<{ state: "saved" | "unsaved" | "saving" | "error"; at?: Date; error?: string; stale?: boolean }>({
    state: ws.rows.some((r) => r.state === "auto") ? "unsaved" : "saved",
    at: new Date(ws.updatedAt),
  });
  const [onlyTodo, setOnlyTodo] = useState(false);
  const [active, setActive] = useState(0);
  const [publishing, startPublish] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(edits);
  useEffect(() => {
    latest.current = edits;
  }, [edits]);
  const saving = useRef<Promise<boolean> | null>(null);

  const states = edits.map(stateOf);
  const counts = useMemo(() => {
    const c = { ok: 0, empty: 0, auto: 0, outdated: 0 };
    states.forEach((s) => c[s]++);
    return c;
  }, [states]);
  const pct = ws.rows.length ? Math.round((counts.ok / ws.rows.length) * 100) : 100;

  const payload = useCallback(() => latest.current.map((e, i) => ({ srcHash: ws.rows[i].srcHash, ...e })), [ws.rows]);

  /** Save now (waits for an in-flight save first). Resolves true on success. */
  const saveNow = useCallback(async (): Promise<boolean> => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (saving.current) await saving.current;
    setSave((s) => ({ ...s, state: "saving" }));
    const run = saveTranslationDraftAction(ws.key, payload()).then((r) => {
      if (r.ok) setSave({ state: "saved", at: new Date(r.savedAt) });
      else setSave({ state: "error", error: r.error, stale: r.stale });
      return r.ok;
    });
    saving.current = run;
    try {
      return await run;
    } catch {
      setSave({ state: "error", error: "Couldn't save. Check your connection." });
      return false;
    } finally {
      saving.current = null;
    }
  }, [payload, ws.key]);

  const update = (i: number, patch: Partial<Edit>) => {
    setEdits((list) => list.map((e, j) => (j === i ? { ...e, ...patch } : e)));
    setSave((s) => (s.stale ? s : { ...s, state: "unsaved" }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void saveNow(), 1500);
  };

  // Auto-filled rows are saved straight away so they show up as "to check" next time too
  useEffect(() => {
    if (!ws.rows.some((r) => r.state === "auto")) return;
    const t = setTimeout(() => void saveNow(), 0);
    return () => clearTimeout(t);
  }, [saveNow, ws.rows]);

  // Warn before leaving with unsaved changes; Ctrl+S saves
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (timer.current || saving.current) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveNow().then((ok) => ok && toast("Saved.", "info"));
      }
    };
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("keydown", onKey);
    };
  }, [saveNow]);

  const focusRow = (i: number) => {
    setActive(i);
    const el = document.getElementById(`row-${i}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = document.getElementById(`ja-${i}`) as HTMLElement | null;
    setTimeout(() => input?.focus(), 250);
  };

  /** Next row after `from` that still needs work (wraps around). */
  const nextTodo = (from: number) => {
    const n = edits.length;
    for (let k = 1; k <= n; k++) {
      const i = (from + k) % n;
      if (stateOf(latest.current[i]) !== "ok") return i;
    }
    return -1;
  };

  const goNext = (from: number) => {
    void saveNow();
    const i = nextTodo(from);
    if (i === -1) toast("All rows are translated — ready to publish.", "success");
    else focusRow(i);
  };

  const warnings = (r: WorkspaceRow, e: Edit) => {
    const out: string[] = [];
    if (!e.target.trim()) return out;
    const text = htmlText(e.target);
    for (const t of termsIn(htmlText(r.src), ws.glossary)) if (!text.includes(t.termJa)) out.push(`Glossary: “${t.termEn}” is usually “${t.termJa}”.`);
    if (r.maxLen && text.length > r.maxLen) out.push(`${text.length} characters — keep it under ${r.maxLen}.`);
    return out;
  };

  const publish = () =>
    startPublish(async () => {
      if (counts.empty || counts.auto || counts.outdated) {
        const parts = [
          counts.empty && `${counts.empty} not translated`,
          counts.auto && `${counts.auto} auto-filled to check`,
          counts.outdated && `${counts.outdated} where the English changed`,
        ].filter(Boolean);
        const go = await confirmDialog({
          title: "Not ready to publish yet",
          message: `Every row must be translated and checked first. Remaining: ${parts.join(", ")}.`,
          confirmLabel: "Go to the first one",
          cancelLabel: "Close",
        });
        if (go) focusRow(nextTodo(-1));
        return;
      }
      const warn = ws.rows.flatMap((r, i) => warnings(r, edits[i]).map((w) => `Row ${i + 1}: ${w}`));
      const ok = await confirmDialog({
        title: "Publish the Japanese version?",
        message: (
          <>
            <p>It replaces the Japanese text that is live on the website now.</p>
            {warn.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 rounded-md bg-amber-50 p-3 pl-7 text-[13px] text-amber-800">
                {warn.slice(0, 6).map((w) => (
                  <li key={w}>{w}</li>
                ))}
                {warn.length > 6 && <li>…and {warn.length - 6} more</li>}
              </ul>
            )}
          </>
        ),
        confirmLabel: warn.length ? "Publish anyway" : "Publish",
      });
      if (!ok) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      if (saving.current) await saving.current;
      const r = await publishTranslationAction(ws.key, payload());
      if (r.ok) {
        setSave({ state: "saved", at: new Date() });
        toast("Japanese version published.");
        router.refresh();
      } else {
        if (r.stale) setSave({ state: "error", error: r.error, stale: true });
        toast(r.error, "error");
      }
    });

  const status = STATUS_STYLE[ws.status];
  const visible = ws.rows.map((r, i) => ({ r, i })).filter(({ i }) => !onlyTodo || states[i] !== "ok");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-black/10 bg-[#f4f6f9]/95 px-4 pb-3 pt-1 backdrop-blur lg:top-0 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="mr-auto min-w-0">
            <Link href="/admin/translate/" className="text-[13px] text-[#888] hover:text-primary">
              ← Translation Center
            </Link>
            <h1 className="flex items-center gap-2 truncate text-[20px] font-semibold">
              <span className="truncate">{ws.title}</span>
              <span className={`admin-badge shrink-0 ${status.cls}`}>{status.label}</span>
            </h1>
          </div>
          <span className="text-[12px] text-[#888]" aria-live="polite">
            {save.state === "saving"
              ? "Saving…"
              : save.state === "unsaved"
                ? "Unsaved changes"
                : save.state === "error"
                  ? ""
                  : `Draft saved ${save.at?.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) ?? ""}`}
          </span>
          {ws.previewUrl && (
            <a
              href={ws.previewUrl}
              target="_blank"
              onClick={() => void saveNow()}
              className="admin-btn-secondary"
              title="Opens the Japanese page with your draft, including unpublished changes"
            >
              <Icon name="eye" className="size-4" /> Preview
            </a>
          )}
          <button type="button" onClick={publish} disabled={publishing || save.stale} className="admin-btn">
            {publishing ? "Publishing…" : "Publish Japanese"}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="flex min-w-[200px] flex-1 items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Translated">
              <div className="h-full rounded-full bg-green-500 transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[13px] font-semibold tabular-nums text-[#444]">
              {counts.ok} / {ws.rows.length}
            </span>
          </div>
          {(["empty", "auto", "outdated"] as const).map(
            (k) =>
              counts[k] > 0 && (
                <button
                  key={k}
                  type="button"
                  onClick={() => focusRow(states.findIndex((s) => s === k))}
                  className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-[#555] ring-1 ring-black/10 hover:ring-primary"
                >
                  <span className={`size-2 rounded-full ${ROW_STYLE[k].dot}`} />
                  {counts[k]} {k === "empty" ? "to translate" : k === "auto" ? "to check" : "changed"}
                </button>
              ),
          )}
          <label className="flex items-center gap-2 text-[13px] text-[#555]">
            <input type="checkbox" checked={onlyTodo} onChange={(e) => setOnlyTodo(e.target.checked)} className="size-4 accent-[var(--color-primary)]" />
            Only rows needing work
          </label>
        </div>
      </div>

      {save.state === "error" && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md bg-red-50 px-4 py-2.5 text-[13px] text-red-700 ring-1 ring-red-200">
          <span className="flex-1">{save.error}</span>
          {save.stale ? (
            <button className="admin-btn-secondary" onClick={() => location.reload()}>
              Reload
            </button>
          ) : (
            <button className="admin-btn-secondary" onClick={() => void saveNow()}>
              Try again
            </button>
          )}
        </div>
      )}

      {ws.dirty && save.state !== "error" && counts.ok === ws.rows.length && (
        <p className="rounded-md bg-primary/5 px-4 py-2.5 text-[13px] text-[#335] ring-1 ring-primary/20">
          Everything is translated. The website still shows the previous Japanese until you click <strong>Publish Japanese</strong>.
        </p>
      )}

      {/* Column headings (desktop) */}
      <div className="hidden grid-cols-[32px_1fr_1fr] gap-4 px-1 text-[12px] font-semibold uppercase tracking-wide text-[#999] md:grid">
        <span />
        <span>English (original)</span>
        <span>日本語 (Japanese)</span>
      </div>

      <ol className="space-y-2">
        {visible.map(({ r, i }) => {
          const e = edits[i];
          const st = states[i];
          const terms = termsIn(htmlText(r.src), ws.glossary);
          const warn = warnings(r, e);
          return (
            <li key={i} id={`row-${i}`} className="scroll-mt-40">
              {r.first && <h2 className="mb-1 mt-4 text-[13px] font-semibold text-[#666]">{r.label}</h2>}
              <div
                onFocusCapture={() => setActive(i)}
                className={`grid gap-3 rounded-lg bg-white p-3 ring-1 transition-shadow md:grid-cols-[32px_1fr_1fr] md:gap-4 ${
                  active === i ? "ring-2 ring-primary/60" : st === "outdated" ? "ring-orange-300" : st === "auto" ? "ring-amber-200" : "ring-black/5"
                }`}
              >
                <div className="flex items-center gap-2 md:flex-col md:items-center md:pt-1">
                  <span className="text-[12px] font-semibold tabular-nums text-[#999]">{i + 1}</span>
                  <span className={`size-2.5 rounded-full ${ROW_STYLE[st].dot}`} title={ROW_STYLE[st].label} />
                  <span className="text-[12px] text-[#888] md:hidden">{ROW_STYLE[st].label}</span>
                </div>

                {/* English */}
                <div lang="en" className="min-w-0 space-y-2">
                  {st === "outdated" && r.oldSrc !== undefined ? (
                    <div className="rounded-md bg-orange-50 p-2.5 ring-1 ring-orange-200">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-orange-700">The English was changed</p>
                      <Diff before={htmlText(r.oldSrc)} after={htmlText(r.src)} />
                    </div>
                  ) : r.kind === "html" ? (
                    <div className="prose-seats text-[14px] leading-relaxed text-[#333] [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: r.src }} />
                  ) : (
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#333]">{r.src}</p>
                  )}
                  {terms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {terms.map((t) => (
                        <span key={t.id} title={t.note || undefined} className="rounded bg-violet-50 px-1.5 py-0.5 text-[11px] text-violet-700">
                          {t.termEn} → <span lang="ja">{t.termJa}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Japanese */}
                <div className="min-w-0 space-y-1.5">
                  {r.kind === "html" ? (
                    <HtmlRowEditor id={`ja-${i}`} value={e.target} onChange={(v) => update(i, { target: v, auto: false, outdated: false })} onNext={() => goNext(i)} />
                  ) : (
                    <TextRowEditor
                      id={`ja-${i}`}
                      multiline={r.multiline}
                      value={e.target}
                      onChange={(v) => update(i, { target: v, auto: false, outdated: false })}
                      onNext={() => goNext(i)}
                    />
                  )}

                  {st === "auto" && (
                    <p className="flex flex-wrap items-center gap-2 text-[12px] text-amber-800">
                      <span>Filled from translation memory (same English used before). Check it, then</span>
                      <button type="button" className="rounded bg-amber-100 px-2 py-0.5 font-semibold hover:bg-amber-200" onClick={() => update(i, { auto: false })}>
                        ✓ Accept
                      </button>
                    </p>
                  )}
                  {st === "outdated" && (
                    <p className="flex flex-wrap items-center gap-2 text-[12px] text-orange-800">
                      <span>Update the Japanese to match, or if it still fits:</span>
                      <button type="button" className="rounded bg-orange-100 px-2 py-0.5 font-semibold hover:bg-orange-200" onClick={() => update(i, { outdated: false })}>
                        ✓ Keep translation
                      </button>
                    </p>
                  )}
                  {st === "empty" && r.suggestion && (
                    <div className="rounded-md bg-sky-50 p-2.5 text-[12px] ring-1 ring-sky-200">
                      <p className="mb-1 font-semibold text-sky-800">Similar sentence translated before ({Math.round(r.suggestion.score * 100)}% match)</p>
                      <p className="mb-1 text-[#666]">
                        <Diff before={r.suggestion.sourceText} after={htmlText(r.src)} />
                      </p>
                      <p lang="ja" className="mb-1.5 text-[#333]" dangerouslySetInnerHTML={{ __html: r.suggestion.target }} />
                      <button type="button" className="rounded bg-sky-100 px-2 py-0.5 font-semibold text-sky-800 hover:bg-sky-200" onClick={() => update(i, { target: r.suggestion!.target, auto: false })}>
                        Use and edit
                      </button>
                    </div>
                  )}
                  {warn.map((w) => (
                    <p key={w} className="text-[12px] text-amber-700">
                      ⚠ {w}
                    </p>
                  ))}
                  <div className="flex gap-3 text-[12px]">
                    <button type="button" className="text-[#888] hover:text-primary" onClick={() => update(i, { target: r.src, auto: false, outdated: false })} title="For names, numbers and links that stay the same">
                      Copy English
                    </button>
                    <button type="button" className="text-[#888] hover:text-primary" onClick={() => goNext(i)}>
                      Next ↓ <span className="text-[#bbb]">(Ctrl+Enter)</span>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {onlyTodo && visible.length === 0 && <p className="admin-card p-10 text-center text-[#888]">Nothing left to do here. 🎉</p>}
    </div>
  );
}

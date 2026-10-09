"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { savePageAction } from "@/app/admin/page-actions";
import { getAt, humanize, isImageUrl, isPair, isParas, matchPath, newItem, setAt, type Path } from "@/lib/pages/shape";
import MediaPicker, { type Picked } from "../media/MediaPicker";
import { toast } from "../ui/toast";
import { useUnsavedChanges } from "../ui/useUnsavedChanges";

type Ctx = {
  set: (path: Path, v: unknown) => void;
  get: (path: Path) => unknown;
  pick: (onPick: (p: Picked) => void) => void;
  label: (path: Path) => string;
  isFixed: (path: Path) => boolean;
  /** The original list at this path (any item index), for adding to a list that is now empty */
  originalList: (path: Path) => unknown[];
};
const EditorCtx = createContext<Ctx>(null!);

/** Keys never shown (layout data), and image size keys filled in automatically. */
const HIDDEN = new Set(["icon"]);
const SIZE = new Set(["width", "height"]);

const long = (s: string) => s.length > 90 || s.includes("\n");

function Lang({ l }: { l: "en" | "ja" }) {
  return <span className="rounded bg-[#eef6fc] px-1.5 py-0.5 text-[10px] font-bold text-primary">{l.toUpperCase()}</span>;
}

function Pair({ path, v }: { path: Path; v: { en: string; ja: string } }) {
  const { set, label } = useContext(EditorCtx);
  const multi = long(v.en) || long(v.ja);
  return (
    <fieldset className="min-w-0">
      <legend className="admin-label">{label(path)}</legend>
      <div className="grid gap-2 md:grid-cols-2">
        {(["en", "ja"] as const).map((l) => (
          <label key={l} className="flex min-w-0 items-start gap-2">
            <span className="pt-2.5">
              <Lang l={l} />
            </span>
            {multi ? (
              <textarea lang={l} value={v[l]} onChange={(e) => set([...path, l], e.target.value)} rows={3} className="admin-input min-w-0 flex-1 [field-sizing:content]" />
            ) : (
              <input lang={l} value={v[l]} onChange={(e) => set([...path, l], e.target.value)} className="admin-input min-w-0 flex-1" />
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Paragraph lists: one textarea per language, paragraphs separated by an empty line (fixed count → one box each). */
function Paras({ path, v }: { path: Path; v: { en: string[]; ja: string[] } }) {
  const { set, label, isFixed } = useContext(EditorCtx);
  const fixed = isFixed(path);
  return (
    <fieldset className="min-w-0">
      <legend className="admin-label">
        {label(path)} <span className="font-normal text-[#999]">{fixed ? `· exactly ${v.en.length} paragraphs` : "· separate paragraphs with an empty line"}</span>
      </legend>
      <div className="grid gap-2 md:grid-cols-2">
        {(["en", "ja"] as const).map((l) => (
          <div key={l} className="flex min-w-0 items-start gap-2">
            <span className="pt-2.5">
              <Lang l={l} />
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              {fixed ? (
                v[l].map((p, i) => (
                  <textarea key={i} lang={l} value={p} rows={3} onChange={(e) => set([...path, l, i], e.target.value)} className="admin-input [field-sizing:content]" aria-label={`Paragraph ${i + 1}`} />
                ))
              ) : (
                <textarea
                  lang={l}
                  rows={6}
                  value={v[l].join("\n\n")}
                  onChange={(e) =>
                    set(
                      [...path, l],
                      e.target.value.split(/\n\s*\n/).map((x) => x.trim()),
                    )
                  }
                  onBlur={(e) =>
                    set(
                      [...path, l],
                      e.target.value
                        .split(/\n\s*\n/)
                        .map((x) => x.trim())
                        .filter(Boolean),
                    )
                  }
                  className="admin-input [field-sizing:content]"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

function ImageThumb({ src, onPick, onRemove, small }: { src: string; onPick: () => void; onRemove?: () => void; small?: boolean }) {
  return (
    <div className={small ? "w-[120px]" : "w-[180px]"}>
      <button type="button" onClick={onPick} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-md bg-black/5 ring-1 ring-black/10 hover:ring-primary" title="Change image">
        {/* eslint-disable-next-line @next/next/no-img-element -- editor thumbnail */}
        {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <span className="text-[12px] text-[#999]">Choose image</span>}
        <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[11px] text-white opacity-0 group-hover:opacity-100">Change</span>
      </button>
      {onRemove && (
        <button type="button" onClick={onRemove} className="mt-1 text-[12px] text-red-600 hover:underline">
          Remove
        </button>
      )}
    </div>
  );
}

/** An image held as a string, whose parent may carry width/height that must follow it. */
function ImageString({ path, v }: { path: Path; v: string }) {
  const { set, get, pick, label } = useContext(EditorCtx);
  const parentPath = path.slice(0, -1);
  return (
    <div>
      <span className="admin-label">{label(path)}</span>
      <ImageThumb
        src={v}
        onPick={() =>
          pick((p) => {
            const parent = get(parentPath) as Record<string, unknown> | undefined;
            let next = setAt(parent, [path[path.length - 1]], p.url) as Record<string, unknown>;
            if (parent && typeof parent.width === "number" && typeof parent.height === "number") next = { ...next, width: p.width, height: p.height };
            set(parentPath, next);
          })
        }
      />
    </div>
  );
}

function summary(item: unknown): string {
  if (typeof item === "string") return item;
  if (isPair(item)) return item.en;
  if (item && typeof item === "object") {
    for (const k of ["heading", "title", "label", "year", "name", "caption", "text"]) {
      const v = (item as Record<string, unknown>)[k];
      if (typeof v === "string" && v) return v;
      if (isPair(v) && v.en) return v.en;
    }
  }
  return "";
}

/** First image inside a list item, shown in its collapsed row. */
function thumbOf(item: unknown): string | null {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
    if (isImageUrl(k, v)) return v as string;
    if (Array.isArray(v) && typeof v[0] === "string" && isImageUrl(0, v[0])) return v[0];
  }
  return null;
}

function ListField({ path, v }: { path: Path; v: unknown[] }) {
  const { set, label, isFixed, pick, originalList } = useContext(EditorCtx);
  // A just-added item opens and scrolls into view
  const [added, setAdded] = useState<number | null>(null);
  const addedRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (added !== null) addedRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [added]);
  const fixed = isFixed(path) || (v.length > 0 && v.every(Array.isArray));
  const move = (i: number, d: number) => {
    const next = [...v];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set(path, next);
  };
  const remove = (i: number) => set(path, v.filter((_, j) => j !== i));

  // Image galleries
  if (v.length && v.every((x) => typeof x === "string") && v.every((x, i) => isImageUrl(i, x))) {
    return (
      <fieldset>
        <legend className="admin-label">
          {label(path)} <span className="font-normal text-[#999]">({v.length} images)</span>
        </legend>
        <div className="flex flex-wrap gap-3">
          {(v as string[]).map((src, i) => (
            <ImageThumb key={i} small src={src} onPick={() => pick((p) => set([...path, i], p.url))} onRemove={fixed ? undefined : () => remove(i)} />
          ))}
          {!fixed && (
            <button type="button" onClick={() => pick((p) => set(path, [...v, p.url]))} className="flex aspect-[4/3] w-[120px] items-center justify-center rounded-md border-2 border-dashed border-black/15 text-[13px] text-[#888] hover:border-primary">
              + Add image
            </button>
          )}
        </div>
      </fieldset>
    );
  }

  return (
    <fieldset className="min-w-0">
      <legend className="admin-label">
        {label(path)} <span className="font-normal text-[#999]">({v.length})</span>
      </legend>
      <ol className="space-y-2">
        {v.map((item, i) => (
          <li key={i}>
            <details
              ref={i === added ? addedRef : undefined}
              className={`group rounded-lg bg-[#fafbfc] ring-1 open:bg-white ${i === added ? "ring-2 ring-primary/50" : "ring-black/10"}`}
              open={v.length <= 2 || i === added || undefined}
            >
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-[13px]">
                <span className="text-[#999] group-open:rotate-90">▸</span>
                <span className="font-semibold text-[#555]">{v.every(Array.isArray) ? `Column ${i + 1}` : `#${i + 1}`}</span>
                {thumbOf(item) && (
                  // eslint-disable-next-line @next/next/no-img-element -- list item thumbnail
                  <img src={thumbOf(item)!} alt="" className="h-8 w-12 shrink-0 rounded object-cover" />
                )}
                <span className="min-w-0 flex-1 truncate text-[#333]">{summary(item)}</span>
                {!fixed && (
                  <span className="flex gap-1" onClick={(e) => e.preventDefault()}>
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="admin-btn-secondary !px-2 !py-0.5 text-[12px] disabled:opacity-30" aria-label="Move up">
                      ↑
                    </button>
                    <button type="button" disabled={i === v.length - 1} onClick={() => move(i, 1)} className="admin-btn-secondary !px-2 !py-0.5 text-[12px] disabled:opacity-30" aria-label="Move down">
                      ↓
                    </button>
                    <button type="button" onClick={() => remove(i)} className="admin-btn-secondary !px-2 !py-0.5 text-[12px] !text-red-600">
                      Remove
                    </button>
                  </span>
                )}
              </summary>
              <div className="space-y-3 border-t border-black/5 p-3">
                <Node path={[...path, i]} v={item} itemRoot />
              </div>
            </details>
          </li>
        ))}
      </ol>
      {!fixed && (
        <button
          type="button"
          onClick={() => {
            set(path, [...v, newItem(v.length ? v : originalList(path))]);
            setAdded(v.length);
          }}
          className="admin-btn-secondary mt-2 !py-1 text-[13px]"
        >
          + Add {label(path).toLowerCase().replace(/s$/, "") || "item"}
        </button>
      )}
    </fieldset>
  );
}

function Node({ path, v, itemRoot }: { path: Path; v: unknown; itemRoot?: boolean }) {
  const { set, label, get } = useContext(EditorCtx);
  const key = path[path.length - 1];
  if (typeof key === "string" && HIDDEN.has(key)) return null;

  if (isPair(v)) return <Pair path={path} v={v} />;
  if (isParas(v)) return <Paras path={path} v={v} />;
  if (Array.isArray(v)) return <ListField path={path} v={v} />;
  if (typeof v === "boolean")
    return (
      <label className="flex items-center gap-2 text-[14px]">
        <input type="checkbox" checked={v} onChange={(e) => set(path, e.target.checked)} className="size-4 accent-[var(--color-primary)]" />
        {label(path)}
      </label>
    );
  if (typeof v === "number") {
    const parent = get(path.slice(0, -1)) as Record<string, unknown> | undefined;
    // Image sizes follow the chosen image
    if (typeof key === "string" && SIZE.has(key) && parent && Object.entries(parent).some(([k, x]) => isImageUrl(k, x))) return null;
    return (
      <label className="block max-w-[200px]">
        <span className="admin-label">{label(path)}</span>
        <input type="number" value={v} onChange={(e) => set(path, Number(e.target.value))} className="admin-input" />
      </label>
    );
  }
  if (typeof v === "string") {
    if (isImageUrl(key ?? "", v)) return <ImageString path={path} v={v} />;
    const isLink = typeof key === "string" && /^(href|url|map|embed|link)$/i.test(key);
    return (
      <label className="block min-w-0">
        <span className="admin-label">{label(path)}</span>
        {long(v) && !isLink ? (
          <textarea value={v} onChange={(e) => set(path, e.target.value)} rows={3} className="admin-input [field-sizing:content]" />
        ) : (
          <input value={v} onChange={(e) => set(path, e.target.value)} className={`admin-input ${isLink ? "font-mono text-[13px]" : ""}`} placeholder={isLink ? "https://…" : undefined} />
        )}
      </label>
    );
  }
  if (v && typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>);
    const inner = (
      <div className="space-y-3">
        {entries.map(([k, x]) => (
          <Node key={k} path={[...path, k]} v={x} />
        ))}
      </div>
    );
    if (itemRoot) return inner;
    return (
      <fieldset className="min-w-0 rounded-lg p-3 ring-1 ring-black/10">
        <legend className="px-1 text-[13px] font-semibold text-[#555]">{label(path)}</legend>
        {inner}
      </fieldset>
    );
  }
  return null;
}

export default function PageEditor({
  pageKey,
  title,
  path,
  initial,
  defaults,
  fixed,
  labels,
}: {
  pageKey: string;
  title: string;
  path: string;
  initial: Record<string, unknown>;
  defaults: Record<string, unknown>;
  fixed: string[];
  labels: Record<string, string>;
}) {
  const [value, setValue] = useState(initial);
  const [initialJson] = useState(() => JSON.stringify(initial));
  const [saved, setSaved] = useState(initialJson);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<((p: Picked) => void) | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedChanges(formRef);
  const json = JSON.stringify(value);
  const dirty = json !== saved;

  const save = useCallback(async () => {
    setSaving(true);
    const r = await savePageAction(pageKey, json).catch(() => ({ ok: false as const, error: "Couldn't save. Check your connection." }));
    setSaving(false);
    if (r.ok) {
      setSaved(json);
      toast("Saved. The page is updated on the website.");
    } else toast(r.error, "error");
  }, [json, pageKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, save]);

  const ctx = useMemo<Ctx>(
    () => ({
      set: (p, v) => setValue((cur) => setAt(cur, p, v)),
      get: (p) => getAt(value, p),
      pick: (fn) => setPicker(() => fn),
      label: (p) => labels[p.join(".")] ?? labels[String(p[p.length - 1])] ?? (typeof p[p.length - 1] === "number" ? `#${Number(p[p.length - 1]) + 1}` : humanize(String(p[p.length - 1]))),
      isFixed: (p) => fixed.some((f) => matchPath(f, p)),
      originalList: (p) => {
        // Follow the path through the original content, using any item that has the next key
        let nodes: unknown[] = [defaults];
        for (const k of p) {
          nodes = nodes.flatMap((n) => (typeof k === "number" ? (Array.isArray(n) ? n : []) : n && typeof n === "object" && k in n ? [(n as Record<string, unknown>)[k]] : []));
        }
        return nodes.find((n): n is unknown[] => Array.isArray(n) && n.length > 0) ?? [];
      },
    }),
    [value, labels, fixed, defaults],
  );

  const sections = Object.entries(value);
  return (
    <EditorCtx.Provider value={ctx}>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
        className="space-y-4"
      >
        {/* For the unsaved-changes guard: equals the original until there are unsaved edits */}
        <input type="hidden" name="content" value={dirty ? json : initialJson} />
        <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-black/10 bg-[#f4f6f9]/95 px-4 py-3 backdrop-blur lg:top-0 lg:-mx-8 lg:px-8">
          <h1 className="mr-auto truncate text-[20px] font-semibold">{title}</h1>
          <span className="text-[12px] text-[#888]">{saving ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}</span>
          <a href={path} target="_blank" className="admin-btn-secondary">
            View page ↗
          </a>
          <button type="submit" disabled={!dirty || saving} className="admin-btn min-w-[120px]">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {sections.map(([k, v], i) => (
          <details key={k} open={i === 0 || sections.length <= 2} className="admin-card group">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 text-[15px] font-semibold">
              <span className="text-[#999] transition-transform group-open:rotate-90">▸</span>
              {ctx.label([k])}
            </summary>
            <div className="space-y-4 border-t border-black/5 p-5">
              <Node path={[k]} v={v} itemRoot={!!v && typeof v === "object" && !Array.isArray(v) && !isPair(v) && !isParas(v)} />
            </div>
          </details>
        ))}
      </form>
      <MediaPicker
        open={!!picker}
        onClose={() => setPicker(null)}
        onPick={(p) => {
          picker?.(p);
          setPicker(null);
        }}
      />
    </EditorCtx.Provider>
  );
}

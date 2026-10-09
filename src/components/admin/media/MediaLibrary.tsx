"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteMediaAction, saveAltAction } from "@/app/admin/media-actions";
import type { MediaItem, MediaUse } from "@/lib/media-library";
import { confirmDialog } from "../ui/confirm";
import { toast } from "../ui/toast";
import { uploadImageWithSize } from "../upload";
import MediaGrid, { filterMedia, fmtSize, type MediaFilter } from "./MediaGrid";

type Filter = MediaFilter | "unused";

export default function MediaLibrary({ items, usage }: { items: MediaItem[]; usage: Record<string, MediaUse[]> }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [drag, setDrag] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const uses = (m: MediaItem) => usage[m.url] ?? [];
  const shown = filter === "unused" ? filterMedia(items, q, "upload").filter((m) => !uses(m).length) : filterMedia(items, q, filter);
  const counts = {
    all: items.length,
    upload: items.filter((m) => m.source === "upload").length,
    site: items.filter((m) => m.source === "site").length,
    unused: items.filter((m) => m.source === "upload" && !uses(m).length).length,
  };

  const select = (m: MediaItem) => {
    setSel(m);
    setAlt(m.alt);
  };

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setUploading({ done: 0, total: list.length });
    let failed = 0;
    for (const [i, f] of list.entries()) {
      try {
        await uploadImageWithSize(f);
      } catch (e) {
        failed++;
        toast(`${f.name}: ${e instanceof Error ? e.message : "upload failed"}`, "error");
      }
      setUploading({ done: i + 1, total: list.length });
    }
    setUploading(null);
    if (fileRef.current) fileRef.current.value = "";
    if (list.length - failed) toast(`${list.length - failed} image${list.length - failed > 1 ? "s" : ""} uploaded.`);
    setFilter("upload");
    router.refresh();
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Link copied.", "info");
    } catch {
      toast("Couldn't copy — select the link and copy it manually.", "error");
    }
  };

  const tabs: [Filter, string][] = [
    ["all", "All"],
    ["upload", "Uploaded"],
    ["site", "Website images"],
    ["unused", "Unused uploads"],
  ];

  return (
    <div
      className="relative grid gap-4 lg:grid-cols-[1fr_300px]"
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        void upload(e.dataTransfer.files);
      }}
    >
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name or description…" className="admin-input !w-72 max-w-full" aria-label="Search images" />
          <div className="flex flex-wrap rounded-lg bg-white p-1 ring-1 ring-black/5 text-[13px]">
            {tabs.map(([k, l]) => (
              <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-md px-3 py-1.5 font-semibold ${filter === k ? "bg-primary text-white" : "text-[#555] hover:bg-black/5"}`}>
                {l} <span className={filter === k ? "text-white/80" : "text-[#999]"}>{counts[k]}</span>
              </button>
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => void upload(e.target.files)} />
          <button type="button" className="admin-btn ml-auto" disabled={!!uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? `Uploading ${uploading.done}/${uploading.total}…` : "↑ Upload images"}
          </button>
        </div>
        <p className="text-[12px] text-[#999]">Tip: drag photos from your computer anywhere onto this page to upload several at once. Large photos are resized automatically.</p>
        <div className="admin-card p-3">
          {shown.length ? (
            <MediaGrid
              items={shown}
              selected={sel?.url}
              onSelect={select}
              badge={(m) =>
                m.source === "upload" &&
                !uses(m).length && <span className="absolute left-1.5 top-1.5 rounded bg-amber-400 px-1.5 text-[10px] font-bold text-[#222]">Unused</span>
              }
            />
          ) : (
            <p className="py-12 text-center text-[#999]">{filter === "unused" ? "No unused uploads. 👍" : "No images match."}</p>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        {sel ? (
          <div className="admin-card space-y-3 p-4">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-[repeating-conic-gradient(#f1f3f5_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary image */}
              <img src={sel.url} alt={sel.alt} className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <p className="break-all text-[14px] font-semibold text-[#222]">{sel.filename}</p>
              <p className="text-[12px] text-[#888]">
                {sel.width}×{sel.height} px · {fmtSize(sel.size)}
                {sel.source === "upload" ? ` · uploaded by ${sel.uploadedBy || "—"}${sel.createdAt ? `, ${new Date(sel.createdAt).toLocaleDateString("en-GB")}` : ""}` : " · part of the website"}
              </p>
            </div>
            <div className="flex gap-2">
              <input readOnly value={sel.url} className="admin-input min-w-0 flex-1 font-mono text-[11px]" aria-label="Image link" onFocus={(e) => e.target.select()} />
              <button type="button" className="admin-btn-secondary !px-3 text-[13px]" onClick={() => copy(new URL(sel.url, location.origin).href)}>
                Copy
              </button>
            </div>
            {sel.source === "upload" && sel.id !== null && (
              <label className="block">
                <span className="admin-label">Description (alt text)</span>
                <textarea rows={2} value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="What is in the photo? Read by screen readers and Google." className="admin-input text-[13px]" />
                {alt !== sel.alt && (
                  <button
                    type="button"
                    disabled={pending}
                    className="admin-btn mt-2 !py-1.5 text-[13px]"
                    onClick={() =>
                      start(async () => {
                        await saveAltAction(sel.id!, alt);
                        setSel({ ...sel, alt });
                        toast("Description saved.");
                      })
                    }
                  >
                    Save description
                  </button>
                )}
              </label>
            )}
            <div>
              <p className="admin-label">Used in</p>
              {uses(sel).length ? (
                <ul className="space-y-1 text-[13px]">
                  {uses(sel).map((u) => (
                    <li key={u.label}>
                      <Link href={u.href} className="text-primary hover:underline">
                        {u.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-[#999]">Not used anywhere.</p>
              )}
            </div>
            {sel.source === "upload" && sel.id !== null && (
              <button
                type="button"
                disabled={pending || uses(sel).length > 0}
                title={uses(sel).length ? "Remove the image from the places above first" : undefined}
                className="admin-btn-secondary w-full justify-center !text-red-600 hover:!bg-red-50 disabled:opacity-40"
                onClick={async () => {
                  if (!(await confirmDialog({ title: "Delete this image?", message: `${sel.filename} will be permanently deleted.`, confirmLabel: "Delete", danger: true }))) return;
                  start(async () => {
                    const r = await deleteMediaAction(sel.id!);
                    if (r.ok) {
                      toast("Image deleted.");
                      setSel(null);
                    } else toast(r.error, "error");
                  });
                }}
              >
                {uses(sel).length ? "In use — can't delete" : "Delete image"}
              </button>
            )}
          </div>
        ) : (
          <div className="admin-card p-6 text-center text-[13px] text-[#999]">Select an image to see its details, where it is used, and to copy its link.</div>
        )}
      </aside>

      {drag && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-primary/10 text-[22px] font-semibold text-primary ring-4 ring-inset ring-primary">
          Drop to upload
        </div>
      )}
    </div>
  );
}

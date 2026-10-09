"use client";

import { useEffect, useRef, useState } from "react";
import { pickerMediaAction } from "@/app/admin/media-actions";
import type { MediaItem } from "@/lib/media-library";
import { uploadImageWithSize } from "../upload";
import MediaGrid, { filterMedia, fmtSize, type MediaFilter } from "./MediaGrid";

export type Picked = { url: string; width: number; height: number; alt: string };

/**
 * Modal to choose an image from the Media library or upload a new one.
 * Uploading selects the new image straight away.
 */
export default function MediaPicker({ open, onClose, onPick, title = "Choose an image" }: { open: boolean; onClose: () => void; onPick: (p: Picked) => void; title?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      pickerMediaAction().then(setItems, () => setError("Couldn't load the library."));
    }
    if (!open && d.open) d.close();
  }, [open]);

  const pick = (m: { url: string; width: number; height: number; alt: string }) => {
    onPick(m);
    onClose();
  };

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const up = await uploadImageWithSize(files[0]);
      pick({ ...up, alt: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const shown = items ? filterMedia(items, q, filter) : [];

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="admin-dialog m-auto h-[min(760px,calc(100%-32px))] w-[min(1000px,calc(100%-32px))] overflow-hidden rounded-xl bg-white p-0 shadow-2xl backdrop:bg-black/40"
    >
      {open && (
        <div
          className="relative flex h-full flex-col"
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
          <header className="flex flex-wrap items-center gap-2 border-b border-black/10 px-5 py-3">
            <h2 className="mr-auto text-[16px] font-semibold">{title}</h2>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void upload(e.target.files)} />
            <button type="button" className="admin-btn" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? "Uploading…" : "↑ Upload new"}
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-2 text-[18px] leading-none hover:bg-black/5">
              ✕
            </button>
          </header>
          <div className="flex flex-wrap items-center gap-2 border-b border-black/5 px-5 py-2.5">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name…" className="admin-input !w-60" aria-label="Search images" autoFocus />
            <div className="flex rounded-md bg-black/5 p-0.5 text-[13px]">
              {(
                [
                  ["all", "All"],
                  ["upload", "Uploaded"],
                  ["site", "Website images"],
                ] as const
              ).map(([k, l]) => (
                <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded px-2.5 py-1 font-semibold ${filter === k ? "bg-white shadow-sm" : "text-[#666]"}`}>
                  {l}
                </button>
              ))}
            </div>
            <span className="ml-auto text-[12px] text-[#999]">{items ? `${shown.length} images` : "Loading…"} · or drop a file here</span>
          </div>
          {error && <p className="bg-red-50 px-5 py-2 text-[13px] text-red-700">{error}</p>}
          <div className="flex-1 overflow-y-auto p-5">
            {items && !shown.length ? <p className="py-10 text-center text-[#999]">No images match.</p> : <MediaGrid items={shown} selected={sel?.url} onSelect={setSel} onOpen={pick} />}
          </div>
          <footer className="flex flex-wrap items-center gap-3 border-t border-black/10 bg-[#fafbfc] px-5 py-3">
            <span className="mr-auto min-w-0 truncate text-[13px] text-[#666]">
              {sel ? (
                <>
                  <strong className="text-[#333]">{sel.filename}</strong> · {sel.width}×{sel.height} · {fmtSize(sel.size)}
                </>
              ) : (
                "Click an image to select it (double-click to use it right away)."
              )}
            </span>
            <button type="button" className="admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="admin-btn" disabled={!sel} onClick={() => sel && pick(sel)}>
              Use this image
            </button>
          </footer>
          {drag && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/10 text-[18px] font-semibold text-primary ring-4 ring-inset ring-primary">
              Drop to upload
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

"use client";

import { useRef, useState } from "react";
import { uploadImageWithSize } from "./upload";
import MediaPicker, { type Picked } from "./media/MediaPicker";

/**
 * Image input: drop/upload a new image or choose one from the Media library.
 * The URL is submitted as `name`; `onChange` also receives the image size.
 */
export default function ImageField({
  name,
  defaultValue,
  onChange,
  aspect = "aspect-[4/3]",
  fit = "cover",
}: {
  name: string;
  defaultValue: string;
  onChange?: (p: Picked | null) => void;
  aspect?: string;
  fit?: "cover" | "contain";
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const set = (p: Picked | null) => {
    setUrl(p?.url ?? "");
    onChange?.(p);
  };

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      set({ ...(await uploadImageWithSize(file)), alt: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <div
        role="button"
        tabIndex={0}
        onClick={() => setPicking(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPicking(true)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0]);
        }}
        className={`flex ${aspect} cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-black/15 bg-[#fafafa] text-center text-[13px] text-[#888] hover:border-primary`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded/blob URLs preview
          <img src={url} alt="" className={`h-full w-full ${fit === "contain" ? "object-contain p-2" : "object-cover"}`} />
        ) : (
          <span className="px-4">{busy ? "Uploading…" : "Click to choose, or drop an image here"}</span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="admin-btn-secondary !py-1 text-[13px]" onClick={() => setPicking(true)} disabled={busy}>
          Media library
        </button>
        <button type="button" className="admin-btn-secondary !py-1 text-[13px]" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? "Uploading…" : "Upload"}
        </button>
        {url && (
          <button type="button" className="admin-btn-secondary !py-1 text-[13px] !text-red-600" onClick={() => set(null)}>
            Remove
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-[12px] text-red-600">{error}</p>}
      <MediaPicker open={picking} onClose={() => setPicking(false)} onPick={set} />
    </div>
  );
}

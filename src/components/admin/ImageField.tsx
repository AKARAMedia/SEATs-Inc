"use client";

import { useRef, useState } from "react";
import { uploadImage } from "./upload";

export default function ImageField({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setUrl(await uploadImage(file));
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
        onClick={() => ref.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0]);
        }}
        className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-black/15 bg-[#fafafa] text-center text-[13px] text-[#888] hover:border-primary"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded/blob URLs preview
          <img src={url} alt="Featured" className="h-full w-full object-cover" />
        ) : (
          <span className="px-4">{busy ? "Uploading…" : "Click or drop an image here"}</span>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" className="admin-btn-secondary !py-1 text-[13px]" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? "Uploading…" : url ? "Replace" : "Upload"}
        </button>
        {url && (
          <button type="button" className="admin-btn-secondary !py-1 text-[13px] !text-red-600" onClick={() => setUrl("")}>
            Remove
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

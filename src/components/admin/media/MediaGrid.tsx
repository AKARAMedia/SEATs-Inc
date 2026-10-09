"use client";

import type { MediaItem } from "@/lib/media-library";

export type MediaFilter = "all" | "upload" | "site";

export function filterMedia(items: MediaItem[], q: string, filter: MediaFilter) {
  const needle = q.trim().toLowerCase();
  return items.filter((m) => (filter === "all" || m.source === filter) && (!needle || `${m.filename} ${m.alt} ${m.url}`.toLowerCase().includes(needle)));
}

export function fmtSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Square thumbnails; the selected one is outlined. Lazy-loads images as they scroll in. */
export default function MediaGrid({
  items,
  selected,
  onSelect,
  onOpen,
  badge,
}: {
  items: MediaItem[];
  selected?: string | null;
  onSelect: (m: MediaItem) => void;
  /** Double-click / Enter */
  onOpen?: (m: MediaItem) => void;
  badge?: (m: MediaItem) => React.ReactNode;
}) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
      {items.map((m) => (
        <li key={m.url}>
          <button
            type="button"
            onClick={() => onSelect(m)}
            onDoubleClick={() => onOpen?.(m)}
            onKeyDown={(e) => e.key === "Enter" && onOpen && (e.preventDefault(), onOpen(m))}
            title={m.filename}
            aria-pressed={selected === m.url}
            className={`group relative block aspect-square w-full overflow-hidden rounded-lg bg-[repeating-conic-gradient(#f1f3f5_0_25%,#fff_0_50%)] bg-[length:16px_16px] ring-1 ${
              selected === m.url ? "ring-[3px] ring-primary" : "ring-black/10 hover:ring-primary/50"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails of arbitrary uploads */}
            <img src={m.url} alt={m.alt} loading="lazy" decoding="async" className="h-full w-full object-contain" />
            <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-4 text-left text-[11px] text-white opacity-0 group-hover:opacity-100">
              {m.filename}
            </span>
            {badge?.(m)}
          </button>
        </li>
      ))}
    </ul>
  );
}

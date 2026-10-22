import type { MediaItem } from "@/lib/media-library";

export const MEDIA_PAGE_SIZES = [24, 48, 96] as const;

export type MediaFilter = "all" | "upload" | "site";

export function filterMedia(items: MediaItem[], q: string, filter: MediaFilter) {
  const needle = q.trim().toLowerCase();
  return items.filter((m) => (filter === "all" || m.source === filter) && (!needle || `${m.filename} ${m.alt} ${m.url}`.toLowerCase().includes(needle)));
}

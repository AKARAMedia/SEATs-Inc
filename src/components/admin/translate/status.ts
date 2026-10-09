import type { ItemStatus } from "@/lib/translation/align";

export const STATUS_STYLE: Record<ItemStatus, { label: string; cls: string }> = {
  not_started: { label: "Not started", cls: "bg-red-50 text-red-700" },
  in_progress: { label: "In progress", cls: "bg-amber-50 text-amber-700" },
  needs_update: { label: "Needs update", cls: "bg-orange-100 text-orange-800" },
  done: { label: "Done", cls: "bg-green-50 text-green-700" },
};

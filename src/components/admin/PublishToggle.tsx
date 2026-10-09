"use client";

import { useOptimistic, useTransition } from "react";
import { togglePublishAction } from "@/app/admin/actions";
import { toast } from "./ui/toast";

/** Published/Draft pill that flips instantly and confirms with a toast. */
export default function PublishToggle({ id, published, scheduled, disabled }: { id: number; published: boolean; scheduled?: string; disabled?: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(published);
  const [pending, startTransition] = useTransition();
  // Published with a future date: shown as Scheduled (it goes live by itself)
  const isScheduled = optimistic && !!scheduled;
  const label = isScheduled ? "Scheduled" : optimistic ? "Published" : "Draft";
  const cls = `admin-badge ${isScheduled ? "bg-sky-50 text-sky-700" : optimistic ? "bg-primary/10 text-primary" : "bg-black/5 text-[#777]"}`;
  if (disabled) return <span className={cls} title={isScheduled ? `Goes live ${scheduled}` : undefined}>{label}</span>;
  return (
    <button
      type="button"
      disabled={pending}
      title={isScheduled ? `Goes live ${scheduled}. Click to make it a draft` : optimistic ? "Click to unpublish" : "Click to publish"}
      className={`${cls} hover:ring-1 hover:ring-current disabled:opacity-60`}
      onClick={() =>
        startTransition(async () => {
          const next = !optimistic;
          setOptimistic(next);
          const data = new FormData();
          data.set("id", String(id));
          data.set("published", String(next));
          try {
            await togglePublishAction(data);
            toast(next ? (scheduled ? `Post scheduled for ${scheduled}.` : "Post published.") : "Post moved to drafts.");
          } catch {
            toast("Couldn't update the post. Please try again.", "error");
          }
        })
      }
    >
      {isScheduled && "⏰ "}
      {label}
    </button>
  );
}

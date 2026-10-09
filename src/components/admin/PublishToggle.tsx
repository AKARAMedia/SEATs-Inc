"use client";

import { useOptimistic, useTransition } from "react";
import { togglePublishAction } from "@/app/admin/actions";
import { toast } from "./ui/toast";

/** Published/Draft pill that flips instantly and confirms with a toast. */
export default function PublishToggle({ id, published, disabled }: { id: number; published: boolean; disabled?: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(published);
  const [pending, startTransition] = useTransition();
  const cls = `admin-badge ${optimistic ? "bg-primary/10 text-primary" : "bg-black/5 text-[#777]"}`;
  if (disabled) return <span className={cls}>{optimistic ? "Published" : "Draft"}</span>;
  return (
    <button
      type="button"
      disabled={pending}
      title={optimistic ? "Click to unpublish" : "Click to publish"}
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
            toast(next ? "Post published." : "Post moved to drafts.");
          } catch {
            toast("Couldn't update the post. Please try again.", "error");
          }
        })
      }
    >
      {optimistic ? "Published" : "Draft"}
    </button>
  );
}

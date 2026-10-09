"use client";

import { startTransition, useActionState, useEffect, useState, useTransition } from "react";
import { deleteHomeItemAction, reorderHomeItemsAction, saveHomeItemAction, setHomeItemVisibleAction } from "@/app/admin/home-actions";
import ImageField from "../ImageField";
import { FormError } from "../ui/Field";
import SortableList, { MoveButtons } from "../ui/SortableList";
import { confirmDialog } from "../ui/confirm";
import { toast } from "../ui/toast";

export type ScheduledImage = {
  id: number;
  imageUrl: string;
  alt: string;
  visible: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  width?: number;
  height?: number;
  href?: string;
};
type Draft = Omit<ScheduledImage, "id" | "visible"> & { id?: number };

const local = (d: Date | null) => (d ? new Date(d.getTime() + 7 * 3600000).toISOString().slice(0, 16) : "");
const fmt = (d: Date) => d.toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Live / Scheduled / Ended / Hidden, from the visibility switch and the dates. */
function statusOf(it: ScheduledImage, now: number) {
  if (!it.visible) return { label: "Hidden", cls: "bg-black/5 text-[#777]" };
  if (it.startsAt && it.startsAt.getTime() > now) return { label: `Starts ${fmt(it.startsAt)}`, cls: "bg-sky-50 text-sky-700" };
  if (it.endsAt && it.endsAt.getTime() <= now) return { label: `Ended ${fmt(it.endsAt)}`, cls: "bg-black/5 text-[#777]" };
  return { label: it.endsAt ? `Live until ${fmt(it.endsAt)}` : "Live", cls: "bg-green-50 text-green-700" };
}

function ItemForm({ kind, initial, onDone }: { kind: "slide" | "banner"; initial: Draft; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveHomeItemAction, undefined);
  const [size, setSize] = useState({ width: initial.width ?? 0, height: initial.height ?? 0 });
  useEffect(() => {
    if (state?.ok) {
      toast(state.ok);
      onDone();
    }
  }, [state, onDone]);
  const banner = kind === "banner";
  return (
    <form
      className="admin-card space-y-4 p-5 ring-2 ring-primary/40"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      <h3 className="text-[15px] font-semibold">{initial.id ? "Edit" : "Add"} {banner ? "banner" : "slide"}</h3>
      <FormError state={state} />
      <input type="hidden" name="_kind" value={kind} />
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {banner && (
        <>
          <input type="hidden" name="width" value={size.width} />
          <input type="hidden" name="height" value={size.height} />
        </>
      )}
      <div className="grid gap-5 md:grid-cols-[320px_1fr]">
        <div>
          <span className="admin-label">Image</span>
          <ImageField
            name="imageUrl"
            defaultValue={initial.imageUrl}
            aspect={banner ? "aspect-[5/1]" : "aspect-video"}
            fit={banner ? "contain" : "cover"}
            onChange={(p) => setSize({ width: p?.width ?? 0, height: p?.height ?? 0 })}
          />
          <p className="mt-1 text-[12px] text-[#999]">
            {banner ? "Shown at its own size (up to 1024px wide) and full width on phones." : "Wide landscape photo, at least 1920×1000 px. The text is placed over the middle."}
          </p>
        </div>
        <div className="space-y-4">
          {banner && (
            <label className="block">
              <span className="admin-label">Link (optional)</span>
              <input name="href" defaultValue={initial.href} className="admin-input" placeholder="https://… or /contact/" />
            </label>
          )}
          <label className="block">
            <span className="admin-label">Description (alt text)</span>
            <input name="alt" defaultValue={initial.alt} className="admin-input" placeholder="What the image shows" />
          </label>
          <fieldset>
            <legend className="admin-label">Show only between (optional, Cambodia time)</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-[12px] text-[#888]">
                From
                <input type="datetime-local" name="startsAt" defaultValue={local(initial.startsAt)} className="admin-input" />
              </label>
              <label className="block text-[12px] text-[#888]">
                Until
                <input type="datetime-local" name="endsAt" defaultValue={local(initial.endsAt)} className="admin-input" />
              </label>
            </div>
            <p className="mt-1 text-[12px] text-[#999]">For campaigns and events: it appears and disappears by itself. Leave empty to always show.</p>
          </fieldset>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="admin-btn-secondary" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className="admin-btn">
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default function ScheduledImages({ kind, items, now }: { kind: "slide" | "banner"; items: ScheduledImage[]; now: number }) {
  const [editing, setEditing] = useState<Draft | null>(null);
  const [pending, start] = useTransition();
  const noun = kind === "banner" ? "banner" : "slide";
  const live = items.filter((i) => statusOf(i, now).label.startsWith("Live")).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="mr-auto text-[13px] text-[#888]">
          {live} of {items.length} {noun}s showing now{kind === "slide" && " · they change every 8 seconds"}.
        </p>
        {!editing && (
          <button type="button" className="admin-btn" onClick={() => setEditing({ imageUrl: "", alt: "", startsAt: null, endsAt: null, href: "", width: 0, height: 0 })}>
            + Add {noun}
          </button>
        )}
      </div>
      {editing && <ItemForm key={editing.id ?? "new"} kind={kind} initial={editing} onDone={() => setEditing(null)} />}

      <SortableList items={items} onReorder={(ids) => start(() => reorderHomeItemsAction(kind, ids).then(() => toast("Order saved.")))}>
        {(it, c) => {
          const st = statusOf(it, now);
          return (
            <div className={`admin-card flex flex-wrap items-center gap-3 p-3 ${editing?.id === it.id ? "ring-2 ring-primary" : ""}`}>
              {c.handle}
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail */}
              <img src={it.imageUrl} alt="" className={`h-14 shrink-0 rounded bg-black/5 ${kind === "banner" ? "w-40 object-contain" : "w-24 object-cover"} ${it.visible ? "" : "opacity-50"}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] text-[#333]">{it.alt || it.imageUrl.split("/").pop()}</span>
                {it.href && <span className="block truncate text-[12px] text-[#999]">Links to {it.href}</span>}
              </span>
              <span className={`admin-badge ${st.cls}`}>{st.label}</span>
              <MoveButtons c={c} label={noun} />
              <button type="button" className="admin-btn-secondary !py-1 text-[13px]" onClick={() => setEditing(it)}>
                Edit
              </button>
              <button
                type="button"
                disabled={pending}
                className="admin-btn-secondary !py-1 text-[13px]"
                onClick={() => start(() => setHomeItemVisibleAction(kind, it.id, !it.visible).then(() => toast(it.visible ? "Hidden." : "Shown.")))}
              >
                {it.visible ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                disabled={pending}
                className="admin-btn-secondary !py-1 text-[13px] !text-red-600"
                onClick={async () => {
                  if (!(await confirmDialog({ title: `Delete this ${noun}?`, message: "The image stays in the Media library.", confirmLabel: "Delete", danger: true }))) return;
                  start(() => deleteHomeItemAction(kind, it.id).then(() => toast("Deleted.")));
                }}
              >
                Delete
              </button>
            </div>
          );
        }}
      </SortableList>
      {!items.length && <p className="admin-card p-8 text-center text-[13px] text-[#999]">No {noun}s yet.</p>}
    </div>
  );
}

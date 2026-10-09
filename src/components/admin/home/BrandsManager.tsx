"use client";

import { startTransition, useActionState, useEffect, useState, useTransition } from "react";
import { deleteHomeItemAction, reorderHomeItemsAction, saveHomeItemAction, setHomeItemVisibleAction } from "@/app/admin/home-actions";
import type { brands } from "@/db/schema";
import ImageField from "../ImageField";
import { FormError } from "../ui/Field";
import SortableList, { MoveButtons } from "../ui/SortableList";
import { confirmDialog } from "../ui/confirm";
import { toast } from "../ui/toast";

type Brand = typeof brands.$inferSelect;
type Draft = Pick<Brand, "name" | "logoUrl" | "logoWidth" | "logoHeight" | "href" | "desktopHeight" | "mobileHeight"> & { id?: number };

const BLANK: Draft = { name: "", logoUrl: "", logoWidth: 0, logoHeight: 0, href: "", desktopHeight: 100, mobileHeight: 150 };

/** The "Our Brand" band as it renders on a wide screen (scaled to fit). */
function DesktopPreview({ list }: { list: Draft[] }) {
  return (
    <div className="overflow-hidden rounded-lg bg-[#dff7ff] p-4">
      <p className="mb-3 text-center text-[16px] font-bold text-primary">Our Brand</p>
      <div className="flex h-[70px] items-center justify-center gap-2">
        {list.map((b, i) => (
          <div key={b.id ?? `new${i}`} className="flex h-full min-w-0 flex-1 items-center justify-center">
            {b.logoUrl && b.logoHeight > 0 && (
              // eslint-disable-next-line @next/next/no-img-element -- live preview at 2/3 scale
              <img src={b.logoUrl} alt="" style={{ height: (b.desktopHeight * 2) / 3, maxWidth: "100%" }} className="object-contain" />
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-[#68a]">Computer preview (⅔ size)</p>
    </div>
  );
}

function BrandForm({ initial, others, onDone }: { initial: Draft; others: Draft[]; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveHomeItemAction, undefined);
  const [d, setD] = useState(initial);
  useEffect(() => {
    if (state?.ok) {
      toast(state.ok);
      onDone();
    }
  }, [state, onDone]);
  const preview = d.id ? others.map((o) => (o.id === d.id ? d : o)) : [...others, d];
  const ratio = d.logoHeight ? d.logoWidth / d.logoHeight : 1;

  return (
    <form
      className="admin-card space-y-4 p-5 ring-2 ring-primary/40"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      <h2 className="text-[16px] font-semibold">{d.id ? `Edit ${initial.name}` : "Add a brand"}</h2>
      <FormError state={state} />
      <input type="hidden" name="_kind" value="brand" />
      {d.id && <input type="hidden" name="id" value={d.id} />}
      <input type="hidden" name="logoWidth" value={d.logoWidth} />
      <input type="hidden" name="logoHeight" value={d.logoHeight} />
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div>
          <span className="admin-label">Logo</span>
          <ImageField
            name="logoUrl"
            defaultValue={d.logoUrl}
            aspect="aspect-square"
            fit="contain"
            onChange={(p) => setD((x) => ({ ...x, logoUrl: p?.url ?? "", logoWidth: p?.width ?? 0, logoHeight: p?.height ?? 0 }))}
          />
          <p className="mt-1 text-[12px] text-[#999]">A PNG with a transparent background looks best.</p>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="admin-label">Brand name</span>
            <input name="name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} required className="admin-input" placeholder="e.g. PISA Food Retail" />
            <span className="mt-1 block text-[12px] text-[#999]">Used as the image description for screen readers and Google.</span>
          </label>
          <label className="block">
            <span className="admin-label">Link (optional)</span>
            <input name="href" value={d.href} onChange={(e) => setD({ ...d, href: e.target.value })} className="admin-input" placeholder="https://… or /pisa-food-retail/" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="admin-label">
                Size on computers: <span className="font-normal text-[#888]">{d.desktopHeight}px tall</span>
              </span>
              <input type="range" name="desktopHeight" min={20} max={200} value={d.desktopHeight} onChange={(e) => setD({ ...d, desktopHeight: Number(e.target.value) })} className="w-full accent-[var(--color-primary)]" />
            </label>
            <label className="block">
              <span className="admin-label">
                Size on phones: <span className="font-normal text-[#888]">{d.mobileHeight}px tall</span>
              </span>
              <input type="range" name="mobileHeight" min={30} max={320} value={d.mobileHeight} onChange={(e) => setD({ ...d, mobileHeight: Number(e.target.value) })} className="w-full accent-[var(--color-primary)]" />
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_200px]">
        <DesktopPreview list={preview} />
        <div className="flex flex-col items-center justify-center rounded-lg bg-[#dff7ff] p-3">
          <div className="flex h-[150px] w-full items-center justify-center overflow-hidden">
            {d.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- live preview at half scale
              <img src={d.logoUrl} alt="" style={{ height: d.mobileHeight / 2, width: (d.mobileHeight / 2) * ratio, maxWidth: "none" }} />
            )}
          </div>
          <p className="text-[11px] text-[#68a]">Phone preview (½ size)</p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" className="admin-btn-secondary" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className="admin-btn">
          {pending ? "Saving…" : d.id ? "Save brand" : "Add brand"}
        </button>
      </div>
    </form>
  );
}

export default function BrandsManager({ list }: { list: Brand[] }) {
  const [editing, setEditing] = useState<Draft | null>(null);
  const [pending, start] = useTransition();
  const visible = list.filter((b) => b.visible);

  return (
    <div className="max-w-[960px] space-y-4">
      {editing ? (
        <BrandForm key={editing.id ?? "new"} initial={editing} others={visible} onDone={() => setEditing(null)} />
      ) : (
        <>
          <DesktopPreview list={visible} />
          <div className="flex justify-end">
            <button type="button" className="admin-btn" onClick={() => setEditing(BLANK)}>
              + Add brand
            </button>
          </div>
        </>
      )}

      <SortableList items={list} onReorder={(ids) => start(() => reorderHomeItemsAction("brand", ids).then(() => toast("Order saved.")))}>
        {(b, c) => (
          <div className={`admin-card flex flex-wrap items-center gap-3 p-3 ${b.visible ? "" : "opacity-60"} ${editing?.id === b.id ? "ring-2 ring-primary" : ""}`}>
            {c.handle}
            <span className="flex h-12 w-24 shrink-0 items-center justify-center rounded bg-[#dff7ff] p-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo thumbnail */}
              <img src={b.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-[#222]">{b.name}</span>
              <span className="block truncate text-[12px] text-[#999]">{b.href ? `Links to ${b.href}` : "No link"}</span>
            </span>
            {!b.visible && <span className="admin-badge bg-black/5 text-[#777]">Hidden</span>}
            <MoveButtons c={c} label={b.name} />
            <button type="button" className="admin-btn-secondary !py-1 text-[13px]" onClick={() => setEditing(b)}>
              Edit
            </button>
            <button
              type="button"
              disabled={pending}
              className="admin-btn-secondary !py-1 text-[13px]"
              onClick={() => start(() => setHomeItemVisibleAction("brand", b.id, !b.visible).then(() => toast(b.visible ? "Hidden from the website." : "Shown on the website.")))}
            >
              {b.visible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              disabled={pending}
              className="admin-btn-secondary !py-1 text-[13px] !text-red-600"
              onClick={async () => {
                if (!(await confirmDialog({ title: `Delete ${b.name}?`, message: "The logo stays in the Media library. To remove it only for now, use Hide.", confirmLabel: "Delete", danger: true }))) return;
                start(() => deleteHomeItemAction("brand", b.id).then(() => toast("Brand deleted.")));
              }}
            >
              Delete
            </button>
          </div>
        )}
      </SortableList>
    </div>
  );
}

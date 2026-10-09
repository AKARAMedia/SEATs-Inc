"use server";

import { refresh, updateTag } from "next/cache";
import { eq, max } from "drizzle-orm";
import { z } from "zod";
import { db, ready } from "@/db";
import { brands, homeBanners, homeSlides } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { HOME_TAG } from "@/lib/home";
import type { FormState } from "./actions";

const TABLES = { brand: brands, slide: homeSlides, banner: homeBanners } as const;
type Kind = keyof typeof TABLES;
const LABEL: Record<Kind, string> = { brand: "brand", slide: "hero slide", banner: "home banner" };

const imageUrl = z
  .string()
  .trim()
  .min(1, "Choose an image")
  .refine((v) => v.startsWith("/") || /^https:\/\//.test(v), "Invalid image");
const link = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "Use a full link (https://…) or a site path (/contact/)")
  .default("");
/** datetime-local in Cambodia time → Date, or null when empty */
const when = z
  .string()
  .default("")
  .transform((v, ctx) => {
    if (!v) return null;
    const d = new Date(v.length === 16 ? `${v}:00+07:00` : v);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid date" });
      return z.NEVER;
    }
    return d;
  });
const int = z.coerce.number().int();

const SCHEMAS = {
  brand: z.object({
    name: z.string().trim().min(1, "Enter the brand name").max(120),
    logoUrl: imageUrl,
    logoWidth: int.positive("Choose an image"),
    logoHeight: int.positive("Choose an image"),
    href: link,
    desktopHeight: int.min(20).max(200),
    mobileHeight: int.min(30).max(320),
  }),
  slide: z.object({ imageUrl, alt: z.string().trim().max(300).default(""), startsAt: when, endsAt: when }),
  banner: z.object({
    imageUrl,
    width: int.positive("Choose an image"),
    height: int.positive("Choose an image"),
    href: link,
    alt: z.string().trim().max(300).default(""),
    startsAt: when,
    endsAt: when,
  }),
};

/** A readable name for an item, for the activity log. */
async function nameOf(kind: Kind, id: number) {
  const table = TABLES[kind];
  const [row] = (await db.select().from(table).where(eq(table.id, id))) as Record<string, unknown>[];
  if (!row) return String(id);
  return String(row.name || row.alt || String(row.imageUrl ?? "").split("/").pop() || id);
}

async function done(kind: Kind, action: string, summary: string) {
  const who = await requireAdmin("content");
  await logActivity(who, `home.${action}`, { type: kind, summary: `${LABEL[kind]}: ${summary}` });
  updateTag(HOME_TAG);
  refresh();
}

export async function saveHomeItemAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("content");
  await ready();
  const kind = String(fd.get("_kind")) as Kind;
  if (!(kind in SCHEMAS)) return { error: "Unknown item." };
  const parsed = SCHEMAS[kind].safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { error: Object.values(fieldErrors)[0], fieldErrors };
  }
  const d = parsed.data as Record<string, unknown>;
  if ("startsAt" in d && d.startsAt && d.endsAt && (d.endsAt as Date) <= (d.startsAt as Date)) {
    return { error: "The end date must be after the start date.", fieldErrors: { endsAt: "Must be after the start" } };
  }
  if (kind === "brand") d.mobileRow = d.mobileHeight;

  const table = TABLES[kind];
  const id = Number(fd.get("id"));
  if (id) {
    await db.update(table).set(d).where(eq(table.id, id));
  } else {
    const [{ last }] = await db.select({ last: max(table.sortOrder) }).from(table);
    await db.insert(table).values({ ...d, sortOrder: (last ?? 0) + 1 } as never);
  }
  await done(kind, id ? "update" : "create", String(d.name || d.alt || String(d.imageUrl).split("/").pop()));
  return { ok: id ? "Saved." : "Added." };
}

export async function setHomeItemVisibleAction(kind: Kind, id: number, visible: boolean) {
  await requireAdmin("content");
  await ready();
  const table = TABLES[kind];
  await db.update(table).set({ visible }).where(eq(table.id, id));
  await done(kind, visible ? "show" : "hide", await nameOf(kind, id));
}

export async function reorderHomeItemsAction(kind: Kind, ids: number[]) {
  await requireAdmin("content");
  await ready();
  const table = TABLES[kind];
  for (const [i, id] of ids.entries()) await db.update(table).set({ sortOrder: i + 1 }).where(eq(table.id, id));
  await done(kind, "reorder", "new order");
}

export async function deleteHomeItemAction(kind: Kind, id: number) {
  await requireAdmin("content");
  await ready();
  const table = TABLES[kind];
  const name = await nameOf(kind, id);
  await db.delete(table).where(eq(table.id, id));
  await done(kind, "delete", name);
}

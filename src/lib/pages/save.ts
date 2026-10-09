import "server-only";
import { updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pages, translationItems } from "@/db/schema";
import type { Session } from "@/lib/auth";
import { ensureBaseline, saveVersion } from "@/lib/activity";
import type { PageKey } from "./registry";
import { bilingualFields } from "./shape";
import { loadPageForEdit, PAGES_TAG } from "./store";

const jaOf = (v: unknown) => JSON.stringify(bilingualFields(v).map((f) => f.ja));

/** Store a page (already reshaped), keep a version, reset its translation draft if the Japanese changed. */
export async function storePage(key: PageKey, value: unknown, who: Session, note = "") {
  const before = await loadPageForEdit(key);
  await ensureBaseline(`page:${key}`, before.value);
  const updatedBy = who.name || who.email;
  await db
    .insert(pages)
    .values({ key, value, updatedBy })
    .onConflictDoUpdate({ target: pages.key, set: { value, updatedBy, updatedAt: new Date() } });
  await saveVersion(`page:${key}`, value, who, note);
  if (jaOf(before.value) !== jaOf(value)) await db.delete(translationItems).where(eq(translationItems.key, `page:${key}`));
  updateTag(PAGES_TAG);
}

import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { pages } from "@/db/schema";
import { PAGES, type PageContent, type PageKey } from "./registry";
import { conform } from "./shape";

export const PAGES_TAG = "pages";

/** Page content for the website: saved edits (reshaped to the page's structure) or the built-in default. */
export async function getPage<K extends PageKey>(key: K): Promise<PageContent<K>> {
  return (await loadPage(key)) as PageContent<K>;
}

const loadPage = cache(async (key: PageKey) => {
  await ready();
  const [row] = await db.select().from(pages).where(eq(pages.key, key));
  const def = PAGES[key];
  return row ? conform(def.defaults, row.value, def.fixed) : def.defaults;
});

/** Uncached, for the admin editor. */
export async function loadPageForEdit(key: PageKey) {
  await ready();
  const [row] = await db.select().from(pages).where(eq(pages.key, key));
  const def = PAGES[key];
  return {
    value: row ? conform(def.defaults, row.value, def.fixed) : def.defaults,
    updatedAt: row?.updatedAt ?? null,
    updatedBy: row?.updatedBy ?? "",
  };
}

export async function pageSaveTimes() {
  await ready();
  const rows = await db.select({ key: pages.key, updatedAt: pages.updatedAt, updatedBy: pages.updatedBy }).from(pages);
  return new Map(rows.map((r) => [r.key, r]));
}

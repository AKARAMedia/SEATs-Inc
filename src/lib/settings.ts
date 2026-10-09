import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db, ready } from "@/db";
import { siteSettings } from "@/db/schema";
import { parseGroup, SETTINGS_GROUPS, type Settings } from "./settings-schema";

export const SETTINGS_TAG = "settings";

/** All settings groups with defaults filled in. Cached until an admin saves (updateTag). */
export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheLife("max");
  cacheTag(SETTINGS_TAG);
  await ready();
  const rows = await db.select().from(siteSettings);
  const stored = new Map(rows.map((r) => [r.key, r.value]));
  return Object.fromEntries(SETTINGS_GROUPS.map((k) => [k, parseGroup(k, stored.get(k))])) as Settings;
}

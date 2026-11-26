import "server-only";
import { cache } from "react";
import { db, ready } from "@/db";
import { siteSettings } from "@/db/schema";
import { parseGroup, SETTINGS_GROUPS, type Settings } from "./settings-schema";

export const SETTINGS_TAG = "settings";

/** All settings groups with defaults filled in. Read fresh per request (deduped within a render). */
export const getSettings = cache(async function getSettings(): Promise<Settings> {
  await ready();
  const rows = await db.select().from(siteSettings);
  const stored = new Map(rows.map((r) => [r.key, r.value]));
  return Object.fromEntries(SETTINGS_GROUPS.map((k) => [k, parseGroup(k, stored.get(k))])) as Settings;
});

/**
 * Settings for PUBLIC pages: if the database is unreachable, log it and fall back to the shipped defaults so
 * the site still renders. getSettings() above keeps throwing and is what the admin panel and form handlers
 * use: a fallback there could make an admin save overwrite real settings with defaults.
 */
export const getPublicSettings = cache(async function getPublicSettings(): Promise<Settings> {
  try {
    return await getSettings();
  } catch (err) {
    console.error("[degraded] getSettings failed, using default settings:", err);
    return Object.fromEntries(SETTINGS_GROUPS.map((k) => [k, parseGroup(k, undefined)])) as Settings;
  }
});

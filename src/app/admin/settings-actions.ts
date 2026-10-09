"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { db, ready } from "@/db";
import { siteSettings, translationItems } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { ensureBaseline, getVersion, logActivity, saveVersion } from "@/lib/activity";
import { eq } from "drizzle-orm";
import { SETTINGS_TAG } from "@/lib/settings";
import { HOME_TAG } from "@/lib/home";
import { parseGroup, SETTINGS_GROUPS, SETTINGS_SCHEMA, type SettingsGroup } from "@/lib/settings-schema";
import type { FormState } from "./actions";

/** "a.b.0.c" style form names → nested object (numeric parts become array indexes later). */
function nest(fd: FormData) {
  const out: Record<string, unknown> = {};
  for (const [name, value] of fd) {
    if (name.startsWith("_") || name.startsWith("$")) continue;
    const parts = name.split(".");
    let node = out as Record<string, unknown>;
    parts.slice(0, -1).forEach((p) => (node = (node[p] ??= {}) as Record<string, unknown>));
    node[parts[parts.length - 1]] = typeof value === "string" ? value : "";
  }
  return out;
}

const TAB_NAMES: Record<SettingsGroup, string> = { company: "Company", social: "Social links", seo: "SEO", contact: "Contact form", home: "Home page", maintenance: "Maintenance" };

/** Settings groups that hold Japanese text: editing them here resets their Translation Center draft. */
const TRANSLATED: SettingsGroup[] = ["company", "seo", "contact", "home", "maintenance"];

/** All Japanese strings in a settings value, to tell whether the Japanese was edited. */
const jaText = (v: unknown) =>
  JSON.stringify(Object.values((v ?? {}) as Record<string, unknown>).map((x) => (x && typeof x === "object" && "ja" in x ? (x as { ja: string }).ja : null)));

async function store(group: SettingsGroup, value: unknown) {
  const [prev] = await db.select().from(siteSettings).where(eq(siteSettings.key, group));
  await ensureBaseline(`settings:${group}`, prev ? prev.value : parseGroup(group, undefined));
  await db
    .insert(siteSettings)
    .values({ key: group, value })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
  if (TRANSLATED.includes(group) && jaText(prev?.value ? parseGroup(group, prev.value) : parseGroup(group, undefined)) !== jaText(value)) {
    await db.delete(translationItems).where(eq(translationItems.key, `settings:${group}`));
  }
  updateTag(SETTINGS_TAG);
}

export async function saveSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  const who = await requireAdmin("settings");
  await ready();
  const group = String(fd.get("_group")) as SettingsGroup;
  if (!SETTINGS_GROUPS.includes(group)) return { error: "Unknown settings section." };

  const raw = nest(fd);
  if (group === "social") {
    raw.links = Object.values((raw.links ?? {}) as Record<string, { network: string; url: string }>).filter((l) => l.url?.trim());
  }
  if (group === "contact") {
    raw.notifyEmails = String(raw.notifyEmails ?? "")
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    raw.autoReply = raw.autoReply === "on";
  }
  if (group === "maintenance") raw.enabled = raw.enabled === "on";
  if (group === "home") {
    raw.typingWords = String(raw.typingWords ?? "")
      .split(/[\r\n]+/)
      .map((w) => w.trim())
      .filter(Boolean);
    raw.pinnedPostIds = Object.values((raw.pinnedPostIds ?? {}) as Record<string, string>)
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0);
  }

  const parsed = SETTINGS_SCHEMA[group].safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  await store(group, parsed.data);
  await saveVersion(`settings:${group}`, parsed.data, who);
  await logActivity(who, "settings.update", { type: "settings", id: group, summary: TAB_NAMES[group] });
  if (group === "home") updateTag(HOME_TAG);
  const back = String(fd.get("_back") ?? "");
  redirect(back.startsWith("/admin/") ? `${back}${back.includes("?") ? "&" : "?"}flash=settingsSaved` : `/admin/settings/?tab=${group}&flash=settingsSaved`);
}

export async function restoreSettingsVersionAction(fd: FormData) {
  const who = await requireAdmin("settings");
  await ready();
  const group = String(fd.get("group")) as SettingsGroup;
  if (!SETTINGS_GROUPS.includes(group)) redirect("/admin/settings/");
  const v = await getVersion(`settings:${group}`, Number(fd.get("versionId")));
  if (!v) redirect(`/admin/settings/?tab=${group}`);
  const parsed = SETTINGS_SCHEMA[group].safeParse(v.data);
  if (parsed.success) {
    await store(group, parsed.data);
    await saveVersion(`settings:${group}`, parsed.data, who, "Restored an earlier version");
    await logActivity(who, "settings.restore", { type: "settings", id: group, summary: TAB_NAMES[group] });
  }
  redirect(`/admin/settings/?tab=${group}&flash=restored`);
}

"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { db, ready } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { SETTINGS_TAG } from "@/lib/settings";
import { SETTINGS_GROUPS, SETTINGS_SCHEMA, type SettingsGroup } from "@/lib/settings-schema";
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

export async function saveSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("settings");
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

  const parsed = SETTINGS_SCHEMA[group].safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  await db
    .insert(siteSettings)
    .values({ key: group, value: parsed.data })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: parsed.data, updatedAt: new Date() } });
  updateTag(SETTINGS_TAG);
  redirect(`/admin/settings/?tab=${group}&flash=settingsSaved`);
}

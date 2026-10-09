"use server";

import { redirect } from "next/navigation";
import { ready } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getVersion, logActivity } from "@/lib/activity";
import { isPageKey, PAGES } from "@/lib/pages/registry";
import { conform } from "@/lib/pages/shape";
import { storePage } from "@/lib/pages/save";

export async function savePageAction(key: string, json: string): Promise<{ ok: true; savedAt: string } | { ok: false; error: string }> {
  const who = await requireAdmin("content");
  await ready();
  if (!isPageKey(key)) return { ok: false, error: "Unknown page." };
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: "Invalid data." };
  }
  const def = PAGES[key];
  const value = conform(def.defaults, raw, def.fixed);
  await storePage(key, value, who);
  await logActivity(who, "page.update", { type: "page", id: key, summary: def.title });
  return { ok: true, savedAt: new Date().toISOString() };
}

export async function restorePageVersionAction(fd: FormData) {
  const who = await requireAdmin("content");
  await ready();
  const key = String(fd.get("key"));
  if (!isPageKey(key)) redirect("/admin/pages/");
  const v = await getVersion(`page:${key}`, Number(fd.get("versionId")));
  if (v) {
    const def = PAGES[key];
    await storePage(key, conform(def.defaults, v.data, def.fixed), who, "Restored an earlier version");
    await logActivity(who, "page.restore", { type: "page", id: key, summary: def.title });
  }
  redirect(`/admin/pages/${key}/?flash=restored`);
}

/** Go back to the content the page shipped with. */
export async function resetPageAction(fd: FormData) {
  const who = await requireAdmin("content");
  await ready();
  const key = String(fd.get("key"));
  if (!isPageKey(key)) redirect("/admin/pages/");
  await storePage(key, PAGES[key].defaults, who, "Reset to the original content");
  await logActivity(who, "page.reset", { type: "page", id: key, summary: PAGES[key].title });
  redirect(`/admin/pages/${key}/?flash=restored`);
}

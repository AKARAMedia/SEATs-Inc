"use server";

import { refresh } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, ready } from "@/db";
import { glossary } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { publishItem, saveDraft, StaleError, type DraftRow, type PublishProblem } from "@/lib/translation/center";
import type { FormState } from "./actions";

const Rows = z.array(z.object({ srcHash: z.string().max(64), target: z.string().max(20000), auto: z.boolean(), outdated: z.boolean() })).max(2000);

export type SaveResult = { ok: true; savedAt: string } | { ok: false; error: string; stale?: boolean };

export async function saveTranslationDraftAction(key: string, rows: DraftRow[]): Promise<SaveResult> {
  const who = await requireAdmin("translate");
  const parsed = Rows.safeParse(rows);
  if (!parsed.success) return { ok: false, error: "Invalid data." };
  try {
    await saveDraft(key, parsed.data, who);
    return { ok: true, savedAt: new Date().toISOString() };
  } catch (e) {
    if (e instanceof StaleError) return { ok: false, stale: true, error: "The English was changed by someone else. Reload the page to continue." };
    console.error("[translation] save failed", e);
    return { ok: false, error: "Couldn't save. Check your connection and try again." };
  }
}

export type PublishResult = { ok: true } | { ok: false; error: string; problems?: PublishProblem; stale?: boolean };

export async function publishTranslationAction(key: string, rows: DraftRow[]): Promise<PublishResult> {
  const who = await requireAdmin("translate");
  const saved = await saveTranslationDraftAction(key, rows);
  if (!saved.ok) return saved;
  const result = await publishItem(key, who);
  if (!result.ok) return { ok: false, error: "Not ready to publish.", problems: result.problems };
  refresh();
  return { ok: true };
}

// ---------- glossary ----------

const Term = z.object({
  termEn: z.string().trim().min(1, "Enter the English term").max(200),
  termJa: z.string().trim().min(1, "Enter the Japanese term").max(200),
  note: z.string().trim().max(500).default(""),
});

export async function saveTermAction(_: FormState, fd: FormData): Promise<FormState> {
  const who = await requireAdmin("translate");
  await ready();
  const parsed = Term.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { error: "Please fill in both terms.", fieldErrors };
  }
  const id = Number(fd.get("id"));
  if (id) await db.update(glossary).set(parsed.data).where(eq(glossary.id, id));
  else await db.insert(glossary).values(parsed.data);
  await logActivity(who, id ? "glossary.update" : "glossary.create", { type: "glossary", id: id || "", summary: `${parsed.data.termEn} → ${parsed.data.termJa}` });
  refresh();
  return { ok: id ? "Term updated." : "Term added." };
}

export async function deleteTermAction(fd: FormData) {
  const who = await requireAdmin("translate");
  await ready();
  const id = Number(fd.get("id"));
  const [row] = await db.delete(glossary).where(eq(glossary.id, id)).returning();
  if (row) await logActivity(who, "glossary.delete", { type: "glossary", id, summary: `${row.termEn} → ${row.termJa}` });
  refresh();
}

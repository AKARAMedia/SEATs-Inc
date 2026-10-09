import "server-only";
import { and, desc, eq, inArray, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, versions } from "@/db/schema";
import type { Session } from "./auth";

/** Record who did what. Never throws — logging must not break the action itself. */
export async function logActivity(
  who: Pick<Session, "id" | "name" | "email"> | null,
  action: string,
  target: { type?: string; id?: string | number; summary?: string } = {},
) {
  try {
    await db.insert(activityLog).values({
      userId: who?.id ?? null,
      userName: who ? who.name || who.email : "System",
      action,
      targetType: target.type ?? "",
      targetId: target.id === undefined ? "" : String(target.id),
      summary: (target.summary ?? "").slice(0, 300),
    });
  } catch (e) {
    console.error("[activity] failed to log", action, e);
  }
}

const KEEP_VERSIONS = 50;

/** Save a snapshot of an entity ("post:12", "settings:seo") and keep only the newest 50. */
export async function saveVersion(entity: string, data: unknown, who: Pick<Session, "name" | "email"> | null, note = "") {
  try {
    await db.insert(versions).values({ entity, data, userName: who ? who.name || who.email : "System", note });
    const keep = await db
      .select({ id: versions.id })
      .from(versions)
      .where(eq(versions.entity, entity))
      .orderBy(desc(versions.createdAt), desc(versions.id))
      .limit(KEEP_VERSIONS);
    if (keep.length === KEEP_VERSIONS) {
      await db.delete(versions).where(and(eq(versions.entity, entity), notInArray(versions.id, keep.map((k) => k.id))));
    }
  } catch (e) {
    console.error("[versions] failed to save", entity, e);
  }
}

/** Before the first recorded change, keep the original as a version so it can be restored. */
export async function ensureBaseline(entity: string, original: unknown) {
  if (original === undefined) return;
  const [any] = await db.select({ id: versions.id }).from(versions).where(eq(versions.entity, entity)).limit(1);
  if (!any) await saveVersion(entity, original, null, "Original (before the first edit in this admin)");
}

export async function listVersions(entity: string, limit = 50) {
  return db
    .select({ id: versions.id, userName: versions.userName, note: versions.note, createdAt: versions.createdAt })
    .from(versions)
    .where(eq(versions.entity, entity))
    .orderBy(desc(versions.createdAt), desc(versions.id))
    .limit(limit);
}

export async function getVersion(entity: string, id: number) {
  const [row] = await db.select().from(versions).where(and(eq(versions.entity, entity), eq(versions.id, id)));
  return row ?? null;
}

export async function deleteVersions(entities: string[]) {
  if (entities.length) await db.delete(versions).where(inArray(versions.entity, entities));
}

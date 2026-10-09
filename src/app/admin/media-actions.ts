"use server";

import { refresh } from "next/cache";
import { eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { media } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { listMedia, mediaUsage, type MediaItem } from "@/lib/media-library";
import { deleteImage } from "@/lib/storage";

/** For the image picker: every image, newest uploads first. */
export async function pickerMediaAction(): Promise<MediaItem[]> {
  await requireAdmin("translate");
  return listMedia();
}

export async function saveAltAction(id: number, alt: string): Promise<{ ok: boolean }> {
  await requireAdmin("content");
  await ready();
  await db.update(media).set({ alt: alt.trim().slice(0, 300) }).where(eq(media.id, id));
  refresh();
  return { ok: true };
}

export async function deleteMediaAction(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  const who = await requireAdmin("content");
  await ready();
  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (!row) return { ok: false, error: "Image not found." };
  const uses = (await mediaUsage()).get(row.url) ?? [];
  if (uses.length) return { ok: false, error: `This image is still used in ${uses.length} place${uses.length > 1 ? "s" : ""}. Remove it there first.` };
  try {
    await deleteImage(row.url);
  } catch (e) {
    console.error("[media] delete failed", e);
    return { ok: false, error: "Couldn't delete the file. Try again." };
  }
  await db.delete(media).where(eq(media.id, id));
  await logActivity(who, "media.delete", { type: "media", summary: row.filename });
  refresh();
  return { ok: true };
}

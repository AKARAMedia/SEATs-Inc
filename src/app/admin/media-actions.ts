"use server";

import { refresh } from "next/cache";
import { eq, or, sql } from "drizzle-orm";
import { db, ready } from "@/db";
import { media, posts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { ensureBaseline, logActivity, saveVersion } from "@/lib/activity";
import { removeImageFromHtml } from "@/lib/image-mirror";
import { NEWS_TAG } from "@/lib/news";
import { publishChange } from "@/lib/rebuild";
import { listMedia, mediaUsage, type MediaItem } from "@/lib/media-library";
import { deleteImage } from "@/lib/storage";

/** For the image picker: every image, newest uploads first. */
export async function pickerMediaAction(): Promise<MediaItem[]> {
  await requireAdmin("content");
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
  // News posts are cleaned up automatically below; other places (brands, home page, settings, pages,
  // careers) would break, so those still have to be changed first.
  const blocking = uses.filter((u) => u.kind !== "post");
  if (blocking.length) return { ok: false, error: `This image is still used in ${blocking.length} place${blocking.length > 1 ? "s" : ""} (${blocking.map((u) => u.label).join(", ")}). Remove it there first.` };

  // Remove it from every news post (featured image and both bodies)
  const affected = await db
    .select()
    .from(posts)
    .where(or(eq(posts.imageUrl, row.url), sql`${posts.bodyEn} like ${"%" + row.url + "%"}`, sql`${posts.bodyJa} like ${"%" + row.url + "%"}`));
  for (const p of affected) {
    const values = {
      imageUrl: p.imageUrl === row.url ? null : p.imageUrl,
      bodyEn: removeImageFromHtml(p.bodyEn, row.url),
      bodyJa: removeImageFromHtml(p.bodyJa, row.url),
      updatedAt: new Date(),
    };
    await db.update(posts).set(values).where(eq(posts.id, p.id));
    await ensureBaseline(`post:${p.id}`, p);
    await saveVersion(`post:${p.id}`, { ...p, ...values }, who, `Image removed (${row.filename} deleted from the Media library)`);
  }
  if (affected.length) publishChange(NEWS_TAG);

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

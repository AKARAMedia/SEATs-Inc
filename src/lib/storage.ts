import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { uploadFiles } from "@/db/schema";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel Functions accept request bodies up to 4.5 MB

// Upload keys look like news/2026/10/<uuid>.jpg and are served at /uploads/<key>
const UPLOAD_KEY = /^news\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(?:jpg|png|webp|gif)$/;

/** Cloudflare Workers have no filesystem: uploads are stored in the database there instead. */
const uploadsInDb = () => globalThis.navigator?.userAgent === "Cloudflare-Workers";

/** An image stored by saveImage() in the database, or null. */
export async function loadUpload(key: string) {
  await ready();
  const [row] = await db.select({ contentType: uploadFiles.contentType, data: uploadFiles.data }).from(uploadFiles).where(eq(uploadFiles.key, key));
  return row ?? null;
}

/** The storage key for an /uploads/... URL, or null if it isn't one saveImage() could have produced. */
export function uploadKey(url: string): string | null {
  const key = url.startsWith("/uploads/") ? url.slice("/uploads/".length) : null;
  return key && UPLOAD_KEY.test(key) ? key : null;
}

/** Remove an uploaded image (Vercel Blob, the database or public/uploads). Site images in public/media are never touched. */
export async function deleteImage(url: string) {
  if (/^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(url)) {
    const { del } = await import("@vercel/blob");
    await del(url);
    return;
  }
  if (uploadsInDb()) {
    const key = uploadKey(url);
    if (key) {
      await ready();
      await db.delete(uploadFiles).where(eq(uploadFiles.key, key));
    }
    return;
  }
  if (url.startsWith("/uploads/")) {
    // Resolve against the uploads root and refuse anything that escapes it (e.g. a "../" segment) —
    // url is only ever expected to be exactly what saveImage() itself produced, but this is cheap
    // insurance against a future caller passing an unsanitized value through.
    const root = path.join(process.cwd(), "public", "uploads");
    const file = path.resolve(root, "." + url.slice("/uploads".length));
    if (file === root || !file.startsWith(root + path.sep)) return;
    await fs.rm(file, { force: true });
  }
}

/**
 * Store an uploaded image and return its public URL.
 * Vercel: Vercel Blob (requires BLOB_READ_WRITE_TOKEN). Cloudflare Workers: the database. Local dev: public/uploads/.
 */
export async function saveImage(file: File): Promise<string> {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new Error("Unsupported file type. Use JPG, PNG, WebP or GIF.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("File is too large (max 4 MB).");

  const now = new Date();
  const key = `news/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (uploadsInDb()) {
    await ready();
    await db.insert(uploadFiles).values({ key, contentType: file.type, data: Buffer.from(await file.arrayBuffer()) });
    return `/uploads/${key}`;
  }
  if (process.env.VERCEL) {
    throw new Error("Image storage is not configured (connect Vercel Blob to this project).");
  }
  const dest = path.join(process.cwd(), "public", "uploads", ...key.split("/"));
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${key}`;
}

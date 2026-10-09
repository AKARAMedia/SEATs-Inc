import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel Functions accept request bodies up to 4.5 MB

/** Remove an uploaded image (Vercel Blob or public/uploads). Site images in public/media are never touched. */
export async function deleteImage(url: string) {
  if (/^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(url)) {
    const { del } = await import("@vercel/blob");
    await del(url);
    return;
  }
  if (url.startsWith("/uploads/")) {
    const file = path.join(process.cwd(), "public", ...url.split("/").filter(Boolean));
    await fs.rm(file, { force: true });
  }
}

/**
 * Store an uploaded image and return its public URL.
 * Production: Vercel Blob (requires BLOB_READ_WRITE_TOKEN). Local dev: public/uploads/.
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
  if (process.env.VERCEL) {
    throw new Error("Image storage is not configured (connect Vercel Blob to this project).");
  }
  const dest = path.join(process.cwd(), "public", "uploads", ...key.split("/"));
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${key}`;
}

import "server-only";
import fs from "node:fs";
import path from "node:path";

// WordPress's image editor saves crops as "<name>-e<timestamp>.jpg" next to the untouched original.
const WP_EDITED = /^(\/media\/.+)-e\d{10,}(\.[a-z0-9]+)$/i;

/** Full, uncropped version of an image when one exists (used when a photo is opened full-size). */
export function originalImage(src: string): string {
  const m = src.match(WP_EDITED);
  if (!m) return src;
  const original = m[1] + m[2];
  return fs.existsSync(path.join(process.cwd(), "public", original)) ? original : src;
}

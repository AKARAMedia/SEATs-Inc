import "server-only";
import SITE_MEDIA from "@/content/site-media.json";

// WordPress's image editor saves crops as "<name>-e<timestamp>.jpg" next to the untouched original.
const WP_EDITED = /^(\/media\/.+)-e\d{10,}(\.[a-z0-9]+)$/i;

// Files shipped in public/media (from the build-time manifest; Workers have no filesystem to check).
const SHIPPED = new Set(SITE_MEDIA.map((m) => m.url));

/** Full, uncropped version of an image when one exists (used when a photo is opened full-size). */
export function originalImage(src: string): string {
  const m = src.match(WP_EDITED);
  if (!m) return src;
  const original = m[1] + m[2];
  return SHIPPED.has(original) ? original : src;
}

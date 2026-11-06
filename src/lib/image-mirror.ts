// Keeps an image at the same place in the English and Japanese bodies: "place" = the image's position
// among the body's top-level blocks (paragraph, heading, list, image, ...). Plain string work, no DOM,
// so the editor (browser) and the save actions (server) share it and it stays cheap on the server.

import { IMAGE_LOOK_KEYS, isLookValue, type ImageLookKey } from "./image-options";

const VOID = new Set(["img", "br", "hr", "input", "source", "col", "embed", "wbr", "area", "base", "link", "meta", "track"]);
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;

export type MirrorImage = { src: string; alt: string; at: number };

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Safe to write into a body: an own-site path or an https URL. */
export function isMirrorSrc(src: string) {
  return src.length > 0 && src.length <= 500 && (/^\/(?!\/)/.test(src) || /^https:\/\//.test(src));
}

export function imgTag(src: string, alt: string) {
  return `<img src="${esc(src)}" alt="${esc(alt)}">`;
}

/** Splits well-formed HTML into its top-level blocks. */
export function topLevelBlocks(html: string): string[] {
  const blocks: string[] = [];
  let depth = 0;
  let start = 0;
  TAG.lastIndex = 0;
  for (let m: RegExpExecArray | null; (m = TAG.exec(html)); ) {
    const closing = m[1] === "/";
    const name = m[2].toLowerCase();
    const selfClosing = VOID.has(name) || m[3].trimEnd().endsWith("/");
    if (closing) depth = Math.max(0, depth - 1);
    else if (!selfClosing) depth++;
    if (depth === 0 && (closing || selfClosing)) {
      blocks.push(html.slice(start, TAG.lastIndex));
      start = TAG.lastIndex;
    }
  }
  const rest = html.slice(start);
  if (rest.trim()) blocks.push(rest);
  return blocks;
}

/** Index of the top-level block that contains this image, or -1. */
export function blockIndexOf(html: string, src: string): number {
  const needle = `src="${esc(src)}"`;
  return topLevelBlocks(html).findIndex((b) => b.includes(needle));
}

/** Inserts the images (each at its own block position) unless the body already has them. */
export function insertMirroredImages(html: string, images: MirrorImage[]): string {
  const todo = images.filter((i) => isMirrorSrc(i.src) && !html.includes(esc(i.src)) && !html.includes(i.src)).sort((a, b) => a.at - b.at);
  if (!todo.length) return html;
  const blocks = topLevelBlocks(html);
  // Ascending order: each earlier insertion shifts the later positions exactly as it did in the source body.
  for (const i of todo) blocks.splice(Math.min(Math.max(i.at, 0), blocks.length), 0, imgTag(i.src, i.alt));
  return blocks.join("");
}

/** Parses the hidden "mirrorImages" form field. */
export function parseMirrorImages(raw: unknown): MirrorImage[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.slice(0, 50).flatMap((x) => {
      const src = typeof x?.src === "string" ? x.src.trim() : "";
      const alt = typeof x?.alt === "string" ? x.alt.slice(0, 300) : "";
      const at = Number.isInteger(x?.at) ? x.at : Number.MAX_SAFE_INTEGER;
      return isMirrorSrc(src) ? [{ src, alt, at }] : [];
    });
  } catch {
    return [];
  }
}

/** The src of every <img> in a body (entity-decoded, so the same URL always compares equal). */
export function imageSrcs(html: string): string[] {
  const found = new Set<string>();
  // \s before src: don't mistake data-src for src
  for (const m of html.matchAll(/<img\b[^>]*?\ssrc=(?:"([^"]*)"|'([^']*)')/gi)) found.add((m[1] ?? m[2]).replace(/&amp;/g, "&"));
  return [...found];
}

/**
 * Deleting an image in one language deletes it in the other: removes from `target` every image that
 * `before` (the saved body) had and `after` (the body being saved) no longer has. Images that were never
 * in `before` are left alone, so an image that only the other language has is not touched.
 */
export function removeDeletedImages(target: string, before: string, after: string): string {
  const kept = new Set(imageSrcs(after));
  let out = target;
  for (const src of imageSrcs(before)) if (!kept.has(src)) out = removeImageFromHtml(out, src);
  return out;
}

const unesc = (v: string) => v.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** How an image looks: every look setting of the editor ("" = not set), see IMAGE_LOOK_OPTIONS. */
type Look = Record<ImageLookKey, string>;
const attrOf = (tag: string, name: string) => {
  const m = new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, "i").exec(tag);
  return m ? unesc(m[1] ?? m[2]) : "";
};
const lookOf = (tag: string): Look => {
  const look = {} as Look;
  for (const key of IMAGE_LOOK_KEYS) {
    const value = attrOf(tag, `data-${key}`);
    look[key] = isLookValue(key, value) ? value : "";
  }
  return look;
};
/** Just the look settings of an image record (which also carries src and alt). */
const pickLook = (i: Look): Look => Object.fromEntries(IMAGE_LOOK_KEYS.map((k) => [k, i[k]])) as Look;
const sameLook = (a: Look, b: Look) => IMAGE_LOOK_KEYS.every((k) => a[k] === b[k]);
const LOOK_ATTRS = new RegExp(`\\sdata-(?:${IMAGE_LOOK_KEYS.join("|")})=(?:"[^"]*"|'[^']*')`, "gi");

/** Every distinct <img> of a body (src and alt entity-decoded), in document order. */
export function imageList(html: string): ({ src: string; alt: string } & Look)[] {
  const found = new Map<string, { src: string; alt: string } & Look>();
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const src = attrOf(m[0], "src");
    if (src && !found.has(src)) found.set(src, { src, alt: attrOf(m[0], "alt"), ...lookOf(m[0]) });
  }
  return [...found.values()];
}

/** Gives every <img> listed in `looks` that look (all settings), leaving tags that already match alone. */
function setLooks(html: string, looks: Map<string, Look>): string {
  if (!looks.size) return html;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const want = looks.get(attrOf(tag, "src"));
    if (!want) return tag;
    if (sameLook(lookOf(tag), want)) return tag;
    const bare = tag.replace(LOOK_ATTRS, "");
    const extra = IMAGE_LOOK_KEYS.filter((k) => want[k]).map((k) => ` data-${k}="${esc(want[k])}"`).join("");
    return bare.replace(/\s*\/?>$/, (end) => `${extra}${end}`);
  });
}

/** Where (top-level block index) a body has this image, for placing the same image in the other language. */
function placeIn(html: string, src: string) {
  const at = blockIndexOf(html, src);
  return at < 0 ? Number.MAX_SAFE_INTEGER : at;
}

/**
 * Makes `target` use exactly the images of `source`, looking the same: images only the target has are
 * removed, images only the source has are added at the same block position, and every image gets the
 * source's shape and width. Text is never touched.
 */
export function syncImagesTo(target: string, source: string): string {
  const want = imageList(source);
  const wanted = new Set(want.map((i) => i.src));
  let out = target;
  for (const src of imageSrcs(target)) if (!wanted.has(src)) out = removeImageFromHtml(out, src);
  const have = new Set(imageSrcs(out));
  out = insertMirroredImages(
    out,
    want.filter((i) => !have.has(i.src)).map((i) => ({ ...i, at: placeIn(source, i.src) })),
  );
  return setLooks(out, new Map(want.map((i) => [i.src, pickLook(i)])));
}

/**
 * Carries the image edits made in one language over to the other body: images deleted in `after` (compared
 * with the saved `before`) are removed from `target`, images newly added in `after` are inserted at the
 * same block position, and images whose shape or width were changed get the new look. Images the edit did
 * not touch are left as they are.
 */
export function applyImageChanges(target: string, before: string, after: string): string {
  const had = new Map(imageList(before).map((i) => [i.src, i]));
  const now = imageList(after);
  const added = now.filter((i) => !had.has(i.src)).map((i) => ({ ...i, at: placeIn(after, i.src) }));
  // New images arrive with their look too, and so do existing ones whose look was changed
  const restyled = new Map(
    now.filter((i) => { const p = had.get(i.src); return !p || !sameLook(p, i); }).map((i) => [i.src, pickLook(i)]),
  );
  return setLooks(insertMirroredImages(removeDeletedImages(target, before, after), added), restyled);
}

/** Removes every <img> with this src from a body (and the paragraph it leaves empty). */
export function removeImageFromHtml(html: string, src: string): string {
  const wanted = new Set([`src="${src}"`, `src="${esc(src)}"`]);
  // Work on top-level blocks: drop an <img> block, or a paragraph whose only content is that image
  const isTarget = (tag: string) => tag.startsWith("<img") && [...wanted].some((w) => tag.includes(w));
  const stripImgs = (block: string) => block.replace(/<img\b[^>]*>/gi, (tag) => (isTarget(tag) ? "" : tag));
  return topLevelBlocks(html)
    .map((block) => {
      const cleaned = stripImgs(block);
      if (cleaned === block) return block;
      // Nothing left but an empty wrapper (<p></p>, <figure></figure>)
      return cleaned.replace(/<[^>]+>/g, "").trim() === "" && !/<img\b/i.test(cleaned) ? "" : cleaned;
    })
    .join("");
}

import "server-only";
import crypto from "node:crypto";
import { loadFragment, type Cheerio, type CheerioAPI } from "@/lib/html";
import type { AnyNode } from "domhandler";
import { htmlText, normalizeForMatch } from "./text";

// Splitting rich-text bodies into translatable paragraphs, and putting a translation back together.

const LEAF = "p,h1,h2,h3,h4,h5,h6,li,blockquote,figcaption,td,th";

/** Text blocks in document order: the innermost block elements that contain visible text. */
function leaves($: CheerioAPI) {
  const out: Cheerio<AnyNode>[] = [];
  $(LEAF).each((_, el) => {
    const node = $(el);
    if (node.find(LEAF).length) return;
    if (!node.text().trim()) return; // image-only paragraphs are copied as-is
    out.push(node);
  });
  return out;
}

/** Inner HTML of each text block. */
export function segmentHtml(html: string): string[] {
  if (!html.trim()) return [];
  const $ = loadFragment(html);
  return leaves($).map((n) => (n.html() ?? "").trim());
}

/**
 * The English document with each text block's content replaced by its translation.
 * Images, embeds and layout come from the English, so they never need translating.
 */
export function assembleHtml(enHtml: string, targets: string[]): string {
  const $ = loadFragment(enHtml);
  leaves($).forEach((node, i) => {
    if (targets[i] !== undefined) node.html(targets[i]);
  });
  return $.html();
}

export function hashText(text: string) {
  return crypto.createHash("sha1").update(normalizeForMatch(text)).digest("base64url").slice(0, 16);
}

/** Hash of a segment's visible text (formatting-only changes don't count as changes). */
export function segmentHash(src: string) {
  return hashText(htmlText(src));
}

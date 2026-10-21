import "server-only";
import * as cheerio from "cheerio/slim";

/**
 * Parse an HTML fragment with cheerio's htmlparser2 backend ("slim": no parse5, which keeps the
 * Cloudflare Worker small). Text is written back as UTF-8 characters rather than &#x…; entities.
 */
export function loadFragment(html: string) {
  return cheerio.load(html, { xml: { xmlMode: false, decodeEntities: true, encodeEntities: "utf8" } }, false);
}

export type { Cheerio, CheerioAPI } from "cheerio/slim";

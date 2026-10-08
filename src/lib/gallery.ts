import "server-only";
import * as cheerio from "cheerio";
import { originalImage } from "./media";

const PER_ROW = 2;

/**
 * Prepare an article body for display:
 * - every <img> gets data-full = its uncropped original (what the lightbox opens)
 * - galleries become "justified" rows: two photos per row, each with flex-grow = its aspect
 *   ratio, so photos in a row share one height and none are cropped.
 */
export function prepareArticleHtml(html: string): string {
  if (!html.includes("<img")) return html;
  const $ = cheerio.load(html, null, false);

  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (src) $(el).attr("data-full", originalImage(src));
  });

  $(".wp-block-gallery, .gallery").each((_, gallery) => {
    const items = $(gallery)
      .children()
      .toArray()
      .filter((el) => $(el).find("img").length);
    if (!items.length) return;
    for (const el of items) {
      const img = $(el).find("img").first();
      const w = Number(img.attr("width"));
      const h = Number(img.attr("height"));
      const ratio = w > 0 && h > 0 ? +(w / h).toFixed(4) : 1;
      $(el).attr("style", `flex:${ratio} 1 0%`);
    }
    const rows: string[] = [];
    for (let i = 0; i < items.length; i += PER_ROW) {
      rows.push(`<div class="gallery-row">${items.slice(i, i + PER_ROW).map((el) => $.html(el)).join("")}</div>`);
    }
    $(gallery).empty().append(rows.join(""));
  });
  return $.html();
}

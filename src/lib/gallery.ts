import "server-only";
import * as cheerio from "cheerio";

const PER_ROW = 2;

/**
 * Lay out article galleries as "justified" rows: photos are grouped in rows of two and each
 * gets flex-grow = its aspect ratio, so photos in a row share one height and none are cropped.
 */
export function justifyGalleries(html: string): string {
  if (!html.includes("wp-block-gallery") && !html.includes('class="gallery')) return html;
  const $ = cheerio.load(html, null, false);
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

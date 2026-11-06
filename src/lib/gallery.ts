import "server-only";
import { loadFragment } from "./html";
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
  const $ = loadFragment(html);

  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (src) $(el).attr("data-full", originalImage(src));
  });

  // Captions: an image with a caption (data-caption, set in the post editor) becomes
  // <figure><img><figcaption>. The settings that place it among its neighbours (size, align, gap) move to
  // the figure, so column layouts and floats keep working; the look of the picture itself stays on the img.
  $("img[data-caption]").each((_, el) => {
    const img = $(el);
    const caption = (img.attr("data-caption") ?? "").trim();
    img.removeAttr("data-caption");
    // Already inside a figure or a paragraph (older imported posts): leave the markup as it is
    if (!caption || img.parent("figure").length || img.parent("p").length) return;
    const figure = $('<figure class="seats-figure"></figure>');
    for (const name of ["data-size", "data-align", "data-gap"]) {
      const value = img.attr(name);
      if (value) {
        figure.attr(name, value);
        img.removeAttr(name);
      }
    }
    img.replaceWith(figure);
    figure.append(img).append($("<figcaption></figcaption>").text(caption));
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

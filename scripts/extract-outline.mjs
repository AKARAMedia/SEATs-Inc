// Turn exported Elementor HTML into a readable, ordered outline per page.
// Usage: node scripts/extract-outline.mjs  -> content-export/outline/{en,ja}/<page>.txt
import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "content-export");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "media-manifest.json"), "utf8"));
const local = (u) => manifest[u?.replace(/^\/\//, "https://")] ?? u;

for (const lang of ["en", "ja"]) {
  const dir = path.join(root, "pages", lang);
  const out = path.join(root, "outline", lang);
  fs.mkdirSync(out, { recursive: true });
  for (const file of fs.readdirSync(dir)) {
    const $ = cheerio.load(fs.readFileSync(path.join(dir, file), "utf8"));
    const main = $(".main-page-wrapper").first().length ? $(".main-page-wrapper").first() : $("body");
    main.find("script,style,noscript,.wd-cookies-popup").remove();
    const lines = [];
    const walk = (el, depth) => {
      el.children().each((_, c) => {
        const n = $(c);
        const cls = n.attr("class") || "";
        const pad = "  ".repeat(Math.min(depth, 12));
        if (/elementor-section|e-con\b|e-parent|e-child/.test(cls) && n.is("section,div")) {
          const id = n.attr("data-id");
          const hidden = (cls.match(/elementor-hidden-[a-z]+/g) || []).join(" ");
          lines.push(`${pad}[${n.is("section") ? "section" : "container"} ${id ?? ""}${hidden ? " " + hidden : ""}]`);
          walk(n, depth + 1);
          return;
        }
        if (/elementor-widget\b/.test(cls)) {
          const type = n.attr("data-widget_type") || "widget";
          const imgs = n.find("img").map((_, i) => local($(i).attr("data-wood-src") || $(i).attr("data-src") || $(i).attr("src")) + ` (${$(i).attr("width") ?? "?"}x${$(i).attr("height") ?? "?"})`).get();
          const bgs = [...(n.html() || "").matchAll(/(?:data-wood-src|url\()(?:=|&quot;|["'])*([^"')&\s]+\.(?:jpe?g|png|webp|gif|svg))/g)].map((m) => local(m[1])).filter((u) => !n.find(`img[data-wood-src="${u}"]`).length);
          const links = n.find("a[href]").map((_, a) => `${$(a).text().trim().slice(0, 60)} -> ${$(a).attr("href")}`).get();
          const iframes = n.find("iframe").map((_, f) => $(f).attr("src") || $(f).attr("data-src")).get();
          const text = n.text().replace(/\s+/g, " ").trim();
          const hidden = (cls.match(/elementor-hidden-[a-z]+/g) || []).join(" ");
          lines.push(`${pad}<${type}${hidden ? " " + hidden : ""}> ${text.slice(0, 1500)}`);
          for (const i of imgs) lines.push(`${pad}   img: ${i}`);
          for (const b of bgs) lines.push(`${pad}   bg: ${b}`);
          for (const l of links) lines.push(`${pad}   link: ${l}`);
          for (const f of iframes) lines.push(`${pad}   iframe: ${f}`);
          return;
        }
        walk(n, depth);
      });
    };
    walk(main, 0);
    fs.writeFileSync(path.join(out, file.replace(".html", ".txt")), lines.join("\n"));
  }
}
console.log("done");

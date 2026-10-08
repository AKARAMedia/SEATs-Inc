// Import the 41 WordPress posts (EN from REST + JA from TranslatePress-rendered pages) into the DB.
// Idempotent: upserts on slug. Usage: npx tsx scripts/import-wp.ts
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { sql } from "drizzle-orm";
import { categories, posts } from "../src/db/schema";
import { sanitizeBody, stripTags, slugify } from "../src/lib/sanitize";
import { scriptDb } from "./script-db";

const root = path.resolve(import.meta.dirname, "..", "content-export");
const manifest: Record<string, string> = JSON.parse(fs.readFileSync(path.join(root, "media-manifest.json"), "utf8"));
const wpPosts = JSON.parse(fs.readFileSync(path.join(root, "posts.json"), "utf8"));

const CATEGORY_JA: Record<string, string> = {
  "loka-japanese-foods-beverage": "LOKA Japanese Foods&Beverage",
  "s-e-a-t-s-farm": "S.E.A.T.S Farm",
  "s-e-a-t-s-inc": "S.E.A.T.S Inc",
};

function localizeMedia(html: string) {
  return html.replace(/https?:\/\/seats-inc\.com\/wp-content\/uploads\/[^"'\s<>)]+/g, (u) => {
    const clean = decodeURI(u.replace(/&amp;/g, "&"));
    return manifest[clean] ?? manifest[u] ?? u;
  });
}

function decode(s: string) {
  return cheerio.load(`<p>${s}</p>`)("p").text();
}

function readJa(slug: string) {
  const file = path.join(root, "posts", "ja", decodeURIComponent(slug).slice(0, 120) + ".html");
  if (!fs.existsSync(file)) return null;
  const $ = cheerio.load(fs.readFileSync(file, "utf8"));
  const content = $(".entry-content").first();
  content.find("script,style,.wd-social-icons,.sharedaddy").remove();
  // Lazy-loaded images: promote real src
  content.find("img").each((_, img) => {
    const real = $(img).attr("data-wood-src") || $(img).attr("data-src");
    if (real) $(img).attr("src", real);
  });
  return { title: $("h1.post-title").first().text().trim(), body: content.html() ?? "" };
}

async function main() {
  const { db, close } = await scriptDb();
  const catRows = JSON.parse(fs.readFileSync(path.join(root, "categories.json"), "utf8")).filter(
    (c: { slug: string }) => c.slug !== "uncategorized",
  );
  const catIdByWp = new Map<number, number>();
  for (const [i, c] of catRows.entries()) {
    const [row] = await db
      .insert(categories)
      .values({ slug: c.slug, nameEn: decode(c.name), nameJa: CATEGORY_JA[c.slug] ?? decode(c.name), sortOrder: i })
      .onConflictDoUpdate({ target: categories.slug, set: { nameEn: decode(c.name) } })
      .returning();
    catIdByWp.set(c.id, row.id);
  }

  for (const p of wpPosts) {
    const ja = readJa(p.slug);
    // WP slugs for two posts are URL-encoded Japanese; give them ASCII slugs from the EN title
    const raw = decodeURIComponent(p.slug);
    const slug = /^[a-z0-9-]+$/.test(raw) ? raw : slugify(decode(p.title)) || `post-${p.id}`;
    const bodyEn = sanitizeBody(localizeMedia(p.content));
    const bodyJa = ja ? sanitizeBody(localizeMedia(ja.body)) : "";
    const excerptEn = stripTags(p.excerpt).replace(/\s*\[…\]$|…$/, "").slice(0, 300);
    const values = {
      slug,
      wpId: p.id,
      categoryId: catIdByWp.get(p.categories[0]) ?? null,
      titleEn: decode(p.title),
      titleJa: ja?.title ?? "",
      excerptEn,
      excerptJa: bodyJa ? stripTags(bodyJa).slice(0, 120) : "",
      bodyEn,
      bodyJa,
      imageUrl: p.featured_image ? (manifest[p.featured_image] ?? p.featured_image) : null,
      publishedAt: new Date(p.date + "+07:00"),
      published: true,
    };
    await db
      .insert(posts)
      .values(values)
      .onConflictDoUpdate({ target: posts.slug, set: { ...values, updatedAt: sql`now()` } });
    console.log("imported", slug, ja ? "(+ja)" : "(no ja)");
  }
  await close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

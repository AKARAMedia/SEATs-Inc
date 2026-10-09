// List the images shipped in public/media (with sizes) for the admin Media library.
// Run after adding files to public/media: node scripts/site-media-manifest.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..", "public");
const out = path.resolve(import.meta.dirname, "..", "src", "content", "site-media.json");

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(jpe?g|png|webp|gif)$/i.test(e.name)) yield p;
  }
}

const list = [];
for (const file of walk(path.join(root, "media"))) {
  const { width = 0, height = 0 } = await sharp(file).metadata().catch(() => ({}));
  list.push({ url: "/" + path.relative(root, file).split(path.sep).join("/"), width, height, size: fs.statSync(file).size });
}
list.sort((a, b) => b.url.localeCompare(a.url));
fs.writeFileSync(out, JSON.stringify(list));
console.log(`${list.length} images → ${path.relative(process.cwd(), out)}`);

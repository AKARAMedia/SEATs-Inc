// Runs after `opennextjs-cloudflare build`: copies the prerendered pages into the Worker's static assets.
//
// Why: the Cloudflare Free plan allows 10 ms of CPU per request, which a Next.js render can't meet.
// Cloudflare serves static asset files *without running the Worker at all* (free and unlimited), so
// every public page that `next build` prerendered is placed there, at the URL it's visited on:
//   .next/server/app/en/overview.html   ->  <assets>/overview/index.html      (served at /overview/)
//   .next/server/app/ja/overview.html   ->  <assets>/ja/overview/index.html   (served at /ja/overview/)
//   .next/server/app/en/news-index.json.body -> <assets>/news-index.json
// Images uploaded in the admin live in the database; they're written out as files too, so /uploads/...
// is a static file instead of a Worker + database read per image.
// Anything not exported here (admin, API routes, unknown URLs) still falls through to the Worker.
import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const root = process.cwd();
// NEXT_DIST_DIR / EXPORT_ASSETS_DIR only matter for testing against a build made elsewhere
const DIST = process.env.NEXT_DIST_DIR ?? ".next";
const APP = path.join(root, DIST, "server", "app");
const ASSETS = path.resolve(root, process.env.EXPORT_ASSETS_DIR ?? path.join(".open-next", "assets"));

// URL scheme (see middleware.ts): English is served unprefixed, Japanese under /ja
const publicPath = (route: string) => (route === "/en" ? "/" : route.startsWith("/en/") ? route.slice(3) : route);

function write(dest: string, data: Buffer | string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, data);
}

function exportPages() {
  if (!fs.existsSync(ASSETS)) throw new Error(`${ASSETS} not found: run opennextjs-cloudflare build first`);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, DIST, "prerender-manifest.json"), "utf8")) as {
    routes: Record<string, unknown>;
  };
  let pages = 0;
  let files = 0;
  for (const route of Object.keys(manifest.routes)) {
    if (route === "/_not-found" || route === "/_global-error") continue; // the Worker renders 404s
    const out = publicPath(route);
    const html = path.join(APP, `${route}.html`);
    const body = path.join(APP, `${route}.body`);
    if (fs.existsSync(html)) {
      write(path.join(ASSETS, out === "/" ? "" : out, "index.html"), fs.readFileSync(html));
      pages++;
    } else if (fs.existsSync(body) && !fs.existsSync(path.join(ASSETS, out))) {
      // Route handlers / metadata files with a fixed body: news-index.json, sitemap.xml, robots.txt
      write(path.join(ASSETS, out), fs.readFileSync(body));
      files++;
    }
  }
  console.log(`export-static: ${pages} pages and ${files} files copied into ${path.relative(root, ASSETS)}`);
  if (pages === 0) throw new Error("No prerendered pages found: did `next build` prerender anything?");
}

async function exportUploads() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("export-static: DATABASE_URL not set, skipping /uploads export");
    return;
  }
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);
  const keys = (await sql`select key from upload_files order by created_at`) as { key: string }[];
  let done = 0;
  let next = 0;
  // A few at a time: each row can be several MB
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < keys.length) {
        const { key } = keys[next++];
        const [row] = (await sql`select encode(data, 'base64') as b64 from upload_files where key = ${key}`) as { b64: string }[];
        if (!row) continue;
        write(path.join(ASSETS, "uploads", key), Buffer.from(row.b64, "base64"));
        done++;
      }
    }),
  );
  console.log(`export-static: ${done} uploaded images written to ${path.relative(root, path.join(ASSETS, "uploads"))}`);
}

exportPages();
exportUploads().catch((e) => {
  console.error(e);
  process.exit(1);
});

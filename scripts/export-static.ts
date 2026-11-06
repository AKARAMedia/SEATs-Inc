// Runs after `opennextjs-cloudflare build`: writes the admin-uploaded images into the Worker's static assets.
//
// Public pages are no longer exported: they are rendered from the database on request and kept in the edge
// cache for a short time (see worker/index.mjs), so an edit shows up without a rebuild.
//
// Why uploads: images uploaded in the admin live in the database. Writing the ones that exist at build time
// out as files makes /uploads/... a static file (no Worker CPU, no database read per image). Images uploaded
// after the build are served by the Worker from the database and cached (worker/index.mjs).
import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const root = process.cwd();
// EXPORT_ASSETS_DIR only matters for testing against a build made elsewhere
const ASSETS = path.resolve(root, process.env.EXPORT_ASSETS_DIR ?? path.join(".open-next", "assets"));

function write(dest: string, data: Buffer | string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, data);
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

exportUploads().catch((e) => {
  console.error(e);
  process.exit(1);
});

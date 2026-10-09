import "server-only";
import * as schema from "./schema";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { neon } from "@neondatabase/serverless";
import { PGlite } from "@electric-sql/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import fs from "node:fs";
import path from "node:path";

// Production: Postgres via DATABASE_URL (Neon). Local dev: embedded PGlite in ./.data
function create() {
  if (process.env.DATABASE_URL) {
    return drizzleNeon(neon(process.env.DATABASE_URL), { schema });
  }
  if (process.env.VERCEL) throw new Error("DATABASE_URL is not set (connect a Neon Postgres database to this Vercel project).");
  // PGLITE_DIR lets a second server (e.g. automated tests) use its own copy: PGlite allows one process per directory
  const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  fs.mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  return drizzlePglite(client, { schema });
}

type DB = ReturnType<typeof drizzleNeon<typeof schema>>;

// Kept on `process` so every copy of this module in the process shares one connection:
// a second PGlite instance on the same directory corrupts it.
const g = process as unknown as { __seatsDb?: DB; __seatsDbReady?: Promise<void> };

// Opened on first use, not on import: Next.js dev loads route modules in short-lived worker processes,
// and a second process opening the same PGlite directory corrupts it.
export const db: DB = new Proxy({} as DB, {
  get(_, prop) {
    const real = (g.__seatsDb ??= create() as DB);
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

// PGlite: apply migrations on first use so `npm run dev` works with zero setup.
export function ready(): Promise<void> {
  if (process.env.DATABASE_URL) return Promise.resolve();
  return (g.__seatsDbReady ??= migratePglite(db as never, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  }));
}

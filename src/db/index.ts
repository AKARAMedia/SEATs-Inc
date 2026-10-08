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
  const dir = path.join(process.cwd(), ".data", "pglite");
  fs.mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  return drizzlePglite(client, { schema });
}

type DB = ReturnType<typeof drizzleNeon<typeof schema>>;

const g = globalThis as unknown as { __db?: DB; __dbReady?: Promise<void> };

export const db: DB = (g.__db ??= create() as DB);

// PGlite: apply migrations on first use so `npm run dev` works with zero setup.
export function ready(): Promise<void> {
  if (process.env.DATABASE_URL) return Promise.resolve();
  return (g.__dbReady ??= migratePglite(db as never, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  }));
}

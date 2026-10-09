// DB client for CLI scripts (mirrors src/db/index.ts without the server-only guard).
import path from "node:path";
import * as schema from "../src/db/schema";

export async function scriptDb() {
  if (process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    const db = drizzle(neon(process.env.DATABASE_URL), { schema });
    await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    return { db, close: async () => {} };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  (await import("node:fs")).mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  return { db: db as unknown as ReturnType<typeof import("drizzle-orm/neon-http").drizzle<typeof schema>>, close: () => client.close() };
}

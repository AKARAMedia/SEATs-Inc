// Build-time check: can we reach the production database at all?
//
// Used by scripts/migrate.ts and scripts/export-static.ts so a deploy still goes through while Neon is
// unavailable (e.g. the free plan's monthly compute allowance is used up and the compute is suspended).
// Without this, `npm run build` dies at the migration step and no code fix (like the error fallbacks) can
// ever be deployed during an outage.
//
// This only answers "is the database reachable?". Once it is reachable, a failing migration is still fatal:
// we never skip a migration that could actually run.
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const PROBE_TIMEOUT_MS = 20_000;

function describe(e: unknown): string {
  if (e instanceof Error) {
    const cause = (e as { cause?: unknown }).cause;
    return cause instanceof Error ? `${e.message} (cause: ${cause.message})` : e.message;
  }
  return String(e);
}

/** null when the database is reachable (or none is configured: local PGlite); otherwise why it isn't. */
export async function databaseUnavailableReason(): Promise<string | null> {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    await Promise.race([
      sql`select 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`no answer after ${PROBE_TIMEOUT_MS / 1000}s`)), PROBE_TIMEOUT_MS).unref()),
    ]);
    return null;
  } catch (e) {
    return describe(e);
  }
}

export function warnSkipped(what: string, reason: string) {
  const line = "!".repeat(78);
  console.warn(
    [
      "",
      line,
      `WARNING: database unreachable, SKIPPING ${what}.`,
      `Reason: ${reason}`,
      "The build continues so code can still be deployed, but the site's database pages will not work",
      "until the database is back (Neon: check the project's usage limits / suspended compute).",
      "Re-deploy once the database is reachable again to apply any pending migrations.",
      line,
      "",
    ].join("\n"),
  );
}

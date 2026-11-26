import "server-only";

/**
 * One-line reason for a failed database call. Drizzle wraps the driver's error in a generic "Failed query: ..."
 * error and keeps the real reason (e.g. Neon's quota / auth / network message) in `cause`, which a plain
 * `console.error(err)` shows only as a stack trace. Walks the cause chain so the real reason is on the first line.
 */
export function errorSummary(err: unknown): string {
  const parts: string[] = [];
  let cur: unknown = err;
  for (let i = 0; i < 5 && cur != null; i++) {
    if (cur instanceof Error) {
      const code = (cur as { code?: unknown }).code;
      // Skip the echoed SQL text of Drizzle's wrapper: it is long and says nothing about why it failed
      const msg = cur.message.startsWith("Failed query:") ? "Failed query" : cur.message;
      parts.push(`${cur.name}: ${msg}${code ? ` [code ${String(code)}]` : ""}`);
      cur = (cur as { cause?: unknown }).cause;
    } else {
      parts.push(String(cur));
      break;
    }
  }
  return parts.join(" <- ");
}

/**
 * Boundary helper for PUBLIC page reads: if the database call fails (e.g. Neon is suspended or over quota),
 * log the real error (it shows up in the Cloudflare Worker logs) and return `fallback` so the rest of the page
 * can still render. The data functions themselves keep throwing; only call this where a degraded page is
 * acceptable. Never use it on admin pages or writes, where a fallback could hide a failure or overwrite data.
 */
export async function safely<T>(label: string, work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch (err) {
    console.error(`[degraded] ${label} failed: ${errorSummary(err)}`);
    return fallback;
  }
}

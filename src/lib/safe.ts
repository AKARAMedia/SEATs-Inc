import "server-only";

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
    console.error(`[degraded] ${label} failed:`, err);
    return fallback;
  }
}

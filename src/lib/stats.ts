import "server-only";
import crypto from "node:crypto";
import { and, desc, gte, inArray, sql } from "drizzle-orm";
import { db, ready } from "@/db";
import { pageViewsDaily, posts, visitorsDaily } from "@/db/schema";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|monitor|curl|wget|python|axios|node-fetch/i;

/** Today (or `d`) as YYYY-MM-DD in Cambodia time. */
export function cambodiaDay(d = new Date()) {
  return new Date(d.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Normalize to the canonical site path ("/ja/overview/"), or null for paths we don't count. */
function normalize(raw: string) {
  if (!raw.startsWith("/") || raw.length > 300) return null;
  let p = raw.split(/[?#]/)[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    return null;
  }
  if (/^\/(admin|api|_next|media|uploads)(\/|$)/.test(p)) return null;
  return p.endsWith("/") ? p : `${p}/`;
}

/**
 * Count one page view. Visitors are counted with a salted hash of IP + browser that changes every
 * day, so nobody can be followed across days and no IP address is stored.
 */
export async function recordPageView({ path, ip, ua }: { path: string; ip: string; ua: string }) {
  const p = normalize(path);
  if (!p || !ua || BOT.test(ua)) return;
  await ready();
  const day = cambodiaDay();
  const salt = process.env.SESSION_SECRET ?? "dev-salt";
  const hash = crypto.createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("base64url").slice(0, 22);
  await db
    .insert(pageViewsDaily)
    .values({ day, path: p, views: 1 })
    .onConflictDoUpdate({ target: [pageViewsDaily.day, pageViewsDaily.path], set: { views: sql`${pageViewsDaily.views} + 1` } });
  await db.insert(visitorsDaily).values({ day, hash }).onConflictDoNothing();
}

export type DayStat = { day: string; views: number; visitors: number };

/** Views and visitors for each of the last `days` days (oldest first, zero-filled). */
export async function dailyStats(days = 30): Promise<DayStat[]> {
  await ready();
  const from = cambodiaDay(new Date(Date.now() - (days - 1) * 86400000));
  const [views, visitors] = await Promise.all([
    db
      .select({ day: pageViewsDaily.day, n: sql<number>`sum(${pageViewsDaily.views})::int` })
      .from(pageViewsDaily)
      .where(gte(pageViewsDaily.day, from))
      .groupBy(pageViewsDaily.day),
    db
      .select({ day: visitorsDaily.day, n: sql<number>`count(*)::int` })
      .from(visitorsDaily)
      .where(gte(visitorsDaily.day, from))
      .groupBy(visitorsDaily.day),
  ]);
  const v = new Map(views.map((r) => [r.day, Number(r.n)]));
  const u = new Map(visitors.map((r) => [r.day, Number(r.n)]));
  return Array.from({ length: days }, (_, i) => {
    const day = cambodiaDay(new Date(Date.now() - (days - 1 - i) * 86400000));
    return { day, views: v.get(day) ?? 0, visitors: u.get(day) ?? 0 };
  });
}

/** Most viewed paths in the last `days` days, with news post titles resolved. */
export async function topPages(days = 30, limit = 8) {
  await ready();
  const from = cambodiaDay(new Date(Date.now() - (days - 1) * 86400000));
  const rows = await db
    .select({ path: pageViewsDaily.path, views: sql<number>`sum(${pageViewsDaily.views})::int` })
    .from(pageViewsDaily)
    .where(gte(pageViewsDaily.day, from))
    .groupBy(pageViewsDaily.path)
    .orderBy(desc(sql`sum(${pageViewsDaily.views})`))
    .limit(50);

  const slugOf = (path: string) => path.replace(/^\/ja\//, "/").replace(/^\/|\/$/g, "");
  const slugs = [...new Set(rows.map((r) => slugOf(r.path)).filter(Boolean))];
  const found = slugs.length
    ? await db.select({ slug: posts.slug, titleEn: posts.titleEn, id: posts.id }).from(posts).where(and(inArray(posts.slug, slugs)))
    : [];
  const bySlug = new Map(found.map((p) => [p.slug, p]));
  const withTitles = rows.map((r) => ({ ...r, views: Number(r.views), post: bySlug.get(slugOf(r.path)) ?? null }));

  // Pages: EN and JP versions combined; news posts listed separately
  const combine = (list: typeof withTitles) => {
    const m = new Map<string, { key: string; views: number; post: (typeof withTitles)[number]["post"] }>();
    for (const r of list) {
      const key = r.path.replace(/^\/ja\//, "/");
      const e = m.get(key) ?? { key, views: 0, post: r.post };
      e.views += r.views;
      m.set(key, e);
    }
    return [...m.values()].sort((a, b) => b.views - a.views).slice(0, limit);
  };
  return { pages: combine(withTitles.filter((r) => !r.post)), posts: combine(withTitles.filter((r) => r.post)) };
}

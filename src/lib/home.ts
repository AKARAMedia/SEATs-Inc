import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, asc, eq, inArray, lte } from "drizzle-orm";
import { db, ready } from "@/db";
import { brands, categories, homeBanners, homeSlides, posts } from "@/db/schema";
import type { Lang } from "@/lib/i18n";
import { listNews, localize, NEWS_TAG, type NewsItem } from "@/lib/news";

export const HOME_TAG = "home";

type Scheduled = { startsAt: Date | null; endsAt: Date | null };

const showing = (now: Date) => (r: Scheduled) => (!r.startsAt || r.startsAt <= now) && (!r.endsAt || r.endsAt > now);

/** Cache until the next start/end date (if within a day), so scheduled items switch on time. */
function scheduleLife(rows: Scheduled[], now: Date) {
  const next = rows
    .flatMap((r) => [r.startsAt, r.endsAt])
    .filter((d): d is Date => !!d && d > now)
    .sort((a, b) => a.getTime() - b.getTime())[0];
  const secs = next ? Math.ceil((next.getTime() - now.getTime()) / 1000) + 5 : Infinity;
  if (secs < 86400) cacheLife({ stale: 60, revalidate: Math.max(60, secs), expire: 86400 * 7 });
  else cacheLife("days");
}

export async function getBrands() {
  "use cache";
  cacheLife("days");
  cacheTag(HOME_TAG);
  await ready();
  return db.select().from(brands).where(eq(brands.visible, true)).orderBy(asc(brands.sortOrder), asc(brands.id));
}

export async function getHomeSlides() {
  "use cache";
  cacheTag(HOME_TAG);
  await ready();
  const rows = await db.select().from(homeSlides).where(eq(homeSlides.visible, true)).orderBy(asc(homeSlides.sortOrder), asc(homeSlides.id));
  const now = new Date();
  scheduleLife(rows, now);
  return rows.filter(showing(now));
}

export async function getHomeBanners() {
  "use cache";
  cacheTag(HOME_TAG);
  await ready();
  const rows = await db.select().from(homeBanners).where(eq(homeBanners.visible, true)).orderBy(asc(homeBanners.sortOrder), asc(homeBanners.id));
  const now = new Date();
  scheduleLife(rows, now);
  return rows.filter(showing(now));
}

/** Home page news: pinned posts first (when live), then the latest, 3 in total. */
export async function homeNews(lang: Lang, pinnedIds: number[]): Promise<NewsItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(NEWS_TAG, HOME_TAG);
  await ready();
  const now = new Date();
  const pinned = pinnedIds.length
    ? await db
        .select()
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(and(inArray(posts.id, pinnedIds), eq(posts.published, true), lte(posts.publishedAt, now)))
    : [];
  const ordered = pinnedIds.map((id) => pinned.find((p) => p.posts.id === id)).filter((p) => !!p);
  const pinnedItems = ordered.map((r) => localize(r.posts, r.categories, lang));
  const { items: latest } = await listNews(lang, { limit: 3 + pinnedItems.length });
  const seen = new Set(pinnedItems.map((p) => p.slug));
  return [...pinnedItems, ...latest.filter((i) => !seen.has(i.slug))].slice(0, 3);
}


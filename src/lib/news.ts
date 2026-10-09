import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, count, desc, eq, gt, ilike, lte, min, or } from "drizzle-orm";
import { db, ready } from "@/db";
import { categories, posts, type Category, type Post } from "@/db/schema";
import type { Lang } from "@/lib/i18n";

export const NEWS_TAG = "news";
export const PAGE_SIZE = 12;

export type NewsItem = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  imageUrl: string | null;
  publishedAt: string; // ISO
  category: { slug: string; name: string } | null;
};

export function localize(p: Post, c: Category | null, lang: Lang): NewsItem {
  const ja = lang === "ja";
  return {
    slug: p.slug,
    // Fall back to English when a JP translation hasn't been entered yet
    title: (ja && p.titleJa) || p.titleEn,
    excerpt: (ja && p.excerptJa) || p.excerptEn,
    body: (ja && p.bodyJa) || p.bodyEn,
    imageUrl: p.imageUrl,
    publishedAt: p.publishedAt.toISOString(),
    category: c ? { slug: c.slug, name: ja ? c.nameJa : c.nameEn } : null,
  };
}

/** Published and not scheduled for later. */
const live = () => and(eq(posts.published, true), lte(posts.publishedAt, new Date()));

/**
 * Cache lifetime for news data: normally "hours", but when a scheduled post goes live within the
 * hour, refresh just after that moment so it appears on time without anyone clicking anything.
 */
async function newsLife() {
  const [next] = await db
    .select({ at: min(posts.publishedAt) })
    .from(posts)
    .where(and(eq(posts.published, true), gt(posts.publishedAt, new Date())));
  const secs = next?.at ? Math.ceil((new Date(next.at).getTime() - Date.now()) / 1000) + 5 : Infinity;
  if (secs < 3600) cacheLife({ stale: 60, revalidate: Math.max(60, secs), expire: 86400 });
  else cacheLife("hours");
}

export async function listNews(lang: Lang, opts: { page?: number; category?: string; q?: string; limit?: number } = {}) {
  "use cache";
  cacheTag(NEWS_TAG);
  await ready();
  await newsLife();
  const limit = opts.limit ?? PAGE_SIZE;
  const page = Math.max(1, opts.page ?? 1);
  const where = and(
    live(),
    opts.category ? eq(categories.slug, opts.category) : undefined,
    opts.q
      ? or(
          ilike(posts.titleEn, `%${opts.q}%`),
          ilike(posts.titleJa, `%${opts.q}%`),
          ilike(posts.bodyEn, `%${opts.q}%`),
          ilike(posts.bodyJa, `%${opts.q}%`),
        )
      : undefined,
  );
  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(where)
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ total: count() }).from(posts).leftJoin(categories, eq(posts.categoryId, categories.id)).where(where),
  ]);
  return {
    items: rows.map((r) => localize(r.posts, r.categories, lang)),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getNews(lang: Lang, slug: string) {
  "use cache";
  cacheTag(NEWS_TAG);
  await ready();
  await newsLife();
  const [row] = await db
    .select()
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.slug, slug), live()));
  if (!row) return null;
  return localize(row.posts, row.categories, lang);
}

export async function listCategories(lang: Lang) {
  "use cache";
  cacheLife("hours");
  cacheTag(NEWS_TAG);
  await ready();
  const rows = await db.select().from(categories).orderBy(categories.sortOrder);
  return rows.map((c) => ({ slug: c.slug, name: lang === "ja" ? c.nameJa : c.nameEn }));
}

export async function allNewsSlugs() {
  "use cache";
  cacheTag(NEWS_TAG);
  await ready();
  await newsLife();
  return db.select({ slug: posts.slug }).from(posts).where(live());
}

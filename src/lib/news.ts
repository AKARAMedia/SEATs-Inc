import "server-only";
import { cache } from "react";
import { and, count, desc, eq, ilike, lte, or } from "drizzle-orm";
import { db, ready } from "@/db";
import { categories, posts, type Category, type Post } from "@/db/schema";
import type { Lang } from "@/lib/i18n";

export const NEWS_TAG = "news";
export const PAGE_SIZE = 9;

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

export async function listNews(lang: Lang, opts: { page?: number; category?: string; q?: string; limit?: number } = {}) {
  await ready();
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
  // Cards only ever show title/excerpt/image (see NewsCard.tsx) — skip the (often large) body
  // columns here so listing up to 1000 posts doesn't transfer and serialize their full HTML.
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        slug: posts.slug,
        titleEn: posts.titleEn,
        titleJa: posts.titleJa,
        excerptEn: posts.excerptEn,
        excerptJa: posts.excerptJa,
        imageUrl: posts.imageUrl,
        publishedAt: posts.publishedAt,
        categorySlug: categories.slug,
        categoryNameEn: categories.nameEn,
        categoryNameJa: categories.nameJa,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(where)
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ total: count() }).from(posts).leftJoin(categories, eq(posts.categoryId, categories.id)).where(where),
  ]);
  const ja = lang === "ja";
  return {
    items: rows.map((r): NewsItem => ({
      slug: r.slug,
      title: (ja && r.titleJa) || r.titleEn,
      excerpt: (ja && r.excerptJa) || r.excerptEn,
      body: "", // not needed for list views; fetch the single post (getNews) for full body
      imageUrl: r.imageUrl,
      publishedAt: r.publishedAt.toISOString(),
      category: r.categorySlug ? { slug: r.categorySlug, name: (ja ? r.categoryNameJa : r.categoryNameEn) ?? "" } : null,
    })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export const getNews = cache(async function getNews(lang: Lang, slug: string) {
  await ready();
  const [row] = await db
    .select()
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.slug, slug), live()));
  if (!row) return null;
  return localize(row.posts, row.categories, lang);
});

export async function listCategories(lang: Lang) {
  await ready();
  const rows = await db.select().from(categories).orderBy(categories.sortOrder);
  return rows.map((c) => ({ slug: c.slug, name: lang === "ja" ? c.nameJa : c.nameEn }));
}

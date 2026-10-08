import "server-only";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db, ready } from "@/db";
import { categories, contactMessages, posts } from "@/db/schema";
import { requireAdmin } from "./auth";

// Uncached reads for the admin panel (always fresh, always auth-checked)

export async function adminListPosts({ q, page = 1, status }: { q?: string; page?: number; status?: string }) {
  await requireAdmin();
  await ready();
  const size = 25;
  const where = and(
    q ? or(ilike(posts.titleEn, `%${q}%`), ilike(posts.titleJa, `%${q}%`), ilike(posts.slug, `%${q}%`)) : undefined,
    status === "draft" ? eq(posts.published, false) : status === "published" ? eq(posts.published, true) : undefined,
  );
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: posts.id,
        slug: posts.slug,
        titleEn: posts.titleEn,
        titleJa: posts.titleJa,
        bodyJa: posts.bodyJa,
        imageUrl: posts.imageUrl,
        published: posts.published,
        publishedAt: posts.publishedAt,
        category: categories.nameEn,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(where)
      .orderBy(desc(posts.publishedAt))
      .limit(size)
      .offset((page - 1) * size),
    db.select({ total: count() }).from(posts).where(where),
  ]);
  return {
    rows: rows.map(({ bodyJa, ...r }) => ({ ...r, jaComplete: !!r.titleJa && !!bodyJa })),
    total,
    pages: Math.max(1, Math.ceil(total / size)),
  };
}

export async function adminGetPost(id: number) {
  await requireAdmin();
  await ready();
  const [row] = await db.select().from(posts).where(eq(posts.id, id));
  return row ?? null;
}

export async function adminCategories() {
  await requireAdmin();
  await ready();
  return db.select({ id: categories.id, nameEn: categories.nameEn }).from(categories).orderBy(categories.sortOrder);
}

export async function adminMessages() {
  await requireAdmin();
  await ready();
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
}

/** Date → "yyyy-MM-ddTHH:mm" in Cambodia time for <input type="datetime-local"> */
export function toLocalInput(d: Date) {
  const shifted = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

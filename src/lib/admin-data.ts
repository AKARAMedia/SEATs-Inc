import "server-only";
import { and, asc, count, desc, eq, gt, ilike, or } from "drizzle-orm";
import { db, ready } from "@/db";
import { adminSessions, adminUsers, categories, contactMessages, posts } from "@/db/schema";
import { requireAdmin } from "./auth";

// Uncached reads for the admin panel (always fresh, always auth-checked)

export async function adminListPosts({ q, page = 1, status }: { q?: string; page?: number; status?: string }) {
  await requireAdmin("viewPosts");
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
  await requireAdmin("viewPosts");
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
  await requireAdmin("messages");
  await ready();
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
}

const userColumns = {
  id: adminUsers.id,
  email: adminUsers.email,
  name: adminUsers.name,
  role: adminUsers.role,
  active: adminUsers.active,
  lastLoginAt: adminUsers.lastLoginAt,
  createdAt: adminUsers.createdAt,
};

export async function adminUsersList() {
  await requireAdmin("users");
  await ready();
  return db.select(userColumns).from(adminUsers).orderBy(asc(adminUsers.createdAt));
}

export async function adminGetUser(id: number) {
  await requireAdmin("users");
  await ready();
  const [row] = await db.select(userColumns).from(adminUsers).where(eq(adminUsers.id, id));
  return row ?? null;
}

/** Signed-in browsers of a user, newest first. */
export async function adminUserSessions(userId: number) {
  await requireAdmin();
  await ready();
  return db
    .select({ id: adminSessions.id, userAgent: adminSessions.userAgent, ip: adminSessions.ip, createdAt: adminSessions.createdAt, lastSeenAt: adminSessions.lastSeenAt })
    .from(adminSessions)
    .where(and(eq(adminSessions.userId, userId), gt(adminSessions.expiresAt, new Date())))
    .orderBy(desc(adminSessions.lastSeenAt));
}

/** "Chrome on Windows" from a user-agent string. */
export function describeDevice(ua: string) {
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

export function fmtDateTime(d: Date | null) {
  return d ? d.toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh", dateStyle: "medium", timeStyle: "short" }) : "Never";
}

/** Date → "yyyy-MM-ddTHH:mm" in Cambodia time for <input type="datetime-local"> */
export function toLocalInput(d: Date) {
  const shifted = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

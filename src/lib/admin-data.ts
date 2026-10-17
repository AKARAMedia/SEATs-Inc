import "server-only";
import { redirect } from "next/navigation";
import { and, asc, count, desc, eq, gt, ilike, isNotNull, isNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db, ready } from "@/db";
import { adminSessions, adminUsers, categories, contactMessages, posts, siteSettings } from "@/db/schema";
import { parseGroup, SETTINGS_GROUPS, type Settings } from "./settings-schema";
import { requireAdmin } from "./auth";
import { can } from "./permissions";

// Uncached reads for the admin panel (always fresh, always auth-checked)

export async function adminListPosts({ q, page = 1, status }: { q?: string; page?: number; status?: string }) {
  await requireAdmin("viewPosts");
  await ready();
  const size = 25;
  const where = and(
    q ? or(ilike(posts.titleEn, `%${q}%`), ilike(posts.titleJa, `%${q}%`), ilike(posts.slug, `%${q}%`)) : undefined,
    status === "draft"
      ? eq(posts.published, false)
      : status === "published"
        ? and(eq(posts.published, true), lte(posts.publishedAt, new Date()))
        : status === "scheduled"
          ? and(eq(posts.published, true), gt(posts.publishedAt, new Date()))
        : status === "missingja"
          ? or(eq(posts.titleJa, ""), eq(posts.bodyJa, ""))
          : undefined,
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

export type MessageView = "inbox" | "unread" | "archived" | "all";
export type MessageFilter = { view?: MessageView; q?: string; lang?: string };

function messageWhere({ view = "inbox", q, lang }: MessageFilter): SQL | undefined {
  const m = contactMessages;
  return and(
    view === "archived" ? isNotNull(m.archivedAt) : view === "all" ? undefined : isNull(m.archivedAt),
    view === "unread" ? isNull(m.readAt) : undefined,
    lang === "en" || lang === "ja" ? eq(m.lang, lang) : undefined,
    q ? or(ilike(m.name, `%${q}%`), ilike(m.email, `%${q}%`), ilike(m.subject, `%${q}%`), ilike(m.message, `%${q}%`)) : undefined,
  );
}

export async function adminMessages(filter: MessageFilter & { page?: number }) {
  await requireAdmin("messages");
  await ready();
  const size = 25;
  const page = Math.max(1, filter.page ?? 1);
  const where = messageWhere(filter);
  const [rows, [{ total }], counts] = await Promise.all([
    db.select().from(contactMessages).where(where).orderBy(desc(contactMessages.createdAt)).limit(size).offset((page - 1) * size),
    db.select({ total: count() }).from(contactMessages).where(where),
    messageCounts(),
  ]);
  return { rows, total, pages: Math.max(1, Math.ceil(total / size)), counts };
}

/** All messages matching a filter, for export. */
export async function adminExportMessages(filter: MessageFilter) {
  await requireAdmin("messages");
  await ready();
  return db.select().from(contactMessages).where(messageWhere(filter)).orderBy(desc(contactMessages.createdAt));
}

export async function messageCounts() {
  const m = contactMessages;
  const [[inbox], [unread], [archived]] = await Promise.all([
    db.select({ n: count() }).from(m).where(isNull(m.archivedAt)),
    db.select({ n: count() }).from(m).where(and(isNull(m.archivedAt), isNull(m.readAt))),
    db.select({ n: count() }).from(m).where(isNotNull(m.archivedAt)),
  ]);
  return { inbox: inbox.n, unread: unread.n, archived: archived.n };
}

export async function unreadMessageCount() {
  await ready();
  const [{ n }] = await db
    .select({ n: count() })
    .from(contactMessages)
    .where(and(isNull(contactMessages.archivedAt), isNull(contactMessages.readAt)));
  return n;
}

export async function adminGetMessage(id: number) {
  await requireAdmin("messages");
  await ready();
  const [row] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
  if (!row) return null;
  // Neighbours in the inbox for previous/next navigation (newer = previous)
  const [[newer], [older]] = await Promise.all([
    db
      .select({ id: contactMessages.id })
      .from(contactMessages)
      .where(and(gt(contactMessages.createdAt, row.createdAt), row.archivedAt ? isNotNull(contactMessages.archivedAt) : isNull(contactMessages.archivedAt)))
      .orderBy(asc(contactMessages.createdAt))
      .limit(1),
    db
      .select({ id: contactMessages.id })
      .from(contactMessages)
      .where(
        and(
          sql`${contactMessages.createdAt} < ${row.createdAt}`,
          ne(contactMessages.id, row.id),
          row.archivedAt ? isNotNull(contactMessages.archivedAt) : isNull(contactMessages.archivedAt),
        ),
      )
      .orderBy(desc(contactMessages.createdAt))
      .limit(1),
  ]);
  return { ...row, newerId: newer?.id ?? null, olderId: older?.id ?? null };
}

/** Numbers and lists for the dashboard home. */
export async function adminDashboard() {
  await requireAdmin();
  await ready();
  const [[pub], [drafts], [missingJa], recentPosts, recentMessages, counts] = await Promise.all([
    db.select({ n: count() }).from(posts).where(eq(posts.published, true)),
    db.select({ n: count() }).from(posts).where(eq(posts.published, false)),
    db.select({ n: count() }).from(posts).where(or(eq(posts.titleJa, ""), eq(posts.bodyJa, ""))),
    db
      .select({ id: posts.id, titleEn: posts.titleEn, published: posts.published, updatedAt: posts.updatedAt })
      .from(posts)
      .orderBy(desc(posts.updatedAt))
      .limit(5),
    db.select().from(contactMessages).where(isNull(contactMessages.archivedAt)).orderBy(desc(contactMessages.createdAt)).limit(5),
    messageCounts(),
  ]);
  return { published: pub.n, drafts: drafts.n, missingJa: missingJa.n, recentPosts, recentMessages, unread: counts.unread };
}

/** Settings straight from the DB (uncached), with when each group was last saved. */
export async function adminSettings() {
  await requireAdmin("settings");
  await ready();
  const rows = await db.select().from(siteSettings);
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const values = Object.fromEntries(SETTINGS_GROUPS.map((k) => [k, parseGroup(k, byKey.get(k)?.value)])) as Settings;
  const updatedAt = Object.fromEntries(rows.map((r) => [r.key, r.updatedAt])) as Partial<Record<keyof Settings, Date>>;
  return { values, updatedAt };
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

/** Signed-in browsers of a user, newest first. Callable for your own id (account/page.tsx) by any
 * role, or for anyone's id if you hold the "users" permission (users/[id]/page.tsx) — mirroring the
 * "users" check its only other caller, adminGetUser, already enforces before this ever runs there. */
export async function adminUserSessions(userId: number) {
  const session = await requireAdmin();
  if (session.id !== userId && !can(session.role, "users")) redirect("/admin/?flash=forbidden");
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

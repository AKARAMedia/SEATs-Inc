"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, ready } from "@/db";
import { posts, translationItems, type Post } from "@/db/schema";
import { ensureBaseline, getVersion, logActivity, saveVersion } from "@/lib/activity";
import type { Session } from "@/lib/auth";
import { htmlText } from "@/lib/translation/text";
import { login, logout, requireAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { NEWS_TAG } from "@/lib/news";
import { sanitizeBody, slugify, stripTags } from "@/lib/sanitize";

export type FormState = { error?: string; fieldErrors?: Record<string, string>; ok?: string } | undefined;

// ---------- auth ----------

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const result = await login(email, password);
  if (!result.ok) return { error: result.error };
  await logActivity({ id: result.user.id, name: result.user.name, email: result.user.email }, "user.login");
  redirect("/admin/");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login/");
}

// ---------- posts ----------

const PostInput = z.object({
  id: z.coerce.number().int().positive().optional(),
  titleEn: z.string().trim().min(1, "English title is required").max(300),
  titleJa: z.string().trim().max(300).default(""),
  excerptEn: z.string().trim().max(1000).default(""),
  excerptJa: z.string().trim().max(1000).default(""),
  bodyEn: z.string().default(""),
  bodyJa: z.string().default(""),
  slug: z.string().trim().max(120).default(""),
  categoryId: z.coerce.number().int().positive().nullable().catch(null),
  imageUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//.test(v), "Invalid image URL")
    .default(""),
  publishedAt: z.string().min(1, "Date is required"),
  published: z.boolean(),
});

const TranslationInput = z.object({
  id: z.coerce.number().int().positive(),
  titleJa: z.string().trim().max(300).default(""),
  excerptJa: z.string().trim().max(1000).default(""),
  bodyJa: z.string().default(""),
});

/**
 * After any change to a post: keep a version, log it, and if the Japanese was edited directly
 * (not via the Translation Center) drop the translation draft so it is rebuilt from the live text.
 */
async function afterPostChange(id: number, prev: Post | undefined, who: Session, action: string, note = "") {
  const [cur] = await db.select().from(posts).where(eq(posts.id, id));
  if (!cur) return;
  await ensureBaseline(`post:${id}`, prev);
  await saveVersion(`post:${id}`, cur, who, note);
  // Compare visible text: re-saving through the editor reformats HTML without changing the words
  const jaChanged = prev && (prev.titleJa !== cur.titleJa || prev.excerptJa !== cur.excerptJa || htmlText(prev.bodyJa) !== htmlText(cur.bodyJa));
  if (jaChanged) {
    await db.delete(translationItems).where(eq(translationItems.key, `post:${id}`));
  }
  await logActivity(who, action, { type: "post", id, summary: cur.titleEn });
}

async function getPost(id: number | undefined) {
  if (!id) return undefined;
  const [row] = await db.select().from(posts).where(eq(posts.id, id));
  return row;
}

export async function savePostAction(_: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin("viewPosts");
  await ready();
  const raw = Object.fromEntries(formData);

  // Translators may only change the Japanese fields of an existing post
  if (!can(session.role, "editPosts")) {
    const t = TranslationInput.safeParse(raw);
    if (!t.success) return { error: "Invalid input." };
    const bodyJa = sanitizeBody(t.data.bodyJa);
    const prev = await getPost(t.data.id);
    await db
      .update(posts)
      .set({
        titleJa: t.data.titleJa,
        excerptJa: t.data.excerptJa || stripTags(bodyJa).slice(0, 120),
        bodyJa,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, t.data.id));
    await afterPostChange(t.data.id, prev, session, "post.translate", "Japanese edited");
    updateTag(NEWS_TAG);
    redirect(`/admin/posts/${t.data.id}/?flash=saved`);
  }

  const parsed = PostInput.safeParse({
    ...raw,
    id: raw.id || undefined,
    categoryId: raw.categoryId || null,
    published: raw.published === "on",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const d = parsed.data;

  const slug = slugify(d.slug || d.titleEn) || `post-${Date.now()}`;
  const clash = await db
    .select({ id: posts.id })
    .from(posts)
    .where(d.id ? and(eq(posts.slug, slug), ne(posts.id, d.id)) : eq(posts.slug, slug));
  if (clash.length) return { error: "That URL slug is already used by another post.", fieldErrors: { slug: "Slug already in use" } };

  // Datetime-local input is entered in Cambodia time (UTC+7)
  const publishedAt = new Date(d.publishedAt.length === 16 ? `${d.publishedAt}:00+07:00` : d.publishedAt);
  if (Number.isNaN(publishedAt.getTime())) return { fieldErrors: { publishedAt: "Invalid date" }, error: "Invalid date." };

  const bodyEn = sanitizeBody(d.bodyEn);
  const bodyJa = sanitizeBody(d.bodyJa);
  const values = {
    slug,
    titleEn: d.titleEn,
    titleJa: d.titleJa,
    // Auto-fill excerpts from the body when left blank
    excerptEn: d.excerptEn || stripTags(bodyEn).slice(0, 300),
    excerptJa: d.excerptJa || stripTags(bodyJa).slice(0, 120),
    bodyEn,
    bodyJa,
    categoryId: d.categoryId,
    imageUrl: d.imageUrl || null,
    publishedAt,
    published: d.published,
    updatedAt: new Date(),
  };

  let id = d.id;
  const prev = await getPost(id);
  if (id) {
    await db.update(posts).set(values).where(eq(posts.id, id));
  } else {
    [{ id }] = await db.insert(posts).values(values).returning({ id: posts.id });
  }
  await afterPostChange(id!, prev, session, d.id ? "post.update" : "post.create");
  updateTag(NEWS_TAG);
  redirect(`/admin/posts/${id}/?flash=${d.id ? "saved" : "created"}`);
}

export async function deletePostAction(formData: FormData) {
  const who = await requireAdmin("editPosts");
  await ready();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    const [row] = await db.delete(posts).where(eq(posts.id, id)).returning();
    await db.delete(translationItems).where(eq(translationItems.key, `post:${id}`));
    // Versions are kept, so a deleted post can still be recovered from the database if needed
    if (row) await logActivity(who, "post.delete", { type: "post", id, summary: row.titleEn });
  }
  updateTag(NEWS_TAG);
  redirect("/admin/posts/?flash=deleted");
}

export async function togglePublishAction(formData: FormData) {
  const who = await requireAdmin("editPosts");
  await ready();
  const id = Number(formData.get("id"));
  const published = formData.get("published") === "true";
  if (Number.isInteger(id)) {
    const prev = await getPost(id);
    await db.update(posts).set({ published, updatedAt: new Date() }).where(eq(posts.id, id));
    await afterPostChange(id, prev, who, published ? "post.publish" : "post.unpublish");
  }
  updateTag(NEWS_TAG);
}

/** Put a post back to how it was in an earlier version (the current state is kept as a version too). */
export async function restorePostVersionAction(formData: FormData) {
  const who = await requireAdmin("editPosts");
  await ready();
  const id = Number(formData.get("id"));
  const versionId = Number(formData.get("versionId"));
  const v = await getVersion(`post:${id}`, versionId);
  const prev = await getPost(id);
  if (!v || !prev) redirect(`/admin/posts/${id}/`);
  const d = v.data as Post;
  // Keep the current slug if the old one is now used by another post
  const [clash] = await db.select({ id: posts.id }).from(posts).where(and(eq(posts.slug, d.slug), ne(posts.id, id)));
  await db
    .update(posts)
    .set({
      slug: clash ? prev.slug : d.slug,
      titleEn: d.titleEn,
      titleJa: d.titleJa,
      excerptEn: d.excerptEn,
      excerptJa: d.excerptJa,
      bodyEn: d.bodyEn,
      bodyJa: d.bodyJa,
      categoryId: d.categoryId,
      imageUrl: d.imageUrl,
      published: d.published,
      publishedAt: new Date(d.publishedAt),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));
  await afterPostChange(id, prev, who, "post.restore", `Restored version from ${new Date(v.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh" })}`);
  updateTag(NEWS_TAG);
  redirect(`/admin/posts/${id}/?flash=restored`);
}

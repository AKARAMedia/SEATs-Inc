"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, ready } from "@/db";
import { contactMessages, posts } from "@/db/schema";
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

export async function savePostAction(_: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin("viewPosts");
  await ready();
  const raw = Object.fromEntries(formData);

  // Translators may only change the Japanese fields of an existing post
  if (!can(session.role, "editPosts")) {
    const t = TranslationInput.safeParse(raw);
    if (!t.success) return { error: "Invalid input." };
    const bodyJa = sanitizeBody(t.data.bodyJa);
    await db
      .update(posts)
      .set({
        titleJa: t.data.titleJa,
        excerptJa: t.data.excerptJa || stripTags(bodyJa).slice(0, 120),
        bodyJa,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, t.data.id));
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
  if (id) {
    await db.update(posts).set(values).where(eq(posts.id, id));
  } else {
    [{ id }] = await db.insert(posts).values(values).returning({ id: posts.id });
  }
  updateTag(NEWS_TAG);
  redirect(`/admin/posts/${id}/?flash=${d.id ? "saved" : "created"}`);
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin("editPosts");
  await ready();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await db.delete(posts).where(eq(posts.id, id));
  updateTag(NEWS_TAG);
  redirect("/admin/?flash=deleted");
}

export async function togglePublishAction(formData: FormData) {
  await requireAdmin("editPosts");
  await ready();
  const id = Number(formData.get("id"));
  const published = formData.get("published") === "true";
  if (Number.isInteger(id)) await db.update(posts).set({ published, updatedAt: new Date() }).where(eq(posts.id, id));
  updateTag(NEWS_TAG);
}

// ---------- contact messages ----------

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin("messages");
  await ready();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await db.delete(contactMessages).where(eq(contactMessages.id, id));
  redirect("/admin/messages/?flash=msgDeleted");
}

import { boolean, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameJa: text("name_ja").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    titleEn: text("title_en").notNull(),
    titleJa: text("title_ja").notNull().default(""),
    excerptEn: text("excerpt_en").notNull().default(""),
    excerptJa: text("excerpt_ja").notNull().default(""),
    // Sanitized HTML
    bodyEn: text("body_en").notNull().default(""),
    bodyJa: text("body_ja").notNull().default(""),
    imageUrl: text("image_url"),
    published: boolean("published").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    // Original WordPress post id, kept for import idempotency / redirects
    wpId: integer("wp_id"),
  },
  (t) => [uniqueIndex("posts_slug_idx").on(t.slug), index("posts_published_at_idx").on(t.publishedAt)],
);

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull(),
  lang: text("lang").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;

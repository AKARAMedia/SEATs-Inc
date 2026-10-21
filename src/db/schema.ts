import { boolean, customType, date, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer | Uint8Array | string }>({
  dataType: () => "bytea",
  fromDriver: (v) => (typeof v === "string" ? Buffer.from(v.replace(/^\\x/, ""), "hex") : Buffer.from(v)),
});

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

export const ROLES = ["admin", "editor", "translator"] as const;
export type Role = (typeof ROLES)[number];

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<Role>().notNull().default("admin"),
  active: boolean("active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// One row per signed-in browser; deleting it ends that session immediately.
export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    userAgent: text("user_agent").notNull().default(""),
    ip: text("ip").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("admin_sessions_user_idx").on(t.userId)],
);

// Failed sign-in attempts, keyed by "email:<addr>" and "ip:<addr>", for lockout.
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("login_attempts_key_idx").on(t.key, t.createdAt)],
);

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull(),
  lang: text("lang").notNull().default("en"),
  readAt: timestamp("read_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Admin-editable site settings, one JSON document per group (company, social, seo, contact, maintenance)
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Cookie-less visitor stats: page views per day and path…
export const pageViewsDaily = pgTable(
  "page_views_daily",
  {
    day: date("day").notNull(),
    path: text("path").notNull(),
    views: integer("views").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.day, t.path] })],
);

// …and one row per visitor per day, identified only by a salted daily hash (no IPs stored)
export const visitorsDaily = pgTable(
  "visitors_daily",
  {
    day: date("day").notNull(),
    hash: text("hash").notNull(),
  },
  (t) => [primaryKey({ columns: [t.day, t.hash] })],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;

// ---------- Translation Center ----------

/** One translatable thing (a post, a settings group, the categories) and its paragraph-aligned JA draft. */
export const translationItems = pgTable("translation_items", {
  key: text("key").primaryKey(), // "post:12", "settings:company", "categories"
  // Ordered rows: [{ group, src, srcHash, target, auto }] aligned to the English at last save
  segments: jsonb("segments").notNull().default([]),
  // Draft differs from what is live on the Japanese site
  dirty: boolean("dirty").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  updatedBy: text("updated_by").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Every confirmed English → Japanese pair, keyed by a hash of the normalized English text. */
export const translationMemory = pgTable("translation_memory", {
  sourceHash: text("source_hash").primaryKey(),
  sourceText: text("source_text").notNull(),
  target: text("target").notNull(),
  uses: integer("uses").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const glossary = pgTable("glossary", {
  id: serial("id").primaryKey(),
  termEn: text("term_en").notNull(),
  termJa: text("term_ja").notNull(),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Activity log & version history ----------

export const activityLog = pgTable(
  "activity_log",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    userName: text("user_name").notNull().default(""),
    action: text("action").notNull(), // "post.update", "settings.update", …
    targetType: text("target_type").notNull().default(""),
    targetId: text("target_id").notNull().default(""),
    summary: text("summary").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activity_log_created_idx").on(t.createdAt)],
);

/** Snapshots taken on every save, for compare/restore. */
export const versions = pgTable(
  "versions",
  {
    id: serial("id").primaryKey(),
    entity: text("entity").notNull(), // "post:12", "settings:company"
    data: jsonb("data").notNull(),
    userName: text("user_name").notNull().default(""),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("versions_entity_idx").on(t.entity, t.createdAt)],
);

// ---------- Media library & home page ----------

/** Images uploaded through the admin (site images shipped in public/media are listed from a manifest). */
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  filename: text("filename").notNull().default(""),
  contentType: text("content_type").notNull().default(""),
  width: integer("width").notNull().default(0),
  height: integer("height").notNull().default(0),
  size: integer("size").notNull().default(0),
  alt: text("alt").notNull().default(""),
  uploadedBy: text("uploaded_by").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Bytes of admin-uploaded images where there is no filesystem or blob store (Cloudflare Workers). Served at /uploads/<key>. */
export const uploadFiles = pgTable("upload_files", {
  key: text("key").primaryKey(),
  contentType: text("content_type").notNull(),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** "Our Brand" logos on the home page. Heights are the rendered logo heights in px. */
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull(),
  logoWidth: integer("logo_width").notNull(),
  logoHeight: integer("logo_height").notNull(),
  href: text("href").notNull().default(""),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  desktopHeight: integer("desktop_height").notNull().default(100),
  mobileHeight: integer("mobile_height").notNull().default(150),
  // Height of the logo's row on phones (lets tall logos overlap their padding, as on the original site)
  mobileRow: integer("mobile_row").notNull().default(150),
});

/** Background images of the home page hero slider. */
export const homeSlides = pgTable("home_slides", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  alt: text("alt").notNull().default(""),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
});

/** Image banners below the home page news (recruiting banners today). */
export const homeBanners = pgTable("home_banners", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  href: text("href").notNull().default(""),
  alt: text("alt").notNull().default(""),
  visible: boolean("visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
});

// ---------- Company pages & careers ----------

/** Edited content of a company page (admin → Pages). Missing = the built-in default content. */
export const pages = pgTable("pages", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedBy: text("updated_by").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;

// "main" = seats-inc.com's own /option-career/ page (in-house application form).
// "career" = the seatsinc-career.com microsite (41 postings, applicants go to Telegram HR).
// Both are rows in this one table so there's a single admin panel for all job postings;
// each site's queries filter to its own `site` value so neither list bleeds into the other.
export const JOB_SITES = ["main", "career"] as const;
export type JobSite = (typeof JOB_SITES)[number];

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  site: text("site").$type<JobSite>().notNull().default("main"),
  titleEn: text("title_en").notNull(),
  titleJa: text("title_ja").notNull().default(""),
  department: text("department").notNull().default(""),
  location: text("location").notNull().default("Phnom Penh"),
  type: text("type").notNull().default("Full-time"),
  salaryRange: text("salary_range").notNull().default(""),
  workDays: text("work_days").notNull().default(""),
  // Sanitized HTML
  descriptionEn: text("description_en").notNull().default(""),
  descriptionJa: text("description_ja").notNull().default(""),
  open: boolean("open").notNull().default(true),
  closesAt: timestamp("closes_at", { withTimezone: true }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  // Original WordPress post id (seatsinc-career.com import), kept for import idempotency
  wpId: integer("wp_id"),
});

export const APPLICATION_STATUSES = ["new", "reviewing", "interview", "hired", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const jobApplications = pgTable(
  "job_applications",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id").references(() => jobs.id, { onDelete: "set null" }),
    jobTitle: text("job_title").notNull().default(""), // kept if the job is deleted
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    message: text("message").notNull().default(""),
    lang: text("lang").notNull().default("en"),
    status: text("status").$type<ApplicationStatus>().notNull().default("new"),
    notes: text("notes").notNull().default(""),
    cvName: text("cv_name").notNull().default(""),
    cvSize: integer("cv_size").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("job_applications_job_idx").on(t.jobId), index("job_applications_created_idx").on(t.createdAt)],
);

/** CV files live in the database, never at a public URL; admins download them through an authenticated route. */
export const applicationFiles = pgTable("application_files", {
  applicationId: integer("application_id")
    .primaryKey()
    .references(() => jobApplications.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull().default("application/pdf"),
  data: bytea("data").notNull(),
});

import "server-only";
import { updateTag } from "next/cache";
import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db, ready } from "@/db";
import { categories, glossary, posts, siteSettings, translationItems, translationMemory } from "@/db/schema";
import type { Session } from "@/lib/auth";
import { ensureBaseline, logActivity, saveVersion } from "@/lib/activity";
import { NEWS_TAG } from "@/lib/news";
import { previewToken } from "@/lib/preview";
import { sanitizeBody, stripTags } from "@/lib/sanitize";
import { SETTINGS_TAG } from "@/lib/settings";
import { parseGroup, type Settings } from "@/lib/settings-schema";
import { alignRows, itemStatus, rowCounts, type AlignedRow, type ItemStatus, type SourceSeg, type StoredRow } from "./align";
import { assembleHtml, segmentHash, segmentHtml } from "./segments";
import { htmlText, similarity, trigrams, type GlossaryTerm } from "./text";

// ---------- what can be translated ----------

type Group = { group: string; label: string; kind: "text" | "html"; multiline?: boolean; maxLen?: number; en: string[]; ja: string[] };
type Source = {
  key: string;
  type: "post" | "settings" | "categories";
  title: string;
  subtitle?: string;
  groups: Group[];
  editUrl?: string;
  /** Write the finished Japanese to the live content */
  publish: (targets: Record<string, string[]>, who: Session) => Promise<void>;
};

const SETTINGS_FIELDS: { group: keyof Settings; title: string; fields: { field: string; label: string; multiline?: boolean }[] }[] = [
  {
    group: "company",
    title: "Company details",
    fields: [
      { field: "phoneNote", label: "Phone note" },
      { field: "businessDays", label: "Business days" },
      { field: "address", label: "Address", multiline: true },
    ],
  },
  { group: "seo", title: "SEO", fields: [{ field: "description", label: "Site description", multiline: true }] },
  {
    group: "contact",
    title: "Contact form auto-reply",
    fields: [
      { field: "autoReplySubject", label: "Subject" },
      { field: "autoReplyBody", label: "Message", multiline: true },
    ],
  },
  { group: "maintenance", title: "Maintenance message", fields: [{ field: "message", label: "Message", multiline: true }] },
];

function postSource(p: typeof posts.$inferSelect): Source {
  const groups: Group[] = [
    { group: "title", label: "Title", kind: "text", en: [p.titleEn], ja: [p.titleJa] },
    ...(p.excerptEn ? [{ group: "excerpt", label: "Excerpt", kind: "text" as const, multiline: true, maxLen: 120, en: [p.excerptEn], ja: [p.excerptJa] }] : []),
    { group: "body", label: "Body", kind: "html", en: segmentHtml(p.bodyEn), ja: segmentHtml(p.bodyJa) },
  ];
  return {
    key: `post:${p.id}`,
    type: "post",
    title: p.titleEn,
    subtitle: p.published ? undefined : "Draft",
    groups,
    editUrl: `/admin/posts/${p.id}/`,
    publish: async (t, who) => {
      const [cur] = await db.select().from(posts).where(eq(posts.id, p.id));
      if (!cur) throw new Error("Post not found");
      const bodyJa = sanitizeBody(assembleHtml(cur.bodyEn, t.body ?? []));
      const values = {
        titleJa: t.title?.[0] ?? "",
        excerptJa: t.excerpt?.[0] ?? stripTags(bodyJa).slice(0, 120),
        bodyJa,
        updatedAt: new Date(),
      };
      await db.update(posts).set(values).where(eq(posts.id, p.id));
      await ensureBaseline(`post:${p.id}`, cur);
      await saveVersion(`post:${p.id}`, { ...cur, ...values }, who, "Japanese published from Translation Center");
      updateTag(NEWS_TAG);
    },
  };
}

function settingsSource(def: (typeof SETTINGS_FIELDS)[number], value: Record<string, unknown>): Source {
  const pair = (f: string) => (value[f] ?? { en: "", ja: "" }) as { en: string; ja: string };
  return {
    key: `settings:${def.group}`,
    type: "settings",
    title: def.title,
    groups: def.fields.map((f) => ({ group: f.field, label: f.label, kind: "text", multiline: f.multiline, en: [pair(f.field).en], ja: [pair(f.field).ja] })),
    editUrl: `/admin/settings/?tab=${def.group}`,
    publish: async (t, who) => {
      const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, def.group));
      const next = { ...(parseGroup(def.group, row?.value) as Record<string, unknown>) };
      await ensureBaseline(`settings:${def.group}`, { ...next });
      for (const f of def.fields) next[f.field] = { ...(next[f.field] as object), ja: t[f.field]?.[0] ?? "" };
      await db
        .insert(siteSettings)
        .values({ key: def.group, value: next })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: next, updatedAt: new Date() } });
      await saveVersion(`settings:${def.group}`, next, who, "Japanese published from Translation Center");
      updateTag(SETTINGS_TAG);
    },
  };
}

function categoriesSource(cats: (typeof categories.$inferSelect)[]): Source {
  return {
    key: "categories",
    type: "categories",
    title: "News categories",
    groups: cats.map((c) => ({ group: `cat:${c.id}`, label: c.nameEn, kind: "text", en: [c.nameEn], ja: [c.nameJa] })),
    publish: async (t) => {
      for (const c of cats) {
        const ja = t[`cat:${c.id}`]?.[0];
        if (ja !== undefined) await db.update(categories).set({ nameJa: ja }).where(eq(categories.id, c.id));
      }
      updateTag(NEWS_TAG);
    },
  };
}

async function allSources(): Promise<Source[]> {
  const [postRows, cats, settingRows] = await Promise.all([
    db.select().from(posts).orderBy(desc(posts.publishedAt)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(siteSettings),
  ]);
  const settingsByKey = new Map(settingRows.map((r) => [r.key, r.value]));
  return [
    ...postRows.map(postSource),
    ...SETTINGS_FIELDS.map((d) => settingsSource(d, parseGroup(d.group, settingsByKey.get(d.group)) as Record<string, unknown>)),
    ...(cats.length ? [categoriesSource(cats)] : []),
  ];
}

async function getSource(key: string): Promise<Source | null> {
  if (key.startsWith("post:")) {
    const [p] = await db.select().from(posts).where(eq(posts.id, Number(key.slice(5))));
    return p ? postSource(p) : null;
  }
  if (key.startsWith("settings:")) {
    const def = SETTINGS_FIELDS.find((d) => `settings:${d.group}` === key);
    if (!def) return null;
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, def.group));
    return settingsSource(def, parseGroup(def.group, row?.value) as Record<string, unknown>);
  }
  if (key === "categories") {
    const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    return cats.length ? categoriesSource(cats) : null;
  }
  return null;
}

function sourceSegs(s: Source): SourceSeg[] {
  return s.groups.flatMap((g) => g.en.map((src) => ({ group: g.group, src, srcHash: segmentHash(src) })));
}

// ---------- stored drafts ----------

type ItemRow = typeof translationItems.$inferSelect;

/**
 * First time an item is seen: adopt the Japanese that is already live, paragraph by paragraph,
 * when it lines up with the English (it does for every imported WordPress post), and add those
 * pairs to translation memory.
 */
async function bootstrap(s: Source): Promise<ItemRow> {
  const rows: StoredRow[] = [];
  const memory: { sourceHash: string; sourceText: string; target: string }[] = [];
  for (const g of s.groups) {
    const aligned = g.ja.length === g.en.length;
    g.en.forEach((src, i) => {
      const target = aligned ? (g.ja[i] ?? "").trim() : "";
      rows.push({ group: g.group, src, srcHash: segmentHash(src), target });
      if (target) memory.push({ sourceHash: segmentHash(src), sourceText: htmlText(src), target });
    });
  }
  const hasJa = rows.some((r) => r.target);
  const [item] = await db
    .insert(translationItems)
    .values({ key: s.key, segments: rows, dirty: false, publishedAt: hasJa ? new Date() : null, updatedBy: "Imported" })
    .onConflictDoNothing()
    .returning();
  if (memory.length) await db.insert(translationMemory).values(dedupe(memory)).onConflictDoNothing();
  return item ?? (await db.select().from(translationItems).where(eq(translationItems.key, s.key)))[0];
}

function dedupe<T extends { sourceHash: string }>(list: T[]) {
  return [...new Map(list.map((m) => [m.sourceHash, m])).values()];
}

async function storedItems(keys: string[]) {
  if (!keys.length) return new Map<string, ItemRow>();
  const rows = await db.select().from(translationItems).where(inArray(translationItems.key, keys));
  return new Map(rows.map((r) => [r.key, r]));
}

// ---------- list ----------

export type ItemSummary = {
  key: string;
  type: Source["type"];
  title: string;
  subtitle?: string;
  status: ItemStatus;
  counts: ReturnType<typeof rowCounts>;
  updatedBy: string;
  updatedAt: Date | null;
};

export async function listTranslationItems(): Promise<ItemSummary[]> {
  await ready();
  const sources = await allSources();
  const stored = await storedItems(sources.map((s) => s.key));
  const out: ItemSummary[] = [];
  for (const s of sources) {
    const item = stored.get(s.key) ?? (await bootstrap(s));
    const rows = alignRows(sourceSegs(s), item.segments as StoredRow[]);
    out.push({
      key: s.key,
      type: s.type,
      title: s.title,
      subtitle: s.subtitle,
      status: itemStatus(rows, item.dirty),
      counts: rowCounts(rows),
      updatedBy: item.updatedBy,
      updatedAt: item.updatedAt,
    });
  }
  return out;
}

// ---------- workspace ----------

export type WorkspaceRow = AlignedRow & {
  label: string;
  kind: Group["kind"];
  multiline?: boolean;
  maxLen?: number;
  /** First row of its group (for section headings) */
  first: boolean;
  suggestion?: { target: string; score: number; sourceText: string };
};

export type Workspace = {
  key: string;
  type: Source["type"];
  title: string;
  subtitle?: string;
  editUrl?: string;
  previewUrl?: string;
  status: ItemStatus;
  dirty: boolean;
  publishedAt: Date | null;
  updatedBy: string;
  updatedAt: Date;
  rows: WorkspaceRow[];
  glossary: GlossaryTerm[];
};

const FUZZY_MIN = 0.75;

export async function loadWorkspace(key: string): Promise<Workspace | null> {
  await ready();
  const s = await getSource(key);
  if (!s) return null;
  const item = (await storedItems([key])).get(key) ?? (await bootstrap(s));
  const aligned = alignRows(sourceSegs(s), item.segments as StoredRow[]);

  // Translation memory: exact matches fill empty rows (to be checked), close matches are suggested
  const memory = await db.select().from(translationMemory);
  const byHash = new Map(memory.map((m) => [m.sourceHash, m]));
  const prepared = memory.map((m) => ({ m, len: m.sourceText.length }));

  const groupOf = new Map(s.groups.map((g) => [g.group, g]));
  const seen = new Set<string>();
  const rows: WorkspaceRow[] = aligned.map((r) => {
    const g = groupOf.get(r.group)!;
    const row: WorkspaceRow = { ...r, label: g.label, kind: g.kind, multiline: g.multiline, maxLen: g.maxLen, first: !seen.has(r.group) };
    seen.add(r.group);
    if (row.state !== "empty") return row;
    const exact = byHash.get(r.srcHash);
    if (exact) return { ...row, target: exact.target, state: "auto" };
    const text = htmlText(r.src);
    if (text.length < 8) return row;
    const grams = trigrams(text);
    let best: WorkspaceRow["suggestion"];
    for (const { m, len } of prepared) {
      if (len < text.length * 0.6 || len > text.length * 1.6) continue;
      const score = similarity(text, m.sourceText, grams);
      if (score >= FUZZY_MIN && (!best || score > best.score)) best = { target: m.target, score, sourceText: m.sourceText };
    }
    return best ? { ...row, suggestion: best } : row;
  });

  const terms = await db.select({ id: glossary.id, termEn: glossary.termEn, termJa: glossary.termJa, note: glossary.note }).from(glossary);
  const postId = s.type === "post" ? Number(key.slice(5)) : null;
  return {
    key,
    type: s.type,
    title: s.title,
    subtitle: s.subtitle,
    editUrl: s.editUrl,
    previewUrl: postId ? `/ja/preview/post/${postId}/?t=${previewToken("post", postId)}&draft=1` : undefined,
    status: itemStatus(aligned, item.dirty),
    dirty: item.dirty,
    publishedAt: item.publishedAt,
    updatedBy: item.updatedBy,
    updatedAt: item.updatedAt,
    rows,
    glossary: terms,
  };
}

/** What the browser sends back: one entry per row, in order. */
export type DraftRow = { srcHash: string; target: string; auto: boolean; outdated: boolean };

export class StaleError extends Error {}

/** Save the draft. Rows must still line up with the current English (else StaleError). */
export async function saveDraft(key: string, input: DraftRow[], who: Session) {
  await ready();
  const s = await getSource(key);
  if (!s) throw new Error("Not found");
  const item = (await storedItems([key])).get(key) ?? (await bootstrap(s));
  const aligned = alignRows(sourceSegs(s), item.segments as StoredRow[]);
  if (aligned.length !== input.length || aligned.some((r, i) => r.srcHash !== input[i].srcHash)) throw new StaleError();

  const rows: StoredRow[] = aligned.map((r, i) => {
    const d = input[i];
    const target = d.target.trim();
    // Still outdated: keep the old English so the diff survives a reload
    if (d.outdated && r.oldSrc !== undefined) return { group: r.group, src: r.oldSrc, srcHash: r.oldSrcHash!, target };
    return { group: r.group, src: r.src, srcHash: r.srcHash, target, ...(d.auto && target && { auto: true }) };
  });

  const before = JSON.stringify(item.segments);
  const changed = before !== JSON.stringify(rows);
  if (changed) {
    await db
      .update(translationItems)
      .set({ segments: rows, dirty: true, updatedBy: who.name || who.email, updatedAt: new Date() })
      .where(eq(translationItems.key, key));
  }

  // Confirmed pairs go into translation memory
  const memory = rows
    .filter((r, i) => r.target && !r.auto && !input[i].outdated)
    .map((r) => ({ sourceHash: r.srcHash, sourceText: htmlText(r.src), target: r.target }));
  if (memory.length) {
    await db
      .insert(translationMemory)
      .values(dedupe(memory))
      .onConflictDoUpdate({
        target: translationMemory.sourceHash,
        set: { target: sql`excluded.target`, updatedAt: new Date(), uses: sql`${translationMemory.uses} + 1` },
      });
  }
  return { changed, rows: aligned.length };
}

export type PublishProblem = { empty: number; auto: number; outdated: number };

/** Publish the saved draft to the live Japanese content. Returns problems instead when it isn't finished. */
export async function publishItem(key: string, who: Session): Promise<{ ok: true } | { ok: false; problems: PublishProblem }> {
  await ready();
  const s = await getSource(key);
  if (!s) throw new Error("Not found");
  const item = (await storedItems([key])).get(key) ?? (await bootstrap(s));
  const rows = alignRows(sourceSegs(s), item.segments as StoredRow[]);
  const c = rowCounts(rows);
  if (c.empty || c.auto || c.outdated) return { ok: false, problems: { empty: c.empty, auto: c.auto, outdated: c.outdated } };

  const targets: Record<string, string[]> = {};
  for (const r of rows) (targets[r.group] ??= []).push(r.target);
  await s.publish(targets, who);
  await db.update(translationItems).set({ dirty: false, publishedAt: new Date() }).where(eq(translationItems.key, key));
  await logActivity(who, "translation.publish", { type: s.type, id: key, summary: s.title });
  return { ok: true };
}

/** Assembled Japanese body from the saved draft, for previews (null when nothing is drafted). */
export async function draftPostJa(postId: number) {
  await ready();
  const [item] = await db.select().from(translationItems).where(eq(translationItems.key, `post:${postId}`));
  const [p] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!item || !p) return null;
  const rows = alignRows(sourceSegs(postSource(p)), item.segments as StoredRow[]);
  const t: Record<string, string[]> = {};
  for (const r of rows) (t[r.group] ??= []).push(r.target);
  return {
    title: t.title?.[0] || p.titleJa || p.titleEn,
    excerpt: t.excerpt?.[0] || p.excerptJa,
    // Untranslated paragraphs fall back to English so the preview shows the whole page
    body: sanitizeBody(assembleHtml(p.bodyEn, segmentHtml(p.bodyEn).map((en, i) => t.body?.[i] || en))),
  };
}

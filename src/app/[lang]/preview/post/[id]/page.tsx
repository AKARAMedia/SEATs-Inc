import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db, ready } from "@/db";
import { categories, posts } from "@/db/schema";
import NewsArticle from "@/components/news/NewsArticle";
import { isLang } from "@/lib/i18n";
import { localize } from "@/lib/news";
import { checkPreviewToken } from "@/lib/preview";
import { draftPostJa } from "@/lib/translation/center";

// Private preview of a news post (drafts, scheduled posts, unpublished Japanese drafts).
// Anyone with the link can view it; the token is an HMAC of the post id.

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

// Previews are always rendered per request; one placeholder lets the route build like /[slug]
export function generateStaticParams() {
  return [{ id: "0" }];
}

async function Preview({ params, searchParams }: PageProps<"/[lang]/preview/post/[id]">) {
  await connection(); // always rendered per request (shows live draft state)
  const [{ lang, id }, sp] = await Promise.all([params, searchParams]);
  const postId = Number(id);
  if (!isLang(lang) || !Number.isInteger(postId) || !checkPreviewToken("post", postId, typeof sp.t === "string" ? sp.t : undefined)) notFound();
  await ready();
  const [row] = await db.select().from(posts).leftJoin(categories, eq(posts.categoryId, categories.id)).where(eq(posts.id, postId));
  if (!row) notFound();

  const item = localize(row.posts, row.categories, lang);
  const useDraft = lang === "ja" && sp.draft === "1";
  if (useDraft) {
    const draft = await draftPostJa(postId);
    if (draft) Object.assign(item, { title: draft.title, excerpt: draft.excerpt, body: draft.body });
  }

  const p = row.posts;
  const state = !p.published ? "Draft — not on the website" : p.publishedAt > new Date() ? `Scheduled — goes live ${p.publishedAt.toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh", dateStyle: "medium", timeStyle: "short" })}` : "Live on the website";
  const other = lang === "ja" ? `/preview/post/${postId}/?t=${sp.t}` : `/ja/preview/post/${postId}/?t=${sp.t}${useDraft ? "&draft=1" : ""}`;

  return (
    <>
      <div className="sticky top-0 z-[70] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-[#222] px-4 py-2 text-center text-[13px] text-white">
        <strong>Preview</strong>
        <span>{state}</span>
        {useDraft && <span className="rounded bg-amber-400 px-1.5 text-[#222]">Japanese draft (unpublished changes)</span>}
        <a href={other} className="text-white underline">
          {lang === "ja" ? "View English" : "View Japanese"}
        </a>
      </div>
      <NewsArticle item={item} lang={lang} />
    </>
  );
}

export default function PreviewPage(props: PageProps<"/[lang]/preview/post/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Preview {...props} />
    </Suspense>
  );
}

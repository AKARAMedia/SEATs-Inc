import Link from "next/link";
import { notFound } from "next/navigation";
import DiffView from "@/components/admin/DiffView";
import { ConfirmForm } from "@/components/admin/ui/confirm";
import { restorePostVersionAction } from "@/app/admin/actions";
import { adminCategories, adminGetPost, fmtDateTime } from "@/lib/admin-data";
import { getVersion } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { htmlParagraphs, htmlText } from "@/lib/translation/text";
import type { Post } from "@/db/schema";

export const metadata = { title: "Compare versions" };

export default async function ComparePage({ params }: PageProps<"/admin/posts/[id]/history/[versionId]">) {
  const { id, versionId } = await params;
  const session = await requireAdmin("viewPosts");
  const post = await adminGetPost(Number(id));
  if (!post) notFound();
  const v = await getVersion(`post:${post.id}`, Number(versionId));
  if (!v) notFound();
  const old = v.data as Post;
  const cats = new Map((await adminCategories()).map((c) => [c.id, c.nameEn]));
  const date = (d: Date | string) => fmtDateTime(new Date(d));

  const fields: { label: string; before: string; after: string; lang?: string }[] = [
    { label: "Title (EN)", before: old.titleEn, after: post.titleEn },
    { label: "Title (JP)", before: old.titleJa, after: post.titleJa, lang: "ja" },
    { label: "Excerpt (EN)", before: old.excerptEn, after: post.excerptEn },
    { label: "Excerpt (JP)", before: old.excerptJa, after: post.excerptJa, lang: "ja" },
    { label: "Body (EN)", before: htmlParagraphs(old.bodyEn), after: htmlParagraphs(post.bodyEn) },
    { label: "Body (JP)", before: htmlParagraphs(old.bodyJa), after: htmlParagraphs(post.bodyJa), lang: "ja" },
    { label: "Status", before: old.published ? "Published" : "Draft", after: post.published ? "Published" : "Draft" },
    { label: "Date", before: date(old.publishedAt), after: date(post.publishedAt) },
    { label: "Category", before: cats.get(old.categoryId ?? -1) ?? "None", after: cats.get(post.categoryId ?? -1) ?? "None" },
    { label: "URL slug", before: old.slug, after: post.slug },
    { label: "Featured image", before: old.imageUrl ?? "None", after: post.imageUrl ?? "None" },
  ];
  const changed = fields.filter((f) => f.before !== f.after);
  const bodyHtmlOnly = old.bodyEn !== post.bodyEn && htmlText(old.bodyEn) === htmlText(post.bodyEn);

  return (
    <div className="max-w-[960px] space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <Link href={`/admin/posts/${post.id}/`} className="text-[13px] text-[#888] hover:text-primary">
            ← Back to the post
          </Link>
          <h1 className="text-[22px] font-semibold">Compare versions</h1>
          <p className="text-[13px] text-[#888]">
            Version from <strong>{fmtDateTime(v.createdAt)}</strong> by {v.userName} → current version.{" "}
            <span className="bg-red-100 px-1 text-red-700 line-through">Removed</span> <span className="bg-green-100 px-1 text-green-800">Added</span>
          </p>
        </div>
        {can(session.role, "editPosts") && (
          <ConfirmForm
            action={restorePostVersionAction}
            fields={{ id: post.id, versionId: v.id }}
            confirm={{
              title: "Restore this version?",
              message: `The post goes back to how it was on ${fmtDateTime(v.createdAt)}. The current version stays in the history.`,
              confirmLabel: "Restore",
            }}
          >
            <button className="admin-btn">Restore this version</button>
          </ConfirmForm>
        )}
      </div>

      {changed.length ? (
        changed.map((f) => (
          <section key={f.label} className="admin-card p-4">
            <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[#888]">{f.label}</h2>
            {/* Restoring goes from current back to the old version, so show old → current */}
            <DiffView before={f.before} after={f.after} lang={f.lang} />
          </section>
        ))
      ) : (
        <p className="admin-card p-8 text-center text-[#888]">{bodyHtmlOnly ? "Only formatting (bold, links, layout) changed." : "No differences — this version is the same as the current one."}</p>
      )}
      {changed.length > 0 && fields.length > changed.length && (
        <p className="text-[13px] text-[#999]">Unchanged: {fields.filter((f) => f.before === f.after).map((f) => f.label).join(", ")}.</p>
      )}
    </div>
  );
}

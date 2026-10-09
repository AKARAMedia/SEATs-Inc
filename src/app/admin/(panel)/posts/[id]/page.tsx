import Link from "next/link";
import { notFound } from "next/navigation";
import PostForm from "@/components/admin/PostForm";
import { ConfirmForm } from "@/components/admin/ui/confirm";
import { adminCategories, adminGetPost, toLocalInput } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { deletePostAction, restorePostVersionAction } from "@/app/admin/actions";
import VersionList from "@/components/admin/VersionList";
import { Icon } from "@/components/admin/ui/icons";
import { listVersions } from "@/lib/activity";
import { previewToken } from "@/lib/preview";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  const { id } = await params;
  const [post, session] = await Promise.all([adminGetPost(Number(id)), requireAdmin("viewPosts")]);
  if (!post) notFound();
  const canEdit = can(session.role, "editPosts");
  const [categories, history] = await Promise.all([adminCategories(), listVersions(`post:${post.id}`)]);
  const live = post.published && post.publishedAt <= new Date();
  const token = previewToken("post", post.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto min-w-0">
          <Link href="/admin/posts/" className="text-[13px] text-[#888] hover:text-primary">
            ← All posts
          </Link>
          <h1 className="truncate text-[22px] font-semibold">{post.titleEn}</h1>
        </div>
        {live ? (
          <>
            <a href={`/${post.slug}/`} target="_blank" className="admin-btn-secondary">
              View EN ↗
            </a>
            <a href={`/ja/${post.slug}/`} target="_blank" className="admin-btn-secondary">
              View JP ↗
            </a>
          </>
        ) : (
          <>
            <a href={`/preview/post/${post.id}/?t=${token}`} target="_blank" className="admin-btn-secondary" title="Private link — works without signing in, so you can share it for review">
              <Icon name="eye" className="size-4" /> Preview EN
            </a>
            <a href={`/ja/preview/post/${post.id}/?t=${token}`} target="_blank" className="admin-btn-secondary">
              Preview JP
            </a>
          </>
        )}
        <Link href={`/admin/translate/post-${post.id}/`} className="admin-btn-secondary">
          <Icon name="translate" className="size-4" /> Translate
        </Link>
        {canEdit && (
          <ConfirmForm
            action={deletePostAction}
            fields={{ id: post.id }}
            confirm={{ title: "Delete this post?", message: <>“{post.titleEn}” will be removed from the website. This cannot be undone.</>, confirmLabel: "Delete post", danger: true }}
          >
            <button type="submit" className="admin-btn-secondary !text-red-600 hover:!bg-red-50">
              Delete
            </button>
          </ConfirmForm>
        )}
      </div>
      <PostForm
        mode={canEdit ? "full" : "translate"}
        // Remount after each save so editors reload the sanitized HTML
        key={post.updatedAt.toISOString()}
        categories={categories}
        values={{
          id: post.id,
          slug: post.slug,
          titleEn: post.titleEn,
          titleJa: post.titleJa,
          excerptEn: post.excerptEn,
          excerptJa: post.excerptJa,
          bodyEn: post.bodyEn,
          bodyJa: post.bodyJa,
          categoryId: post.categoryId,
          imageUrl: post.imageUrl ?? "",
          publishedAt: toLocalInput(post.publishedAt),
          published: post.published,
        }}
      />

      <details className="admin-card group p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-[15px] font-semibold">
          <Icon name="history" className="size-4 text-[#888]" />
          History <span className="text-[13px] font-normal text-[#999]">({history.length} saved version{history.length === 1 ? "" : "s"})</span>
          <span className="ml-auto text-[12px] font-normal text-[#999] group-open:hidden">Show</span>
        </summary>
        <div className="mt-3">
          <VersionList
            versions={history}
            restore={restorePostVersionAction}
            fields={{ id: post.id }}
            canRestore={canEdit}
            compareHref={(v) => `/admin/posts/${post.id}/history/${v}/`}
          />
        </div>
      </details>
    </div>
  );
}
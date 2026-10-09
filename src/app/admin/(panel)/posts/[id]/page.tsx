import Link from "next/link";
import { notFound } from "next/navigation";
import PostForm from "@/components/admin/PostForm";
import { ConfirmForm } from "@/components/admin/ui/confirm";
import { adminCategories, adminGetPost, toLocalInput } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { deletePostAction } from "@/app/admin/actions";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  const { id } = await params;
  const [post, session] = await Promise.all([adminGetPost(Number(id)), requireAdmin("viewPosts")]);
  if (!post) notFound();
  const canEdit = can(session.role, "editPosts");
  const categories = await adminCategories();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto min-w-0">
          <Link href="/admin/" className="text-[13px] text-[#888] hover:text-primary">
            ← All posts
          </Link>
          <h1 className="truncate text-[22px] font-semibold">{post.titleEn}</h1>
        </div>
        {post.published && (
          <>
            <a href={`/${post.slug}/`} target="_blank" className="admin-btn-secondary">
              View EN ↗
            </a>
            <a href={`/ja/${post.slug}/`} target="_blank" className="admin-btn-secondary">
              View JP ↗
            </a>
          </>
        )}
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
    </div>
  );
}

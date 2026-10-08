import Link from "next/link";
import { notFound } from "next/navigation";
import PostForm from "@/components/admin/PostForm";
import DeletePostButton from "@/components/admin/DeletePostButton";
import { adminCategories, adminGetPost, toLocalInput } from "@/lib/admin-data";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/posts/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const post = await adminGetPost(Number(id));
  if (!post) notFound();
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
        <DeletePostButton id={post.id} title={post.titleEn} />
      </div>
      {sp.saved && (
        <p className="rounded-md bg-green-50 px-4 py-2.5 text-[13px] text-green-800 ring-1 ring-green-200">
          Saved. Changes are live on the site.
        </p>
      )}
      <PostForm
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

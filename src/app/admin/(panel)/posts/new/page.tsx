import Link from "next/link";
import PostForm from "@/components/admin/PostForm";
import { adminCategories, toLocalInput } from "@/lib/admin-data";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  const categories = await adminCategories();
  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/" className="text-[13px] text-[#888] hover:text-primary">
          ← All posts
        </Link>
        <h1 className="text-[22px] font-semibold">New post</h1>
      </div>
      <PostForm
        categories={categories}
        values={{
          slug: "",
          titleEn: "",
          titleJa: "",
          excerptEn: "",
          excerptJa: "",
          bodyEn: "",
          bodyJa: "",
          categoryId: null,
          imageUrl: "",
          publishedAt: toLocalInput(new Date()),
          published: true,
        }}
      />
    </div>
  );
}

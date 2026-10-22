import { redirect } from "next/navigation";
import MediaLibrary from "@/components/admin/media/MediaLibrary";
import { requireAdmin } from "@/lib/auth";
import { queryMedia, type MediaListFilter } from "@/lib/media-library";
import { MEDIA_PAGE_SIZES } from "@/lib/media-paging";

export const metadata = { title: "Media library" };

const FILTERS: MediaListFilter[] = ["all", "upload", "site", "unused"];

export default async function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  await requireAdmin("content");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const filter = FILTERS.find((f) => f === sp.filter) ?? "all";
  const pageParam = Number(sp.page);
  const limitParam = Number(sp.limit);
  const limit = MEDIA_PAGE_SIZES.find((n) => n === limitParam) ?? MEDIA_PAGE_SIZES[0];
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1;

  const data = await queryMedia({ q, filter, page, limit });
  // Keep `page` and `limit` visible in the URL, and fix up values that were out of range
  if (data.page !== pageParam || limit !== limitParam) {
    redirect(`/admin/media/?${new URLSearchParams({ ...(q && { q }), ...(filter !== "all" && { filter }), limit: String(limit), page: String(data.page) })}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] font-semibold">Media library</h1>
        <p className="text-[13px] text-[#888]">All images on the website. Uploaded images can be deleted once nothing uses them.</p>
      </div>
      <MediaLibrary {...data} q={q} filter={filter} limit={limit} />
    </div>
  );
}

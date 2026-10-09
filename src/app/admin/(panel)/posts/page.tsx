import Image from "next/image";
import Link from "next/link";
import { adminListPosts } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import PublishToggle from "@/components/admin/PublishToggle";
import Pagination from "@/components/admin/ui/Pagination";

export const metadata = { title: "News & Events" };

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Phnom_Penh" });
}

export default async function AdminPostsPage({ searchParams }: PageProps<"/admin/posts">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const [{ rows, total, pages }, session] = await Promise.all([adminListPosts({ q, page, status }), requireAdmin("viewPosts")]);
  const canEdit = can(session.role, "editPosts");
  const now = new Date();
  const qs = (p: number) => `?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), page: String(p) })}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-[22px] font-semibold">
          News &amp; Events <span className="text-[14px] font-normal text-[#888]">({total})</span>
        </h1>
        <form className="flex w-full gap-2 sm:w-auto" role="search">
          <input name="q" defaultValue={q} placeholder="Search titles…" className="admin-input min-w-0 flex-1 sm:!w-56 sm:flex-none" />
          <select name="status" defaultValue={status} className="admin-input !w-auto">
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="scheduled">Scheduled</option>
            <option value="missingja">Missing Japanese</option>
          </select>
          <button className="admin-btn-secondary">Filter</button>
        </form>
        {canEdit && (
          <Link href="/admin/posts/new/" className="admin-btn">
            + New post
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg bg-white ring-1 ring-black/5">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-black/10 text-[12px] uppercase tracking-wide text-[#888]">
            <tr>
              <th className="w-[72px] px-4 py-3" />
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">JP translation</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-[#fafbfc]">
                <td className="px-4 py-2.5">
                  {p.imageUrl ? (
                    <div className="relative h-[42px] w-[56px] overflow-hidden rounded">
                      <Image src={p.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-[42px] w-[56px] rounded bg-black/5" />
                  )}
                </td>
                <td className="max-w-[460px] px-4 py-2.5">
                  <Link href={`/admin/posts/${p.id}/`} className="font-semibold text-[#222] hover:text-primary">
                    {p.titleEn}
                  </Link>
                  {p.titleJa && <div className="truncate text-[12px] text-[#888]">{p.titleJa}</div>}
                </td>
                <td className="px-4 py-2.5 text-[13px] text-[#666]">{p.category ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${
                      p.jaComplete ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {p.jaComplete ? "Done" : "Missing"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[13px] text-[#666]">{fmt(p.publishedAt)}</td>
                <td className="px-4 py-2.5">
                  <PublishToggle
                    id={p.id}
                    published={p.published}
                    scheduled={p.publishedAt > now ? p.publishedAt.toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh", dateStyle: "medium", timeStyle: "short" }) : undefined}
                    disabled={!canEdit}
                  />
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#888]">
                  No posts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} href={qs} />
    </div>
  );
}

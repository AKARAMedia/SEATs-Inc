import Image from "next/image";
import Link from "next/link";
import { adminListPosts } from "@/lib/admin-data";
import { togglePublishAction } from "../actions";

export const metadata = { title: "News & Events" };

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Phnom_Penh" });
}

export default async function AdminPostsPage({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total, pages } = await adminListPosts({ q, page, status });
  const qs = (p: number) => `?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), page: String(p) })}`;

  return (
    <div className="space-y-4">
      {sp.deleted && <p className="rounded-md bg-green-50 px-4 py-2.5 text-[13px] text-green-800 ring-1 ring-green-200">Post deleted.</p>}

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-[22px] font-semibold">
          News &amp; Events <span className="text-[14px] font-normal text-[#888]">({total})</span>
        </h1>
        <form className="flex gap-2" role="search">
          <input name="q" defaultValue={q} placeholder="Search titles…" className="admin-input !w-56" />
          <select name="status" defaultValue={status} className="admin-input !w-auto">
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <button className="admin-btn-secondary">Filter</button>
        </form>
        <Link href="/admin/posts/new/" className="admin-btn">
          + New post
        </Link>
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
                  <form action={togglePublishAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="published" value={String(!p.published)} />
                    <button
                      title={p.published ? "Click to unpublish" : "Click to publish"}
                      className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${
                        p.published ? "bg-primary/10 text-primary" : "bg-black/5 text-[#777]"
                      }`}
                    >
                      {p.published ? "Published" : "Draft"}
                    </button>
                  </form>
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

      {pages > 1 && (
        <nav className="flex justify-center gap-1" aria-label="Pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={qs(n)}
              aria-current={n === page ? "page" : undefined}
              className={`min-w-9 rounded px-3 py-1.5 text-center text-[13px] ${n === page ? "bg-primary text-white" : "bg-white ring-1 ring-black/10"}`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

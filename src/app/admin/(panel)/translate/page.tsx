import Link from "next/link";
import { redirect } from "next/navigation";
import { STATUS_STYLE } from "@/components/admin/translate/status";
import { requireAdmin } from "@/lib/auth";
import Pagination from "@/components/admin/ui/Pagination";
import PageSizeSelect from "@/components/admin/ui/PageSizeSelect";
import { shortDate } from "@/lib/format";
import type { ItemStatus } from "@/lib/translation/align";
import { listTranslationItems } from "@/lib/translation/center";
import { keyToSlug } from "@/lib/translation/text";

export const metadata = { title: "Translation Center" };

// How many of the newest News posts stay in "Needs work" even when fully translated, so a post you
// just wrote in English is always on this page with its Japanese status next to it.
const RECENT_POSTS = 10;

type Row = { key: string; status: ItemStatus };
const VIEWS: { key: string; label: string; match: (i: Row, recent: Set<string>) => boolean }[] = [
  { key: "todo", label: "Needs work", match: (i, recent) => i.status !== "done" || recent.has(i.key) },
  { key: "needs_update", label: "English changed", match: (i) => i.status === "needs_update" },
  { key: "not_started", label: "Not started", match: (i) => i.status === "not_started" },
  { key: "in_progress", label: "In progress", match: (i) => i.status === "in_progress" },
  { key: "done", label: "Done", match: (i) => i.status === "done" },
  { key: "all", label: "All", match: () => true },
];

const PAGE_SIZES = [10, 25, 50] as const;

const TYPES = { post: "News", page: "Pages", job: "Jobs", settings: "Settings", categories: "Categories" } as const;

export default async function TranslatePage({ searchParams }: PageProps<"/admin/translate">) {
  await requireAdmin("translate");
  const sp = await searchParams;
  const items = await listTranslationItems();
  // Items come newest-post-first, so the first posts are the most recent
  const recent = new Set(items.filter((i) => i.type === "post").slice(0, RECENT_POSTS).map((i) => i.key));
  const view = VIEWS.find((v) => v.key === sp.view) ?? VIEWS[0];
  const type = typeof sp.type === "string" && sp.type in TYPES ? (sp.type as keyof typeof TYPES) : "";
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";

  const limitParam = Number(sp.limit);
  const limit = PAGE_SIZES.find((n) => n === limitParam) ?? PAGE_SIZES[0];

  const totalRows = items.reduce((s, i) => s + i.counts.total, 0);
  const okRows = items.reduce((s, i) => s + i.counts.ok, 0);
  const pct = totalRows ? Math.floor((okRows / totalRows) * 1000) / 10 : 100;
  const byStatus = (s: ItemStatus) => items.filter((i) => i.status === s).length;

  const shown = items
    .filter((i) => view.match(i, recent) && (!type || i.type === type) && (!q || i.title.toLowerCase().includes(q)))
    // Most urgent first: English changed, then in progress, then not started
    .sort((a, b) => ["needs_update", "in_progress", "not_started", "done"].indexOf(a.status) - ["needs_update", "in_progress", "not_started", "done"].indexOf(b.status));

  const pages = Math.max(1, Math.ceil(shown.length / limit));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const pageRows = shown.slice((page - 1) * limit, page * limit);

  // Filters/tabs go back to page 1 (page only appears when asked for); the page size is kept
  const href = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ ...(view.key !== "todo" && { view: view.key }), ...(type && { type }), ...(q && { q }), limit: String(limit), page: "1", ...patch });
    for (const [k, v] of [...p]) if (!v || (k === "view" && v === "todo")) p.delete(k);
    return `/admin/translate/${p.size ? `?${p}` : ""}`;
  };
  // Always show the page size and page in the address bar (e.g. ?limit=10&page=1): redirect once to that form
  if (sp.limit !== String(limit) || sp.page !== String(page)) redirect(href({ page: String(page) }));
  const filterParams = { ...(view.key !== "todo" && { view: view.key }), ...(type && { type }), ...(q && { q }) };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-[22px] font-semibold">Translation Center</h1>
          <p className="text-[13px] text-[#888]">Everything on the website that has a Japanese version, paragraph by paragraph.</p>
        </div>
        <Link href="/admin/translate/glossary/" className="admin-btn-secondary">
          Glossary
        </Link>
      </div>

      <section className="admin-card flex flex-wrap items-center gap-x-8 gap-y-4 p-5">
        <div className="min-w-[240px] flex-1">
          <p className="text-[13px] text-[#777]">Japanese website</p>
          <p className="text-[28px] font-semibold leading-tight text-[#222]">{pct}% translated</p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-[12px] text-[#999]">
            {okRows.toLocaleString()} of {totalRows.toLocaleString()} paragraphs
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px] sm:grid-cols-4">
          {(["needs_update", "in_progress", "not_started", "done"] as const).map((s) => (
            <div key={s}>
              <dt className="text-[#888]">{STATUS_STYLE[s].label}</dt>
              <dd className="text-[20px] font-semibold text-[#222]">{byStatus(s)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <nav className="flex flex-wrap gap-1 rounded-lg bg-white p-1 ring-1 ring-black/5" aria-label="Filter by status">
          {VIEWS.map((v) => {
            const n = items.filter((i) => v.match(i, recent) && (!type || i.type === type)).length;
            return (
              <Link
                key={v.key}
                href={href({ view: v.key })}
                aria-current={v.key === view.key ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-[13px] font-semibold ${v.key === view.key ? "bg-primary text-white" : "text-[#555] hover:bg-black/5"}`}
              >
                {v.label} <span className={v.key === view.key ? "text-white/80" : "text-[#999]"}>{n}</span>
              </Link>
            );
          })}
        </nav>
        <form className="flex w-full flex-1 gap-2 sm:w-auto sm:justify-end" role="search">
          {view.key !== "todo" && <input type="hidden" name="view" value={view.key} />}
          <input type="hidden" name="limit" value={limit} />
          <select name="type" defaultValue={type} className="admin-input !w-auto" aria-label="Type">
            <option value="">All types</option>
            {Object.entries(TYPES).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
          <input name="q" defaultValue={q} placeholder="Search titles…" className="admin-input min-w-0 flex-1 sm:!w-56 sm:flex-none" />
          <button className="admin-btn-secondary">Filter</button>
        </form>
      </div>

      {shown.length ? (
        <ul className="admin-card divide-y divide-black/5">
          {pageRows.map((i) => {
            const done = i.counts.total ? (i.counts.ok / i.counts.total) * 100 : 100;
            const todo = i.counts.empty + i.counts.auto + i.counts.outdated;
            return (
              <li key={i.key}>
                <Link href={`/admin/translate/${keyToSlug(i.key)}/`} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-[#f7f9fb]">
                  <span className="admin-badge w-[84px] justify-center bg-black/5 text-[#666]">{TYPES[i.type]}</span>
                  <span className="min-w-0 flex-1 basis-[240px]">
                    <span className="block truncate font-medium text-[#222]">{i.title}</span>
                    <span className="block text-[12px] text-[#999]">
                      {i.subtitle && <>{i.subtitle} · </>}
                      {todo ? `${todo} paragraph${todo === 1 ? "" : "s"} to do` : "All paragraphs translated"}
                      {i.updatedAt && i.updatedBy !== "Imported" && ` · edited by ${i.updatedBy}, ${shortDate(i.updatedAt)}`}
                    </span>
                  </span>
                  <span className="flex w-[150px] items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
                      <span className="block h-full rounded-full bg-green-500" style={{ width: `${done}%` }} />
                    </span>
                    <span className="w-[44px] text-right text-[12px] tabular-nums text-[#777]">
                      {i.counts.ok}/{i.counts.total}
                    </span>
                  </span>
                  <span className={`admin-badge w-[110px] justify-center ${STATUS_STYLE[i.status].cls}`}>{STATUS_STYLE[i.status].label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="admin-card p-10 text-center text-[#888]">{view.key === "todo" ? "Everything is translated. 🎉" : "Nothing here."}</p>
      )}

      {shown.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Pagination page={page} pages={pages} href={(n) => href({ page: String(n) })} />
          <PageSizeSelect sizes={PAGE_SIZES} value={limit} params={filterParams} />
        </div>
      )}
    </div>
  );
}

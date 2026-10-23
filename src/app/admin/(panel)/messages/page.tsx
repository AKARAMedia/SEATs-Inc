import Link from "next/link";
import { redirect } from "next/navigation";
import MessageList from "@/components/admin/MessageList";
import AutoSubmitSelect from "@/components/admin/ui/AutoSubmitSelect";
import FilterForm from "@/components/admin/ui/FilterForm";
import PageSizeSelect from "@/components/admin/ui/PageSizeSelect";
import Pagination from "@/components/admin/ui/Pagination";
import { Icon } from "@/components/admin/ui/icons";
import { adminMessages, MESSAGE_PAGE_SIZES, type MessageView } from "@/lib/admin-data";

export const metadata = { title: "Messages" };

const VIEWS = [
  { key: "inbox", label: "Inbox" },
  { key: "unread", label: "Unread" },
  { key: "archived", label: "Archived" },
] as const;

const EMPTY: Record<MessageView, string> = {
  inbox: "No messages yet.",
  unread: "You're all caught up — no unread messages.",
  archived: "No archived messages.",
  all: "No messages yet.",
};

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).trim() : "");
  const view: MessageView = VIEWS.find((v) => v.key === sp.view)?.key ?? "inbox";
  const q = str("q");
  const lang = str("lang");
  const pageParam = Number(sp.page);
  const limitParam = Number(sp.limit);
  const limit = MESSAGE_PAGE_SIZES.find((n) => n === limitParam) ?? MESSAGE_PAGE_SIZES[0];
  const requested = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1;
  const { rows, total, pages, counts } = await adminMessages({ view, q, lang, page: requested, size: limit });
  const page = Math.min(requested, pages);

  /** Query string for the current filters plus overrides; the inbox view and empty filters are left out. */
  const query = (extra: Record<string, string | number> = {}) => {
    const all: Record<string, string | number> = { view: view === "inbox" ? "" : view, q, lang, ...extra };
    return new URLSearchParams(Object.entries(all).filter(([, v]) => v !== "").map(([k, v]) => [k, String(v)])).toString();
  };
  const href = (extra: Record<string, string | number> = {}) => `/admin/messages/?${query({ limit, page: 1, ...extra })}`;

  // Keep `page` and `limit` visible in the URL, and fix up values that were out of range
  if (page !== pageParam || limit !== limitParam) redirect(href({ page }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-[22px] font-semibold">Messages</h1>
          <p className="text-[13px] text-[#888]">From the contact form on the website.</p>
        </div>
        <a href={`/api/admin/messages/export/?${query({ view })}`} className="admin-btn-secondary" download>
          <Icon name="download" className="size-4" /> Export to Excel
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <nav className="flex rounded-lg bg-white p-1 ring-1 ring-black/5" aria-label="Message folders">
          {VIEWS.map((v) => (
            <Link
              key={v.key}
              href={`/admin/messages/?${new URLSearchParams({ ...(v.key !== "inbox" && { view: v.key }), limit: String(limit), page: "1" })}`}
              aria-current={view === v.key ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold ${
                view === v.key ? "bg-primary text-white" : "text-[#555] hover:bg-black/5"
              }`}
            >
              {v.label}
              <span className={`text-[12px] ${view === v.key ? "text-white/80" : "text-[#999]"}`}>{counts[v.key]}</span>
            </Link>
          ))}
        </nav>
        <FilterForm className="flex w-full flex-1 gap-2 sm:w-auto sm:justify-end">
          {view !== "inbox" && <input type="hidden" name="view" value={view} />}
          <input type="hidden" name="limit" value={limit} />
          <input name="q" defaultValue={q} placeholder="Search name, email or text…" className="admin-input min-w-0 flex-1 sm:!w-64 sm:flex-none" />
          <AutoSubmitSelect
            name="lang"
            defaultValue={lang}
            options={[
              { value: "", label: "All languages" },
              { value: "en", label: "English" },
              { value: "ja", label: "Japanese" },
            ]}
          />
        </FilterForm>
      </div>

      {(q || lang) && (
        <p className="text-[13px] text-[#666]">
          {total} result{total === 1 ? "" : "s"}
          {q && <> for “{q}”</>} ·{" "}
          <Link href={href({ q: "", lang: "" })} className="text-primary hover:underline">
            Clear search
          </Link>
        </p>
      )}

      {rows.length ? (
        <MessageList key={href({ page })} rows={rows} archivedView={view === "archived"} back={href({ page })} />
      ) : (
        <div className="admin-card p-10 text-center text-[#888]">{q || lang ? "No messages match your search." : EMPTY[view]}</div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Pagination page={page} pages={pages} href={(n) => href({ page: n })} />
        <PageSizeSelect sizes={MESSAGE_PAGE_SIZES} value={limit} params={{ ...(view !== "inbox" && { view }), ...(q && { q }), ...(lang && { lang }) }} />
      </div>
    </div>
  );
}

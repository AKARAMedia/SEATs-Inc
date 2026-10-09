import Link from "next/link";
import MessageList from "@/components/admin/MessageList";
import Pagination from "@/components/admin/ui/Pagination";
import { Icon } from "@/components/admin/ui/icons";
import { adminMessages, type MessageView } from "@/lib/admin-data";

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
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total, pages, counts } = await adminMessages({ view, q, lang, page });

  /** Query string for the current filters plus overrides; defaults are left out. */
  const query = (extra: Record<string, string | number> = {}) => {
    const all: Record<string, string | number> = { view: view === "inbox" ? "" : view, q, lang, ...extra };
    return new URLSearchParams(Object.entries(all).filter(([k, v]) => v !== "" && !(k === "page" && Number(v) <= 1)).map(([k, v]) => [k, String(v)])).toString();
  };
  const href = (extra: Record<string, string | number> = {}) => `/admin/messages/${query(extra) ? `?${query(extra)}` : ""}`;

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
              href={v.key === "inbox" ? "/admin/messages/" : `/admin/messages/?view=${v.key}`}
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
        <form className="flex w-full flex-1 gap-2 sm:w-auto sm:justify-end" role="search">
          {view !== "inbox" && <input type="hidden" name="view" value={view} />}
          <input name="q" defaultValue={q} placeholder="Search name, email or text…" className="admin-input min-w-0 flex-1 sm:!w-64 sm:flex-none" />
          <select name="lang" defaultValue={lang} className="admin-input !w-auto" aria-label="Language">
            <option value="">All languages</option>
            <option value="en">English</option>
            <option value="ja">Japanese</option>
          </select>
          <button className="admin-btn-secondary">Search</button>
        </form>
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

      <Pagination page={page} pages={pages} href={(n) => href({ page: n })} />
    </div>
  );
}

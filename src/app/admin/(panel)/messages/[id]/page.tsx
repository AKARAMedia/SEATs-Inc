import Link from "next/link";
import { notFound } from "next/navigation";
import MarkRead from "@/components/admin/MarkRead";
import { ConfirmForm } from "@/components/admin/ui/confirm";
import { Icon } from "@/components/admin/ui/icons";
import { adminGetMessage } from "@/lib/admin-data";
import { longDate, messageCompany } from "@/lib/format";
import { deleteMessagesAction, setArchivedAction, setReadAction } from "@/app/admin/message-actions";

export const metadata = { title: "Message" };

/** mailto: link with subject and the original message quoted (kept under typical URL limits). */
function replyHref(m: { name: string; email: string; message: string; createdAt: Date; lang: string }) {
  const subject = m.lang === "ja" ? "Re: S.E.A.T.S Inc.へのお問い合わせ" : "Re: Your message to S.E.A.T.S Inc.";
  const quoted = m.message.slice(0, 1200).split("\n").map((l) => `> ${l}`).join("\n");
  const body = `\n\n\nOn ${longDate(m.createdAt)}, ${m.name} wrote:\n${quoted}${m.message.length > 1200 ? "\n> …" : ""}`;
  return `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function MessagePage({ params }: PageProps<"/admin/messages/[id]">) {
  const { id } = await params;
  const m = await adminGetMessage(Number(id));
  if (!m) notFound();
  const company = messageCompany(m.subject);
  const list = m.archivedAt ? "/admin/messages/?view=archived" : "/admin/messages/";
  const nav = "flex size-9 items-center justify-center rounded-md bg-white text-[18px] ring-1 ring-black/10 hover:bg-black/5";
  const off = "flex size-9 items-center justify-center rounded-md text-[18px] text-[#ccc] ring-1 ring-black/5";

  return (
    <div className="max-w-[860px] space-y-4">
      {!m.readAt && <MarkRead id={m.id} />}

      <div className="flex flex-wrap items-center gap-2">
        <Link href={list} className="mr-auto text-[13px] text-[#888] hover:text-primary">
          ← {m.archivedAt ? "Archived" : "Inbox"}
        </Link>
        {m.newerId ? (
          <Link href={`/admin/messages/${m.newerId}/`} className={nav} aria-label="Newer message" title="Newer">
            ‹
          </Link>
        ) : (
          <span className={off}>‹</span>
        )}
        {m.olderId ? (
          <Link href={`/admin/messages/${m.olderId}/`} className={nav} aria-label="Older message" title="Older">
            ›
          </Link>
        ) : (
          <span className={off}>›</span>
        )}
      </div>

      <article className="admin-card">
        <header className="flex flex-wrap items-start gap-4 border-b border-black/10 p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[18px] font-semibold text-primary">
            {m.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[18px] font-semibold text-[#222]">{m.name}</h1>
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[13px]">
              <dt className="text-[#999]">Email</dt>
              <dd>
                <a href={`mailto:${m.email}`} className="text-primary hover:underline">
                  {m.email}
                </a>
              </dd>
              {company && (
                <>
                  <dt className="text-[#999]">Company</dt>
                  <dd>{company}</dd>
                </>
              )}
              {m.phone && (
                <>
                  <dt className="text-[#999]">Phone</dt>
                  <dd>{m.phone}</dd>
                </>
              )}
              <dt className="text-[#999]">Received</dt>
              <dd>
                {longDate(m.createdAt)} · sent from the {m.lang === "ja" ? "Japanese" : "English"} site
              </dd>
            </dl>
          </div>
        </header>
        <p className="whitespace-pre-wrap p-5 text-[15px] leading-relaxed text-[#333]">{m.message}</p>
        <footer className="flex flex-wrap gap-2 border-t border-black/10 bg-[#fafbfc] p-4">
          <a href={replyHref(m)} className="admin-btn">
            <Icon name="reply" className="size-4" /> Reply by email
          </a>
          <form action={setReadAction}>
            <input type="hidden" name="id" value={m.id} />
            <input type="hidden" name="read" value="false" />
            <input type="hidden" name="back" value={list} />
            <button className="admin-btn-secondary">Mark unread</button>
          </form>
          <form action={setArchivedAction}>
            <input type="hidden" name="id" value={m.id} />
            <input type="hidden" name="archived" value={String(!m.archivedAt)} />
            <input type="hidden" name="back" value={list} />
            <button className="admin-btn-secondary">
              <Icon name="archive" className="size-4" /> {m.archivedAt ? "Move to inbox" : "Archive"}
            </button>
          </form>
          <ConfirmForm
            action={deleteMessagesAction}
            fields={{ id: m.id, back: list }}
            confirm={{ title: "Delete this message?", message: `The message from ${m.name} will be permanently deleted.`, confirmLabel: "Delete", danger: true }}
            className="ml-auto"
          >
            <button className="admin-btn-secondary !text-red-600 hover:!bg-red-50">
              <Icon name="trash" className="size-4" /> Delete
            </button>
          </ConfirmForm>
        </footer>
      </article>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteMessagesAction, setArchivedAction, setReadAction } from "@/app/admin/message-actions";
import { messageCompany, shortDate } from "@/lib/format";
import { confirmDialog } from "./ui/confirm";
import { Icon } from "./ui/icons";
import { toast } from "./ui/toast";

type Message = { id: number; name: string; email: string; subject: string; message: string; lang: string; readAt: Date | null; createdAt: Date };

/** Inbox rows with checkboxes and bulk actions (read/unread, archive, delete). */
export default function MessageList({ rows, archivedView, back }: { rows: Message[]; archivedView: boolean; back: string }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pending, start] = useTransition();
  const all = rows.length > 0 && selected.size === rows.length;
  const n = selected.size;

  const toggle = (id: number) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // `done` toasts after refresh-only actions; delete redirects back here and shows its own flash toast
  const run = (action: (fd: FormData) => Promise<void>, extra: Record<string, string>, done?: string) => {
    const fd = new FormData();
    selected.forEach((id) => fd.append("id", String(id)));
    Object.entries(extra).forEach(([k, v]) => fd.set(k, v));
    start(async () => {
      await action(fd);
      setSelected(new Set());
      if (done) toast(done);
    });
  };

  const btn = "admin-btn-secondary !px-3 !py-1.5 text-[13px] disabled:opacity-50";

  return (
    <div className="admin-card overflow-hidden">
      <div className="flex min-h-[52px] flex-wrap items-center gap-2 border-b border-black/10 bg-[#fafbfc] px-4 py-2">
        <label className="mr-2 flex items-center gap-2 text-[13px] text-[#666]">
          <input
            type="checkbox"
            checked={all}
            onChange={() => setSelected(all ? new Set() : new Set(rows.map((r) => r.id)))}
            className="size-4 accent-[var(--color-primary)]"
            aria-label="Select all"
          />
          {n ? `${n} selected` : "Select all"}
        </label>
        {n > 0 && (
          <>
            <button className={btn} disabled={pending} onClick={() => run(setReadAction, { read: "true" }, "Marked as read.")}>
              Mark read
            </button>
            <button className={btn} disabled={pending} onClick={() => run(setReadAction, { read: "false" }, "Marked as unread.")}>
              Mark unread
            </button>
            <button
              className={btn}
              disabled={pending}
              onClick={() => run(setArchivedAction, { archived: String(!archivedView) }, archivedView ? "Moved to inbox." : "Archived.")}
            >
              <Icon name="archive" className="size-4" /> {archivedView ? "Move to inbox" : "Archive"}
            </button>
            <button
              className={`${btn} !text-red-600`}
              disabled={pending}
              onClick={async () => {
                const ok = await confirmDialog({
                  title: `Delete ${n} message${n > 1 ? "s" : ""}?`,
                  message: "They will be permanently deleted. To keep them out of the inbox, archive them instead.",
                  confirmLabel: "Delete",
                  danger: true,
                });
                if (ok) run(deleteMessagesAction, { back });
              }}
            >
              <Icon name="trash" className="size-4" /> Delete
            </button>
          </>
        )}
      </div>

      <ul className="divide-y divide-black/5">
        {rows.map((m) => {
          const unread = !m.readAt;
          const company = messageCompany(m.subject);
          return (
            <li key={m.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-[#f7f9fb] ${selected.has(m.id) ? "bg-primary/5" : ""}`}>
              <input
                type="checkbox"
                checked={selected.has(m.id)}
                onChange={() => toggle(m.id)}
                className="mt-1 size-4 shrink-0 accent-[var(--color-primary)]"
                aria-label={`Select message from ${m.name}`}
              />
              <span className={`mt-2 size-2 shrink-0 rounded-full ${unread ? "bg-primary" : ""}`} title={unread ? "Unread" : undefined} />
              <Link href={`/admin/messages/${m.id}/`} prefetch={false} className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className={`truncate text-[14px] ${unread ? "font-bold text-[#111]" : "font-medium text-[#444]"}`}>{m.name}</span>
                  {company && <span className="hidden truncate text-[13px] text-[#888] sm:inline">· {company}</span>}
                  <span className="admin-badge ml-auto shrink-0 bg-black/5 !px-1.5 text-[10px] uppercase text-[#777]">{m.lang}</span>
                  <time className={`shrink-0 text-[12px] ${unread ? "font-semibold text-[#333]" : "text-[#999]"}`}>{shortDate(new Date(m.createdAt))}</time>
                </span>
                <span className="block truncate text-[13px] text-[#666]">
                  <span className="text-[#999]">{m.email} — </span>
                  {m.message}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

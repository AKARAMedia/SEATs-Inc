import { adminMessages } from "@/lib/admin-data";
import { ConfirmForm } from "@/components/admin/ui/confirm";
import { deleteMessageAction } from "../../actions";

export const metadata = { title: "Contact messages" };

export default async function MessagesPage() {
  const messages = await adminMessages();
  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-semibold">
        Contact messages <span className="text-[14px] font-normal text-[#888]">({messages.length})</span>
      </h1>
      {!messages.length && <p className="rounded-lg bg-white p-8 text-center text-[#888] ring-1 ring-black/5">No messages yet.</p>}
      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className="rounded-lg bg-white p-4 ring-1 ring-black/5">
            <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <strong className="text-[15px]">{m.name}</strong>
              <a href={`mailto:${m.email}`} className="text-[13px] text-primary hover:underline">
                {m.email}
              </a>
              {m.phone && <span className="text-[13px] text-[#666]">{m.phone}</span>}
              <span className="rounded bg-black/5 px-1.5 text-[11px] font-semibold uppercase text-[#777]">{m.lang}</span>
              <time className="ml-auto text-[12px] text-[#999]">
                {m.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh", dateStyle: "medium", timeStyle: "short" })}
              </time>
            </div>
            {m.subject && <p className="mb-1 font-semibold">{m.subject}</p>}
            <p className="whitespace-pre-wrap text-[14px] text-[#444]">{m.message}</p>
            <ConfirmForm
              action={deleteMessageAction}
              fields={{ id: m.id }}
              confirm={{ title: "Delete this message?", message: `The message from ${m.name} will be permanently deleted.`, confirmLabel: "Delete", danger: true }}
              className="mt-3 text-right"
            >
              <button className="text-[12px] text-red-600 hover:underline">Delete</button>
            </ConfirmForm>
          </li>
        ))}
      </ul>
    </div>
  );
}

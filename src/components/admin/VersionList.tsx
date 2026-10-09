import Link from "next/link";
import { ConfirmForm } from "./ui/confirm";
import { Icon } from "./ui/icons";
import { fmtDateTime } from "@/lib/admin-data";

type Version = { id: number; userName: string; note: string; createdAt: Date };

/** Saved versions with Compare / Restore. The newest version is the current state. */
export default function VersionList({
  versions,
  restore,
  fields,
  compareHref,
  canRestore = true,
}: {
  versions: Version[];
  restore: (fd: FormData) => Promise<void>;
  fields: Record<string, string | number>;
  compareHref?: (id: number) => string;
  canRestore?: boolean;
}) {
  if (!versions.length) return <p className="text-[13px] text-[#999]">No changes recorded yet. Every save from now on is kept here.</p>;
  return (
    <ol className="divide-y divide-black/5">
      {versions.map((v, i) => (
        <li key={v.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-[13px]">
          <Icon name="clock" className="size-4 shrink-0 text-[#aaa]" />
          <span className="min-w-0 flex-1">
            <span className="font-medium text-[#333]">{fmtDateTime(v.createdAt)}</span>
            <span className="text-[#888]"> · {v.userName}</span>
            {i === 0 && <span className="admin-badge ml-2 bg-green-50 text-green-700">Current</span>}
            {v.note && <span className="block text-[12px] text-[#999]">{v.note}</span>}
          </span>
          {i > 0 && (
            <span className="flex gap-3">
              {compareHref && (
                <Link href={compareHref(v.id)} className="text-primary hover:underline">
                  Compare
                </Link>
              )}
              {canRestore && (
                <ConfirmForm
                  action={restore}
                  fields={{ ...fields, versionId: v.id }}
                  confirm={{
                    title: "Restore this version?",
                    message: `The content goes back to how it was on ${fmtDateTime(v.createdAt)}. The current version stays in the history, so you can undo this.`,
                    confirmLabel: "Restore",
                  }}
                >
                  <button className="text-primary hover:underline">Restore</button>
                </ConfirmForm>
              )}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

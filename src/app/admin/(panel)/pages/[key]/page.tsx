import Link from "next/link";
import { notFound } from "next/navigation";
import PageEditor from "@/components/admin/pages/PageEditor";
import VersionList from "@/components/admin/VersionList";
import { ConfirmForm } from "@/components/admin/ui/confirm";
import { Icon } from "@/components/admin/ui/icons";
import { listVersions } from "@/lib/activity";
import { requireAdmin } from "@/lib/auth";
import { isPageKey, PAGES } from "@/lib/pages/registry";
import { loadPageForEdit } from "@/lib/pages/store";
import { resetPageAction, restorePageVersionAction } from "@/app/admin/page-actions";

export const metadata = { title: "Edit page" };

export default async function EditPage({ params }: PageProps<"/admin/pages/[key]">) {
  await requireAdmin("content");
  const { key } = await params;
  if (!isPageKey(key)) notFound();
  const def = PAGES[key];
  const [{ value, updatedAt }, history] = await Promise.all([loadPageForEdit(key), listVersions(`page:${key}`, 30)]);

  return (
    <div className="max-w-[1100px] space-y-4">
      <Link href="/admin/pages/" className="text-[13px] text-[#888] hover:text-primary">
        ← All pages
      </Link>
      <PageEditor
        key={updatedAt?.toISOString() ?? "default"}
        pageKey={key}
        title={def.title}
        path={def.path}
        initial={value as Record<string, unknown>}
        defaults={def.defaults}
        fixed={"fixed" in def ? [...(def.fixed as string[])] : []}
        labels={"labels" in def ? (def.labels as Record<string, string>) : {}}
      />
      <p className="text-[13px] text-[#888]">
        Japanese text can also be translated paragraph by paragraph in the{" "}
        <Link href={`/admin/translate/page-${key}/`} className="text-primary hover:underline">
          Translation Center
        </Link>
        .
      </p>
      <details className="admin-card group p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-[15px] font-semibold">
          <Icon name="history" className="size-4 text-[#888]" />
          History <span className="text-[13px] font-normal text-[#999]">({history.length})</span>
          <span className="ml-auto text-[12px] font-normal text-[#999] group-open:hidden">Show</span>
        </summary>
        <div className="mt-3 space-y-4">
          <VersionList versions={history} restore={restorePageVersionAction} fields={{ key }} />
          {updatedAt && (
            <ConfirmForm
              action={resetPageAction}
              fields={{ key }}
              confirm={{ title: "Go back to the original content?", message: "The page returns to the content it had when the new website launched. Your edits stay in the history.", confirmLabel: "Reset page", danger: true }}
            >
              <button className="text-[13px] text-red-600 hover:underline">Reset to the original content…</button>
            </ConfirmForm>
          )}
        </div>
      </details>
    </div>
  );
}

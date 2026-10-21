import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import JobForm from "@/components/admin/careers/JobForm";
import { ConfirmForm } from "@/components/admin/ui/confirm";
import { Icon } from "@/components/admin/ui/icons";
import { db, ready } from "@/db";
import { JOB_TYPES, jobs } from "@/db/schema";
import { toLocalInput } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { deleteJobAction } from "@/app/admin/career-actions";

export const metadata = { title: "Edit job" };

export default async function EditJobPage({ params }: PageProps<"/admin/careers/jobs/[id]">) {
  await requireAdmin("careers");
  await ready();
  const { id } = await params;
  const [j] = await db.select().from(jobs).where(eq(jobs.id, Number(id)));
  if (!j || j.site !== "main") notFound();
  const live = j.open && (!j.closesAt || j.closesAt > new Date());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto min-w-0">
          <Link href="/admin/careers/" className="text-[13px] text-[#888] hover:text-primary">
            ← Careers
          </Link>
          <h1 className="truncate text-[22px] font-semibold">{j.titleEn}</h1>
        </div>
        {live && (
          <a href={`/careers/${j.slug}/`} target="_blank" className="admin-btn-secondary">
            View on website ↗
          </a>
        )}
        <Link href={`/admin/translate/job-${j.id}/`} className="admin-btn-secondary">
          <Icon name="translate" className="size-4" /> Translate
        </Link>
        <Link href={`/admin/careers/?tab=applications&job=${j.id}`} className="admin-btn-secondary">
          Applications
        </Link>
        <ConfirmForm
          action={deleteJobAction}
          fields={{ id: j.id }}
          confirm={{ title: "Delete this job?", message: "It is removed from the website. Applications already received are kept.", confirmLabel: "Delete job", danger: true }}
        >
          <button className="admin-btn-secondary !text-red-600 hover:!bg-red-50">Delete</button>
        </ConfirmForm>
      </div>
      <JobForm
        key={j.updatedAt.toISOString()}
        types={JOB_TYPES}
        values={{ ...j, closesAt: j.closesAt ? toLocalInput(j.closesAt) : "" }}
      />
    </div>
  );
}

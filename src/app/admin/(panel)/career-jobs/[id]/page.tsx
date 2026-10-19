import Link from "next/link";
import { notFound } from "next/navigation";
import CareerJobForm from "@/components/admin/CareerJobForm";
import { ConfirmForm } from "@/components/admin/ui/confirm";
import { requireAdmin } from "@/lib/auth";
import { getCareerSiteJob } from "@/lib/career-site";
import { deleteCareerJobAction } from "@/app/admin/career-job-actions";

export const metadata = { title: "Edit career job" };

export default async function EditCareerJobPage({ params }: PageProps<"/admin/career-jobs/[id]">) {
  await requireAdmin("careers");
  const { id } = await params;
  const j = await getCareerSiteJob(Number(id));
  if (!j) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto min-w-0">
          <Link href="/admin/career-jobs/" className="text-[13px] text-[#888] hover:text-primary">
            ← Career Jobs
          </Link>
          <h1 className="truncate text-[22px] font-semibold">{j.titleEn}</h1>
        </div>
        {j.open && (
          <a href={`https://seatsinc-career.com/jobs/${j.slug}/`} target="_blank" rel="noopener noreferrer" className="admin-btn-secondary">
            View on website ↗
          </a>
        )}
        <ConfirmForm
          action={deleteCareerJobAction}
          fields={{ id: j.id }}
          confirm={{ title: "Delete this job?", message: "It is removed from seatsinc-career.com immediately.", confirmLabel: "Delete job", danger: true }}
        >
          <button className="admin-btn-secondary !text-red-600 hover:!bg-red-50">Delete</button>
        </ConfirmForm>
      </div>
      <CareerJobForm
        key={j.updatedAt.toISOString()}
        values={{
          id: j.id,
          title: j.titleEn,
          jobType: j.type,
          salaryRange: j.salaryRange,
          workDays: j.workDays,
          workplace: j.location,
          responsibilitiesHtml: j.descriptionEn,
          slug: j.slug,
          open: j.open,
        }}
      />
    </div>
  );
}

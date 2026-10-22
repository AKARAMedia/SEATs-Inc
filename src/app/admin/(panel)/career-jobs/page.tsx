import Link from "next/link";
import { redirect } from "next/navigation";
import PageSizeSelect from "@/components/admin/ui/PageSizeSelect";
import Pagination from "@/components/admin/ui/Pagination";
import { Icon } from "@/components/admin/ui/icons";
import { requireAdmin } from "@/lib/auth";
import { CAREER_JOB_PAGE_SIZES, listCareerSiteJobs } from "@/lib/career-site";
import { importCareerJobsSeedAction } from "@/app/admin/career-job-actions";
import CareerJobOpenToggle from "@/components/admin/CareerJobOpenToggle";

export const metadata = { title: "Career Jobs" };

export default async function CareerJobsPage({ searchParams }: PageProps<"/admin/career-jobs">) {
  await requireAdmin("careers");
  const sp = await searchParams;
  const pageParam = Number(sp.page);
  const limitParam = Number(sp.limit);
  const limit = CAREER_JOB_PAGE_SIZES.find((n) => n === limitParam) ?? CAREER_JOB_PAGE_SIZES[0];
  const { rows, total, pages, page } = await listCareerSiteJobs({ page: Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1, size: limit });
  const href = (n: number) => `/admin/career-jobs/?${new URLSearchParams({ limit: String(limit), page: String(n) })}`;
  // Keep `page` and `limit` visible in the URL, and fix up values that were out of range
  if (page !== pageParam || limit !== limitParam) redirect(href(page));

  return (
    <div className="max-w-[1100px] space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-[22px] font-semibold">Career Jobs</h1>
          <p className="text-[13px] text-[#888]">Job postings on seatsinc-career.com. Applicants are sent to Telegram HR, same as the live site.</p>
        </div>
        <a href="https://seatsinc-career.com/jobs/" target="_blank" rel="noopener noreferrer" className="admin-btn-secondary">
          View Jobs page ↗
        </a>
        <form action={importCareerJobsSeedAction}>
          <button className="admin-btn-secondary" type="submit">
            Import from seed
          </button>
        </form>
        <Link href="/admin/career-jobs/new/" className="admin-btn">
          <Icon name="plus" className="size-4" /> New job
        </Link>
      </div>

      {total ? (
        <ul className="admin-card divide-y divide-black/5">
          {rows.map((j) => (
            <li key={j.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <Link href={`/admin/career-jobs/${j.id}/`} className="min-w-0 flex-1 basis-[260px]">
                <span className="block truncate font-medium text-[#222] hover:text-primary">{j.titleEn}</span>
                <span className="block text-[12px] text-[#999]">{[j.type, j.location].filter(Boolean).join(" · ")}</span>
              </Link>
              <span className={`admin-badge ${j.open ? "bg-green-50 text-green-700" : "bg-black/5 text-[#777]"}`}>{j.open ? "Open" : "Closed"}</span>
              <CareerJobOpenToggle id={j.id} open={j.open} />
              <Link href={`/admin/career-jobs/${j.id}/`} className="admin-btn-secondary !py-1 text-[13px]">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="admin-card p-10 text-center text-[#888]">
          No career-site jobs yet.
          <div className="mt-4 flex items-center justify-center gap-3">
            <form action={importCareerJobsSeedAction}>
              <button className="admin-btn" type="submit">
                Import the 41 postings from seed
              </button>
            </form>
            <Link href="/admin/career-jobs/new/" className="admin-btn-secondary">
              Or create one manually
            </Link>
          </div>
        </div>
      )}

      {total > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Pagination page={page} pages={pages} href={href} />
          <PageSizeSelect sizes={CAREER_JOB_PAGE_SIZES} value={limit} params={{}} />
          <span className="text-[12px] text-[#999]">{total} job{total === 1 ? "" : "s"}</span>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, desc, eq } from "drizzle-orm";
import AutoSubmitSelect from "@/components/admin/ui/AutoSubmitSelect";
import FilterForm from "@/components/admin/ui/FilterForm";
import PageSizeSelect from "@/components/admin/ui/PageSizeSelect";
import Pagination from "@/components/admin/ui/Pagination";
import { Icon } from "@/components/admin/ui/icons";
import { db, ready } from "@/db";
import { APPLICATION_STATUSES, jobApplications, jobs, type ApplicationStatus } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { CAREER_DEPARTMENTS } from "@/lib/career-departments";
import { STATUS_LABELS } from "@/lib/careers";
import { CAREER_JOB_PAGE_SIZES, listCareerSiteJobs } from "@/lib/career-site";
import { shortDate } from "@/lib/format";
import { importCareerJobsSeedAction } from "@/app/admin/career-job-actions";
import CareerJobOpenToggle from "@/components/admin/CareerJobOpenToggle";
import CareerJobQuickEdit from "@/components/admin/CareerJobQuickEdit";

export const metadata = { title: "Career Jobs" };

export default async function CareerJobsPage({ searchParams }: PageProps<"/admin/career-jobs">) {
  await requireAdmin("careers");
  await ready();
  const sp = await searchParams;
  const tab = sp.tab === "applications" ? "applications" : "jobs";
  const [{ newCount }] = await db
    .select({ newCount: count() })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .where(and(eq(jobs.site, "career"), eq(jobApplications.status, "new")));

  return (
    <div className="max-w-[1100px] space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-[22px] font-semibold">Career Jobs</h1>
          <p className="text-[13px] text-[#888]">Job postings on seatsinc-career.com and the applications people send (by Telegram or the on-site form).</p>
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

      <nav className="flex gap-1 border-b border-black/10" aria-label="Career Jobs sections">
        {(
          [
            ["jobs", "Job posts"],
            ["applications", "Applications"],
          ] as const
        ).map(([k, l]) => (
          <Link
            key={k}
            href={k === "jobs" ? "/admin/career-jobs/" : "/admin/career-jobs/?tab=applications"}
            aria-current={tab === k ? "page" : undefined}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[14px] font-semibold ${tab === k ? "border-primary text-primary" : "border-transparent text-[#666] hover:text-[#222]"}`}
          >
            {l}
            {k === "applications" && newCount > 0 && <span className="rounded-full bg-red-600 px-1.5 text-[11px] text-white">{newCount} new</span>}
          </Link>
        ))}
      </nav>

      {tab === "jobs" ? (
        <JobsTab searchParams={sp} />
      ) : (
        <ApplicationsTab status={typeof sp.status === "string" ? sp.status : ""} job={Number(sp.job) || 0} />
      )}
    </div>
  );
}

async function JobsTab({ searchParams: sp }: { searchParams: Awaited<PageProps<"/admin/career-jobs">["searchParams"]> }) {
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const department = typeof sp.department === "string" ? sp.department : "";
  const pageParam = Number(sp.page);
  const limitParam = Number(sp.limit);
  const limit = CAREER_JOB_PAGE_SIZES.find((n) => n === limitParam) ?? CAREER_JOB_PAGE_SIZES[0];
  const { rows, total, pages, page } = await listCareerSiteJobs({
    page: Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1,
    size: limit,
    q,
    department,
  });
  const href = (n: number) =>
    `/admin/career-jobs/?${new URLSearchParams({ ...(q && { q }), ...(department && { department }), limit: String(limit), page: String(n) })}`;
  // Keep `page` and `limit` visible in the URL, and fix up values that were out of range
  if (page !== pageParam || limit !== limitParam) redirect(href(page));

  return (
    <div className="space-y-4">
      <FilterForm className="flex flex-wrap gap-2">
        <input type="hidden" name="limit" value={limit} />
        <input name="q" defaultValue={q} placeholder="Search title, department or location…" className="admin-input w-full sm:!w-72" />
        <AutoSubmitSelect
          name="department"
          defaultValue={department}
          options={[{ value: "", label: "All departments" }, ...CAREER_DEPARTMENTS.map((d) => ({ value: d, label: d }))]}
        />
      </FilterForm>

      {(q || department) && (
        <p className="text-[13px] text-[#666]">
          {total} result{total === 1 ? "" : "s"}
          {q && <> for “{q}”</>}
          {department && <> in {department}</>} ·{" "}
          <Link href={`/admin/career-jobs/?${new URLSearchParams({ limit: String(limit), page: "1" })}`} className="text-primary hover:underline">
            Clear filters
          </Link>
        </p>
      )}

      {total ? (
        <ul className="admin-card divide-y divide-black/5">
          {rows.map((j) => (
            <li key={j.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <Link href={`/admin/career-jobs/${j.id}/`} className="min-w-0 flex-1 basis-[260px]">
                <span className="block truncate font-medium text-[#222] hover:text-primary">{j.titleEn}</span>
                <span className="block text-[12px] text-[#999]">{[j.type, j.department, j.location].filter(Boolean).join(" · ")}</span>
              </Link>
              <Link href={`/admin/career-jobs/?tab=applications&job=${j.id}`} className="text-[13px] text-primary hover:underline">
                {Number(j.applications)} application{Number(j.applications) === 1 ? "" : "s"}
                {Number(j.newApplications) > 0 && <span className="ml-1 rounded-full bg-red-600 px-1.5 text-[11px] text-white">{Number(j.newApplications)} new</span>}
              </Link>
              <span className={`admin-badge ${j.open ? "bg-green-50 text-green-700" : "bg-black/5 text-[#777]"}`}>{j.open ? "Open" : "Closed"}</span>
              <CareerJobOpenToggle id={j.id} open={j.open} />
              <CareerJobQuickEdit
                values={{ id: j.id, type: j.type, department: j.department, location: j.location, salaryRange: j.salaryRange, workDays: j.workDays }}
              />
              <Link href={`/admin/career-jobs/${j.id}/`} className="admin-btn-secondary !py-1 text-[13px]">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      ) : q || department ? (
        <div className="admin-card p-10 text-center text-[#888]">No career-site jobs match your filters.</div>
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
          <PageSizeSelect sizes={CAREER_JOB_PAGE_SIZES} value={limit} params={{ ...(q && { q }), ...(department && { department }) }} />
          <span className="text-[12px] text-[#999]">{total} job{total === 1 ? "" : "s"}</span>
        </div>
      )}
    </div>
  );
}

async function ApplicationsTab({ status, job }: { status: string; job: number }) {
  const valid = (APPLICATION_STATUSES as readonly string[]).includes(status) ? (status as ApplicationStatus) : null;
  const [rows, counts, jobList] = await Promise.all([
    db
      .select({ a: jobApplications })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .where(and(eq(jobs.site, "career"), valid ? eq(jobApplications.status, valid) : undefined, job ? eq(jobApplications.jobId, job) : undefined))
      .orderBy(desc(jobApplications.createdAt))
      .limit(200),
    db
      .select({ status: jobApplications.status, n: count() })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .where(and(eq(jobs.site, "career"), job ? eq(jobApplications.jobId, job) : undefined))
      .groupBy(jobApplications.status),
    db.select({ id: jobs.id, title: jobs.titleEn }).from(jobs).where(eq(jobs.site, "career")).orderBy(desc(jobs.createdAt)),
  ]);
  const n = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;
  const all = counts.reduce((a, c) => a + c.n, 0);
  const qs = (patch: Record<string, string | number>) => {
    const p = new URLSearchParams({ tab: "applications", ...(valid && { status: valid }), ...(job && { job: String(job) }) });
    for (const [k, v] of Object.entries(patch)) {
      if (v) p.set(k, String(v));
      else p.delete(k);
    }
    return `/admin/career-jobs/?${p}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap gap-1 rounded-lg bg-white p-1 ring-1 ring-black/5 text-[13px]" aria-label="Filter by status">
          <Link href={qs({ status: "" })} className={`rounded-md px-3 py-1.5 font-semibold ${!valid ? "bg-primary text-white" : "text-[#555] hover:bg-black/5"}`}>
            All <span className={!valid ? "text-white/80" : "text-[#999]"}>{all}</span>
          </Link>
          {APPLICATION_STATUSES.map((s) => (
            <Link key={s} href={qs({ status: s })} className={`rounded-md px-3 py-1.5 font-semibold ${valid === s ? "bg-primary text-white" : "text-[#555] hover:bg-black/5"}`}>
              {STATUS_LABELS[s].label} <span className={valid === s ? "text-white/80" : "text-[#999]"}>{n(s)}</span>
            </Link>
          ))}
        </nav>
        <form className="ml-auto flex gap-2">
          <input type="hidden" name="tab" value="applications" />
          {valid && <input type="hidden" name="status" value={valid} />}
          <select name="job" defaultValue={job || ""} className="admin-input !w-auto max-w-[260px]" aria-label="Job">
            <option value="">All jobs</option>
            {jobList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <button className="admin-btn-secondary">Filter</button>
        </form>
      </div>
      {rows.length ? (
        <ul className="admin-card divide-y divide-black/5">
          {rows.map(({ a }) => (
            <li key={a.id}>
              <Link href={`/admin/careers/applications/${a.id}/`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-[#f7f9fb]">
                <span className={`size-2 shrink-0 rounded-full ${a.status === "new" ? "bg-red-600" : ""}`} />
                <span className="min-w-0 flex-1 basis-[220px]">
                  <span className={`block truncate ${a.status === "new" ? "font-bold text-[#111]" : "font-medium text-[#333]"}`}>{a.name}</span>
                  <span className="block truncate text-[12px] text-[#999]">
                    {a.jobTitle} · {a.email}
                    {a.telegramUsername && ` · @${a.telegramUsername}`}
                  </span>
                </span>
                <span className={`admin-badge ${STATUS_LABELS[a.status].cls}`}>{STATUS_LABELS[a.status].label}</span>
                <time className="w-[80px] text-right text-[12px] text-[#999]">{shortDate(a.createdAt)}</time>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-card p-10 text-center text-[#888]">No applications{valid || job ? " for this filter" : " yet"}.</p>
      )}
    </div>
  );
}

import Link from "next/link";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { JobOpenToggle } from "@/components/admin/careers/ApplicationControls";
import { Icon } from "@/components/admin/ui/icons";
import { db, ready } from "@/db";
import { APPLICATION_STATUSES, jobApplications, jobs, type ApplicationStatus } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { STATUS_LABELS } from "@/lib/careers";
import { shortDate } from "@/lib/format";

export const metadata = { title: "Careers" };

export default async function CareersPage({ searchParams }: PageProps<"/admin/careers">) {
  await requireAdmin("careers");
  await ready();
  const sp = await searchParams;
  const tab = sp.tab === "applications" ? "applications" : "jobs";
  const [{ newCount }] = await db.select({ newCount: count() }).from(jobApplications).where(eq(jobApplications.status, "new"));

  return (
    <div className="max-w-[1100px] space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-[22px] font-semibold">Careers</h1>
          <p className="text-[13px] text-[#888]">Job posts on the Recruit page, and the applications people send.</p>
        </div>
        <a href="/option-career/" target="_blank" className="admin-btn-secondary">
          View Recruit page ↗
        </a>
        <Link href="/admin/careers/jobs/new/" className="admin-btn">
          <Icon name="plus" className="size-4" /> New job
        </Link>
      </div>
      <nav className="flex gap-1 border-b border-black/10" aria-label="Careers sections">
        {(
          [
            ["jobs", "Job posts"],
            ["applications", "Applications"],
          ] as const
        ).map(([k, l]) => (
          <Link
            key={k}
            href={k === "jobs" ? "/admin/careers/" : "/admin/careers/?tab=applications"}
            aria-current={tab === k ? "page" : undefined}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[14px] font-semibold ${tab === k ? "border-primary text-primary" : "border-transparent text-[#666] hover:text-[#222]"}`}
          >
            {l}
            {k === "applications" && newCount > 0 && <span className="rounded-full bg-red-600 px-1.5 text-[11px] text-white">{newCount} new</span>}
          </Link>
        ))}
      </nav>
      {tab === "jobs" ? <JobsTab /> : <ApplicationsTab status={typeof sp.status === "string" ? sp.status : ""} job={Number(sp.job) || 0} />}
    </div>
  );
}

async function JobsTab() {
  const rows = await db
    .select({
      job: jobs,
      total: sql<number>`(select count(*)::int from ${jobApplications} where ${jobApplications.jobId} = ${jobs.id})`,
      fresh: sql<number>`(select count(*)::int from ${jobApplications} where ${jobApplications.jobId} = ${jobs.id} and ${jobApplications.status} = 'new')`,
    })
    .from(jobs)
    .where(eq(jobs.site, "main"))
    .orderBy(desc(jobs.open), desc(jobs.createdAt));
  if (!rows.length)
    return (
      <div className="admin-card p-10 text-center text-[#888]">
        No job posts yet. When a job is open, it appears on the Recruit page with an application form.
        <div className="mt-4">
          <Link href="/admin/careers/jobs/new/" className="admin-btn">
            Create the first job
          </Link>
        </div>
      </div>
    );
  return (
    <ul className="admin-card divide-y divide-black/5">
      {rows.map(({ job: j, total, fresh }) => {
        const state = !j.open ? ["Closed", "bg-black/5 text-[#777]"] : ["Open", "bg-green-50 text-green-700"];
        return (
          <li key={j.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <Link href={`/admin/careers/jobs/${j.id}/`} prefetch={false} className="min-w-0 flex-1 basis-[260px]">
              <span className="block truncate font-medium text-[#222] hover:text-primary">{j.titleEn}</span>
              <span className="block text-[12px] text-[#999]">
                {[j.type, j.department, j.location].filter(Boolean).join(" · ")}
                {` · posted ${shortDate(j.createdAt)}`}
                {!j.titleJa && " · no Japanese title"}
              </span>
            </Link>
            <Link href={`/admin/careers/?tab=applications&job=${j.id}`} prefetch={false} className="text-[13px] text-primary hover:underline">
              {Number(total)} application{Number(total) === 1 ? "" : "s"}
              {Number(fresh) > 0 && <span className="ml-1 rounded-full bg-red-600 px-1.5 text-[11px] text-white">{Number(fresh)} new</span>}
            </Link>
            <span className={`admin-badge ${state[1]}`}>{state[0]}</span>
            <JobOpenToggle id={j.id} open={j.open} />
            <Link href={`/admin/careers/jobs/${j.id}/`} prefetch={false} className="admin-btn-secondary !py-1 text-[13px]">
              Edit
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

async function ApplicationsTab({ status, job }: { status: string; job: number }) {
  const valid = (APPLICATION_STATUSES as readonly string[]).includes(status) ? (status as ApplicationStatus) : null;
  const [rows, counts, jobList] = await Promise.all([
    db
      .select()
      .from(jobApplications)
      .where(and(valid ? eq(jobApplications.status, valid) : undefined, job ? eq(jobApplications.jobId, job) : undefined))
      .orderBy(desc(jobApplications.createdAt))
      .limit(200),
    db
      .select({ status: jobApplications.status, n: count() })
      .from(jobApplications)
      .where(job ? eq(jobApplications.jobId, job) : undefined)
      .groupBy(jobApplications.status),
    db.select({ id: jobs.id, title: jobs.titleEn }).from(jobs).where(eq(jobs.site, "main")).orderBy(desc(jobs.createdAt)),
  ]);
  const n = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;
  const all = counts.reduce((a, c) => a + c.n, 0);
  const qs = (patch: Record<string, string | number>) => {
    const p = new URLSearchParams({ tab: "applications", ...(valid && { status: valid }), ...(job && { job: String(job) }) });
    for (const [k, v] of Object.entries(patch)) {
      if (v) p.set(k, String(v));
      else p.delete(k);
    }
    return `/admin/careers/?${p}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap gap-1 rounded-lg bg-white p-1 ring-1 ring-black/5 text-[13px]" aria-label="Filter by status">
          <Link href={qs({ status: "" })} prefetch={false} className={`rounded-md px-3 py-1.5 font-semibold ${!valid ? "bg-primary text-white" : "text-[#555] hover:bg-black/5"}`}>
            All <span className={!valid ? "text-white/80" : "text-[#999]"}>{all}</span>
          </Link>
          {APPLICATION_STATUSES.map((s) => (
            <Link key={s} href={qs({ status: s })} prefetch={false} className={`rounded-md px-3 py-1.5 font-semibold ${valid === s ? "bg-primary text-white" : "text-[#555] hover:bg-black/5"}`}>
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
          {rows.map((a) => (
            <li key={a.id}>
              <Link href={`/admin/careers/applications/${a.id}/`} prefetch={false} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-[#f7f9fb]">
                <span className={`size-2 shrink-0 rounded-full ${a.status === "new" ? "bg-red-600" : ""}`} />
                <span className="min-w-0 flex-1 basis-[220px]">
                  <span className={`block truncate ${a.status === "new" ? "font-bold text-[#111]" : "font-medium text-[#333]"}`}>{a.name}</span>
                  <span className="block truncate text-[12px] text-[#999]">
                    {a.jobTitle} · {a.email}
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

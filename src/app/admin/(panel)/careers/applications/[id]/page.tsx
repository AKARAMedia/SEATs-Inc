import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ApplicationControls } from "@/components/admin/careers/ApplicationControls";
import { ConfirmForm } from "@/components/admin/ui/confirm";
import { Icon } from "@/components/admin/ui/icons";
import { db, ready } from "@/db";
import { jobApplications, jobs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { longDate } from "@/lib/format";
import { deleteApplicationAction } from "@/app/admin/career-actions";

export const metadata = { title: "Application" };

export default async function ApplicationPage({ params }: PageProps<"/admin/careers/applications/[id]">) {
  await requireAdmin("careers");
  await ready();
  const { id } = await params;
  const [row] = await db
    .select({ a: jobApplications, jobSite: jobs.site })
    .from(jobApplications)
    .leftJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .where(eq(jobApplications.id, Number(id)));
  if (!row) notFound();
  const { a, jobSite } = row;
  // Applications for seatsinc-career.com jobs are listed under Career Jobs, not the main Careers page.
  const base = jobSite === "career" ? "/admin/career-jobs" : "/admin/careers";
  const cv = `/api/admin/cv/${a.id}/`;
  const subject = encodeURIComponent(a.lang === "ja" ? `【S.E.A.T.S Inc.】${a.jobTitle}へのご応募について` : `Your application for ${a.jobTitle} — S.E.A.T.S Inc.`);

  return (
    <div className="max-w-[1200px] space-y-4">
      <Link href={`${base}/?tab=applications`} className="text-[13px] text-[#888] hover:text-primary">
        ← Applications
      </Link>
      <div className="grid items-start gap-4 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <section className="admin-card space-y-3 p-5">
            <div>
              <h1 className="text-[20px] font-semibold text-[#222]">{a.name}</h1>
              <p className="text-[13px] text-[#888]">
                Applied for <strong className="text-[#444]">{a.jobTitle}</strong>
                {a.jobId && (
                  <>
                    {" "}
                    ·{" "}
                    <Link href={`${base}/${jobSite === "career" ? "" : "jobs/"}${a.jobId}/`} className="text-primary hover:underline">
                      job post
                    </Link>
                  </>
                )}
              </p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
              <dt className="text-[#999]">Email</dt>
              <dd className="break-all">
                <a href={`mailto:${a.email}`} className="text-primary hover:underline">
                  {a.email}
                </a>
              </dd>
              {a.phone && (
                <>
                  <dt className="text-[#999]">Phone</dt>
                  <dd>
                    <a href={`tel:${a.phone}`} className="hover:underline">
                      {a.phone}
                    </a>
                  </dd>
                </>
              )}
              {a.telegramUsername && (
                <>
                  <dt className="text-[#999]">Telegram</dt>
                  <dd>
                    <a href={`https://t.me/${a.telegramUsername}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      @{a.telegramUsername}
                    </a>
                  </dd>
                </>
              )}
              <dt className="text-[#999]">Received</dt>
              <dd>{longDate(a.createdAt)}</dd>
              <dt className="text-[#999]">Language</dt>
              <dd>{a.lang === "ja" ? "Japanese site" : "English site"}</dd>
            </dl>
            {a.message && <p className="whitespace-pre-wrap rounded-md bg-[#fafbfc] p-3 text-[14px] text-[#333] ring-1 ring-black/5">{a.message}</p>}
            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${encodeURIComponent(a.email)}?subject=${subject}`} className="admin-btn">
                <Icon name="reply" className="size-4" /> Email applicant
              </a>
              {a.cvName && (
                <a href={`${cv}?download`} className="admin-btn-secondary">
                  <Icon name="download" className="size-4" /> Download CV
                </a>
              )}
            </div>
          </section>
          <section className="admin-card p-5">
            <ApplicationControls id={a.id} status={a.status} notes={a.notes} />
          </section>
          <ConfirmForm
            action={deleteApplicationAction}
            fields={{ id: a.id }}
            confirm={{ title: "Delete this application?", message: `${a.name}'s application${a.cvName ? " and CV" : ""} will be permanently deleted.`, confirmLabel: "Delete", danger: true }}
          >
            <button className="text-[13px] text-red-600 hover:underline">Delete application{a.cvName ? " and CV" : ""}…</button>
          </ConfirmForm>
        </div>
        {a.cvName ? (
          <section className="admin-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-2 text-[13px]">
              <span className="truncate font-semibold text-[#555]">{a.cvName}</span>
              <span className="text-[#999]">{Math.max(1, Math.round(a.cvSize / 1024))} KB</span>
            </div>
            <iframe src={cv} title={`CV of ${a.name}`} className="h-[80vh] w-full bg-[#eee]" />
          </section>
        ) : (
          <section className="admin-card flex h-[200px] items-center justify-center p-5 text-[13px] text-[#888]">No CV was attached to this application.</section>
        )}
      </div>
    </div>
  );
}

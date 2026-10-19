import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ApplyForm from "@/components/sections/ApplyForm";
import { getOpenJob } from "@/lib/careers";
import { href, isLang } from "@/lib/i18n";

// A job post with its application form. Jobs are managed in admin → Careers.

export async function generateMetadata({ params }: PageProps<"/[lang]/careers/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const job = await getOpenJob(lang, decodeURIComponent(slug));
  return job ? { title: `${job.title} — ${lang === "ja" ? "採用" : "Careers"}` } : {};
}

async function Job({ params }: { params: PageProps<"/[lang]/careers/[slug]">["params"] }) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const job = await getOpenJob(lang, decodeURIComponent(slug));
  if (!job) notFound();
  const closes = job.closesAt
    ? new Date(job.closesAt).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-GB", { timeZone: "Asia/Phnom_Penh", day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="container-site pb-20 pt-10">
      <Link href={href(lang, "/option-career/")} className="text-[14px] text-[#0080cc] hover:underline">
        ← {lang === "ja" ? "採用情報" : "Recruit"}
      </Link>
      <div className="mt-4 grid gap-10 desktop:grid-cols-[1fr_420px]">
        <article className="min-w-0">
          <h1 className="text-[30px] font-bold leading-tight text-[#222] max-[767px]:text-[24px]">{job.title}</h1>
          <p className="mt-3 flex flex-wrap gap-2 text-[14px]">
            {[job.type, job.department, job.location].filter(Boolean).map((t) => (
              <span key={t} className="rounded-full bg-[#eef7fc] px-3 py-1 text-[#0080cc]">
                {t}
              </span>
            ))}
            {closes && <span className="rounded-full bg-[#fff4e5] px-3 py-1 text-[#a35b00]">{lang === "ja" ? `締切：${closes}` : `Apply by ${closes}`}</span>}
          </p>
          <div className="prose-seats mt-6 [&_li]:mb-1 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6" dangerouslySetInnerHTML={{ __html: job.description }} />
        </article>
        <aside className="desktop:sticky desktop:top-6 desktop:self-start">
          <ApplyForm lang={lang} job={job.slug} />
        </aside>
      </div>
    </div>
  );
}

export default function JobPage(props: PageProps<"/[lang]/careers/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Job params={props.params} />
    </Suspense>
  );
}

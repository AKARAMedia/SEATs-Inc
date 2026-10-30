import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Montserrat } from "next/font/google";
import { getPage } from "@/lib/pages/store";
import { listOpenJobs } from "@/lib/careers";
import { href } from "@/lib/i18n";
import Link from "next/link";
import { isLang } from "@/lib/i18n";
import { RECRUIT_HERO_IMAGE } from "@/content/pages/option-career";
import RecruitCtaButtons from "@/components/sections/RecruitCtaButtons";
import WhyJoinUs from "@/components/sections/WhyJoinUs";
import OurBusinesses from "@/components/sections/OurBusinesses";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = { title: "Option Career" };

export default async function Page({ params }: PageProps<"/[lang]/option-career">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  // Editable in admin → Pages
  const [{ CAREER }, openJobs] = await Promise.all([getPage("option-career"), listOpenJobs(lang)]);
  const c = CAREER;

  return (
    <div className="relative overflow-hidden" style={{ "--font-montserrat": montserrat.style.fontFamily } as React.CSSProperties}>
      {/* Decorative corner blobs (desktop only, as on live) */}
      <Image
        src={c.images.blobLeft.src}
        alt=""
        width={c.images.blobLeft.width}
        height={c.images.blobLeft.height}
        className="pointer-events-none absolute left-[-80px] top-[29px] hidden h-auto w-[272px] desktop:block"
      />
      <Image
        src={c.images.blobRight.src}
        alt=""
        width={c.images.blobRight.width}
        height={c.images.blobRight.height}
        className="pointer-events-none absolute right-[-73px] top-[14px] hidden h-auto w-[272px] desktop:block"
      />

      <div className="container-site relative grid gap-10 pb-[60px] pt-[67px] desktop:grid-cols-2 desktop:items-center desktop:gap-16 desktop:pb-[80px] desktop:pt-[120px]">
        <div className="relative order-2 aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-lg desktop:order-1">
          <Image
            src={RECRUIT_HERO_IMAGE.src}
            alt="S.E.A.T.S Inc. team"
            fill
            priority
            sizes="(min-width: 1025px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="order-1 w-full text-center desktop:order-2 desktop:text-left">
          <p
            className={`${montserrat.className} text-[32px] font-bold leading-[1.4] text-[#0080cc] desktop:text-[56px] desktop:leading-[1.1]`}
          >
            <span className="mr-[30px] desktop:mr-0 desktop:block">{c.heading.join}</span>
            <span className="mr-[30px] text-[#abcd05] desktop:mr-[20px]">{c.heading.our}</span>
            <span>{c.heading.team}</span>
          </p>
          <p className="mt-[25px] text-[16px] leading-[1.6]">{c.text[lang]}</p>

          <div className="mt-[35px] flex justify-center desktop:mt-[45px] desktop:justify-start">
            <RecruitCtaButtons lang={lang} size="lg" />
          </div>
        </div>
      </div>

      {/* Job posts from admin → Careers (section only appears when a position is open) */}
      {openJobs.length > 0 && (
        <section className="container-site relative pb-[80px]">
          <h2 className={`${montserrat.className} mb-6 text-center text-[28px] font-bold text-[#0080cc] desktop:text-[36px]`}>{lang === "ja" ? "募集中のポジション" : "Open positions"}</h2>
          <ul className="mx-auto grid max-w-[960px] gap-4 tablet:grid-cols-2">
            {openJobs.map((j) => (
              <li key={j.slug}>
                <Link
                  href={href(lang, `/careers/${j.slug}/`)}
                  className="block h-full rounded-[12px] border-2 border-[#e4f1f6] bg-white p-5 transition-colors hover:border-[#0080cc]"
                >
                  <span className="block text-[19px] font-bold leading-snug text-[#222]">{j.title}</span>
                  <span className="mt-2 flex flex-wrap gap-2 text-[13px]">
                    {[j.type, j.department, j.location].filter(Boolean).map((t) => (
                      <span key={t} className="rounded-full bg-[#eef7fc] px-2.5 py-0.5 text-[#0080cc]">
                        {t}
                      </span>
                    ))}
                  </span>
                  <span className="mt-3 block text-[14px] font-semibold text-[#0080cc]">{lang === "ja" ? "詳細・応募 →" : "Details & apply →"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <WhyJoinUs lang={lang} />
      <OurBusinesses lang={lang} />

      <section className="py-16 tablet:py-20">
        <div className="container-site flex justify-center">
          <RecruitCtaButtons lang={lang} size="md" />
        </div>
      </section>
    </div>
  );
}

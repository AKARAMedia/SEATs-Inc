import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CompanyTitle from "@/components/sections/CompanyTitle";
import InfoIcon, { type InfoIconName } from "@/components/sections/InfoIcon";
import PhotoGallery from "@/components/sections/PhotoGallery";
import SmartLink from "@/components/SmartLink";
import { AWARDS, FACTS, IN_ACTION, OFFICES, OVERVIEW_TITLE, SERVICES } from "@/content/pages/overview";
import { isLang } from "@/lib/i18n";

export const metadata: Metadata = { title: "Overview" };

// Elementor info-box: icon, 50px to title, 45px to label
function InfoHead({ icon, title }: { icon: InfoIconName; title: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <InfoIcon name={icon} className="size-[30px] text-primary" />
      <h2 className="mt-[20px] text-[24px] font-bold capitalize leading-[33.6px] text-[#4d4d4d]">{title}</h2>
    </div>
  );
}

export default async function Page({ params }: PageProps<"/[lang]/overview">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <div className="pb-[80px] text-[#4d4d4d]">
      <CompanyTitle className="pt-[85px] desktop:pt-[150px]">{OVERVIEW_TITLE[lang]}</CompanyTitle>

      <div className="mx-auto w-full max-w-[1192px] px-[15px] desktop:px-0">
        {/* Text column: 1032px on desktop (offset like the live Elementor section), 280px on mobile */}
        <div className="px-[40px] desktop:pl-[70px] desktop:pr-[90px]">
          <div className="mt-[69px] grid grid-cols-1 gap-y-[63.4px] tablet:grid-cols-3 desktop:mt-[165px] desktop:grid-cols-[repeat(3,351px)] desktop:justify-center">
            {FACTS.map((f) => (
              <div key={f.label.en} className="flex flex-col items-center text-center">
                <InfoHead icon={f.icon} title={f.value[lang]} />
                <p className="mt-[11px] text-[16px] leading-[25.6px]">{f.label[lang]}</p>
              </div>
            ))}
          </div>

          <section className="mt-[63.4px]">
            <InfoHead icon="building" title={OFFICES.title[lang]} />
            <div className="mt-[11px] text-[16px] leading-[25.6px]">
              {OFFICES.items.map((o, i) => (
                <div key={o.label.en} className={i ? "mt-[15px]" : ""}>
                  <p className="font-semibold">{o.label[lang]}</p>
                  <p className="mt-[14.4px]">{o.address[lang]}</p>
                </div>
              ))}
            </div>
            <iframe
              src={OFFICES.map}
              title="S.E.A.T.S Inc. map"
              loading="lazy"
              className="mt-[44px] block h-[500px] w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>

          <section className="mt-[50px]">
            <InfoHead icon="services" title={SERVICES.title[lang]} />
            <div className="mt-[11px] text-[16px] leading-[25.6px]">
              {SERVICES.items.map((s, i) => (
                <div key={s.heading.en} className={i ? "mt-[15px]" : ""}>
                  <p className="font-semibold">
                    {s.heading[lang]}
                    <br />
                    <SmartLink
                      lang={lang}
                      href={s.link.href}
                      className={`text-heading hover:text-accent ${i < 2 ? "pl-[8px]" : "pl-[4px]"}`}
                    >
                      {s.link.label}
                    </SmartLink>
                  </p>
                  <p className="mt-[14px]">{s.text[lang]}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {[AWARDS, IN_ACTION].map((g, i) => (
          <section key={g.title.en} className={i ? "mt-[90px]" : "mt-[86px]"}>
            <div className="flex flex-col items-center text-center">
              <InfoIcon name={i ? "camera" : "award"} className="size-[30px] text-[#0080cc]" />
              <h2 className="mt-[20px] text-[24px] font-bold capitalize leading-[33.6px]">{g.title[lang]}</h2>
            </div>
            <div className="mt-[20px]">
              <PhotoGallery images={g.images} aspect={i ? "298 / 169" : "298 / 200"} label={g.title[lang]} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

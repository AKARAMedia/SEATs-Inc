import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import CompanyTitle from "@/components/sections/CompanyTitle";
import ValuesAccordion from "@/components/sections/ValuesAccordion";
import { getPage } from "@/lib/pages/store";
import { isLang } from "@/lib/i18n";

export const metadata: Metadata = { title: "Philosophy & Our Value" };

export default async function Page({ params }: PageProps<"/[lang]/philosophy-our-value">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  // Editable in admin → Pages
  const { DOMAINS, PHILOSOPHY_CLOSING, PHILOSOPHY_HEADING, PHILOSOPHY_TEXT, PHILOSOPHY_TITLE, VALUES, VALUES_INTRO, VALUES_TITLE } = await getPage("philosophy-our-value");

  return (
    <div className="pb-[100px] text-[16px] leading-[25.6px] text-text desktop:pb-[129px]">
      <CompanyTitle className="pt-[140px]">{VALUES_TITLE[lang]}</CompanyTitle>

      <div className="mx-auto w-full max-w-[1192px] px-[20px] desktop:px-0">
        <p className="mt-[30px] desktop:mt-[35px]">{VALUES_INTRO[lang]}</p>

        <div className="mt-[50px] grid gap-[20px] px-[10px] tablet:grid-cols-2 tablet:items-start">
          {VALUES.map((col, c) => (
            <ValuesAccordion key={c} items={col.map((v) => ({ title: v.title[lang], body: v.body[lang] }))} />
          ))}
        </div>
      </div>

      <CompanyTitle as="h2" className="mt-[70px]">
        {PHILOSOPHY_TITLE[lang]}
      </CompanyTitle>

      <div className="mx-auto w-full max-w-[1192px] px-[20px] desktop:px-0">
        <h3 className="mt-[25px] text-center text-[22px] font-bold capitalize leading-[22px] text-text desktop:text-left">
          {PHILOSOPHY_HEADING[lang]}
        </h3>
        <div className="mt-[22px]">
          {PHILOSOPHY_TEXT[lang].map((p, i) => (
            <p key={i} className="mb-[20px]">
              {p}
            </p>
          ))}
        </div>

        <div className="grid gap-[20px] tablet:grid-cols-3">
          {DOMAINS.map((d) => (
            <div key={d.img} className="flex flex-col items-center text-center">
              <div className="flex h-[72px] items-end desktop:h-[77px]">
                <Image
                  src={d.img}
                  alt=""
                  width={d.width}
                  height={d.height}
                  className="h-auto w-[108px] desktop:w-[115px]"
                />
              </div>
              <h5 className="mb-[20px] mt-[22px] text-[16px] font-bold capitalize leading-[22.4px] text-text">
                {d.title[lang]}
              </h5>
            </div>
          ))}
        </div>

        <p className="mt-[22px]">{PHILOSOPHY_CLOSING[lang]}</p>
      </div>
    </div>
  );
}

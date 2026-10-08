import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import ContactForm from "@/components/sections/ContactForm";
import { CONTACT } from "@/content/pages/contact";
import { isLang } from "@/lib/i18n";

export const metadata: Metadata = { title: "Contact" };

const ICONS = {
  calendar:
    "M19 4h-1V2h-2v2H8V2H6v2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm1 15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9h16v9zM4 8V7a1 1 0 0 1 1-1h1v2h2V6h8v2h2V6h1a1 1 0 0 1 1 1v1H4zm3 3h3v3H7v-3zm4 0h3v3h-3v-3zm4 0h3v3h-3v-3zM7 15h3v3H7v-3zm4 0h3v3h-3v-3zm4 0h3v3h-3v-3z",
  phone:
    "M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  mail: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z",
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z",
};

const linkCls = "text-[#222] underline decoration-1 underline-offset-2 hover:text-[#1687bd]";

function InfoRow({ icon, label, children }: { icon: keyof typeof ICONS; label: string; children: ReactNode }) {
  return (
    <div className="mb-6 flex items-start tablet:mb-[26px]">
      <div className="mr-[17px] flex size-[42px] min-w-[42px] items-center justify-center tablet:mr-[27px] tablet:size-[50px] tablet:min-w-[50px]">
        <svg viewBox="0 0 24 24" aria-hidden className="block size-[42px] fill-[#11a7df] tablet:size-[48px]">
          <path d={ICONS[icon]} />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-[3px] text-[18px] leading-[1.25] text-[#222] tablet:text-[20px]">{label}</div>
        {children}
      </div>
    </div>
  );
}

export default async function Page({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const c = CONTACT;
  const text = "block text-[15px] leading-[1.45] text-[#222] tablet:text-[17px]";

  return (
    <div className="container-site pb-20 pt-10">
      <div className="bg-white px-[15px] pb-[50px] font-[Arial,Helvetica,sans-serif] text-[#222] tablet:px-5 tablet:pb-[70px]">
        <h1 className="mb-[38px] text-center font-sans text-[21px] font-bold leading-[1.2] text-[#1687bd] after:mx-auto after:mt-[18px] after:block after:h-[2px] after:w-[78px] after:bg-[#1687bd] after:content-[''] tablet:mb-[55px] tablet:text-[22px]">
          {c.title[lang]}
        </h1>

        <div className="mx-auto mb-[35px] w-full max-w-[675px] tablet:mb-12">
          <InfoRow icon="calendar" label={c.businessDays.label[lang]}>
            <span className={text}>{c.businessDays.text[lang]}</span>
          </InfoRow>
          <InfoRow icon="phone" label={c.phone.label[lang]}>
            <span className={text}>
              <a href={c.phone.tel} className={linkCls}>
                {c.phone.number}{" "}
              </a>
              {c.phone.note[lang]}
            </span>
          </InfoRow>
          <InfoRow icon="mail" label={c.email.label[lang]}>
            <span className={text}>
              {c.email.inquiry[lang]}{" "}
              <a href={`mailto:${c.email.inquiryAddress}`} className={linkCls}>
                {c.email.inquiryAddress}{" "}
              </a>
              / {c.email.recruit[lang]}{" "}
              <a href={`mailto:${c.email.recruitAddress}`} className={linkCls}>
                {c.email.recruitAddress}
              </a>
            </span>
          </InfoRow>
          <InfoRow icon="pin" label={c.address.label[lang]}>
            <span className={text}>{c.address.lines.join(" ")}</span>
            <span className={`${text} mt-[3px]`}>
              <a href={c.address.mapUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
                {c.address.mapLabel}
              </a>
            </span>
          </InfoRow>
        </div>

        <ContactForm lang={lang} />
      </div>
    </div>
  );
}

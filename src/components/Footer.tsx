import Image from "next/image";
import { FOOTER } from "@/content/site";
import type { Settings } from "@/lib/settings-schema";
import type { Lang } from "@/lib/i18n";
import SmartLink from "./SmartLink";

const link = "text-white/90 hover:text-white";

export default function Footer({ lang, company }: { lang: Lang; company: Settings["company"] }) {
  const f = FOOTER;
  return (
    <footer className="bg-footer text-[16px] leading-[1.6] text-white/80">
      <div className="mx-auto max-w-[1192px] px-[15px] pt-[50px]">
        <div className="grid gap-y-6 tablet:grid-cols-2 desktop:grid-cols-[268px_169px_268px_1fr] desktop:gap-x-[30px]">
          <div>
            <h5 className="mb-5 text-[16px] font-bold leading-[1.4] text-white">{f.about.title[lang]}</h5>
            <p>
              <strong className="font-bold">S.E.A.T.S Inc.</strong> {f.about.text[lang]}
            </p>
          </div>

          <div>
            <h5 className="mb-5 text-[16px] font-bold leading-[1.4] text-white">{f.quickLinks.title[lang]}</h5>
            <ul className="list-disc space-y-2.5 pl-[17px] marker:text-white">
              {f.quickLinks.links.map((l) => (
                <li key={l.href}>
                  <SmartLink lang={lang} href={l.href} className={link}>
                    {l.label[lang]}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="mb-5 text-[16px] font-bold leading-[1.4] text-white">{f.business.title[lang]}</h5>
            <ul className="list-disc space-y-2.5 pl-[17px] marker:text-white">
              {f.business.links.map((l) => (
                <li key={l.label.en}>
                  {l.href ? (
                    <SmartLink lang={lang} href={l.href} className={link}>
                      {l.label[lang]}
                    </SmartLink>
                  ) : (
                    <span className="text-white/90">{l.label[lang]}</span>
                  )}
                </li>
              ))}
              <li className="list-none">{f.business.groupTitle[lang]}</li>
              {f.business.group.map((l) => (
                <li key={l.href} className="!mt-1">
                  <SmartLink lang={lang} href={l.href} className={link}>
                    {l.label[lang]}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="mb-5 text-[16px] font-bold leading-[1.4] text-white">{f.contact.title[lang]}</h5>
            <ul className="list-disc space-y-2.5 pl-[17px] marker:text-white">
              <li>
                <strong className="font-bold">{f.contact.phone[lang]} </strong>
                <a href={`tel:${company.phone.replace(/[^\d+]/g, "")}`} className={link}>
                  {company.phone}
                </a>
              </li>
              <li>
                <strong className="font-bold">{f.contact.address[lang]}</strong>
                {company.address[lang]}
              </li>
            </ul>
            <a href={f.jbac.href} target="_blank" rel="noopener noreferrer" className="mt-5 block">
              <Image src={f.jbac.img} alt="JBAC" width={800} height={314} className="h-auto w-full max-w-[367px]" />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-[30px] border-t border-white/20 py-[15px] text-center">{f.copyright}</div>
    </footer>
  );
}

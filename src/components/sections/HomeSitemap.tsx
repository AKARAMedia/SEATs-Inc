import SmartLink from "@/components/SmartLink";
import { SITEMAP } from "@/content/pages/home";
import type { Lang } from "@/lib/i18n";

/** Home "Company / Business / …" link block (live: custom HTML widget "SEATS FOOTER MENU"). */
export default function HomeSitemap({ lang }: { lang: Lang }) {
  return (
    <nav aria-label="Site map" className="seats-sitemap">
      <div className="seats-sitemap__grid">
        <div className="seats-sitemap__col">
          <h2 className="seats-sitemap__title">{SITEMAP.company.title}</h2>
          <ul className="seats-sitemap__list">
            {SITEMAP.company.links.map((l) => (
              <li key={l.href}>
                <SmartLink lang={lang} href={l.href}>
                  {l.label[lang]}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="seats-sitemap__col">
          <h2 className="seats-sitemap__title seats-sitemap__title--business">{SITEMAP.business.title}</h2>
          <ul className="seats-sitemap__list seats-sitemap__list--business">
            {SITEMAP.business.links.map((l) => (
              <li key={l.href}>
                <SmartLink lang={lang} href={l.href}>
                  {l.label[lang]}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="seats-sitemap__col seats-sitemap__col--right">
          <ul className="seats-sitemap__list">
            {SITEMAP.other.map((l) => (
              <li key={l.href}>
                <SmartLink lang={lang} href={l.href}>
                  {l.label[lang]}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

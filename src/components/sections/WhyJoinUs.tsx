import { WHY_JOIN_US } from "@/content/pages/option-career";
import type { Lang } from "@/lib/i18n";
import { pick } from "@/content/site";

const ICONS: Record<number, React.ReactNode> = {
  0: <path d="M4 6.5C4 5.67 4.67 5 5.5 5H12v16H5.5A1.5 1.5 0 0 1 4 19.5v-13ZM20 6.5c0-.83-.67-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" strokeWidth="1.5" />,
  1: (
    <>
      <circle cx="9" cy="8" r="3" strokeWidth="1.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.3" strokeWidth="1.5" />
      <path d="M15.5 14c2.8.2 5 2.6 5 5.5" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  2: <path d="M4 12l8-4.5 8 4.5-8 4.5L4 12Zm0 0v5m16-5v5M8 14.2V18c0 1.1 1.8 2 4 2s4-.9 4-2v-3.8" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />,
  3: <path d="M12 20s-7.5-4.6-9.8-9.1C.8 7.9 2.3 4.8 5.4 4.2c1.9-.4 3.8.5 4.9 2.1h1.4c1.1-1.6 3-2.5 4.9-2.1 3.1.6 4.6 3.7 3.2 6.7C19.5 15.4 12 20 12 20Z" strokeWidth="1.5" strokeLinejoin="round" />,
};

export default function WhyJoinUs({ lang }: { lang: Lang }) {
  return (
    <section className="bg-sky py-16 tablet:py-20">
      <div className="container-site text-center">
        <h2 className="text-[28px] font-bold text-heading desktop:text-[36px]">{pick(lang, WHY_JOIN_US.title)}</h2>
        <div className="mt-10 grid gap-6 tablet:grid-cols-2 desktop:grid-cols-4">
          {WHY_JOIN_US.items.map((item, i) => (
            <div key={item.title.en} className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-7">
                  {ICONS[i]}
                </svg>
              </span>
              <h3 className="mt-4 text-[16px] font-bold text-heading">{pick(lang, item.title)}</h3>
              <p className="mt-2 text-[14px] text-text">{pick(lang, item.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CompanyTitle from "@/components/sections/CompanyTitle";
import { getPage } from "@/lib/pages/store";
import { isLang } from "@/lib/i18n";

export const metadata: Metadata = { title: "History" };

export default async function Page({ params }: PageProps<"/[lang]/history">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  // Editable in admin → Pages
  const { HISTORY, HISTORY_TITLE } = await getPage("history");

  return (
    <div className="pb-[120px]">
      <CompanyTitle className="pt-[60px] desktop:pt-[80px]">{HISTORY_TITLE[lang]}</CompanyTitle>

      <div className="mx-[35px] mt-[14px] bg-[linear-gradient(#eeeeee_0%,#ffffff_100%)] px-[5px] pb-[30px] pt-[15px] tablet:mx-auto tablet:mt-[94px] tablet:max-w-[1192px] tablet:px-[20px] tablet:pt-[30px]">
        {HISTORY.map((y, i) => (
          <section key={y.year} className={i ? "mt-[10px]" : ""}>
            <h2 className="text-[22px] font-semibold capitalize leading-[35px] text-[#0080cc]">{y.year}</h2>
            <ul className="mt-[10px] text-[16px] capitalize leading-[25.6px] text-[#54595f]">
              {y.items.map((item, j) => (
                <li
                  key={j}
                  className="py-[8px] shadow-[0_1px_0_#ddd] first:pt-0 last:pb-0 last:shadow-none"
                >
                  {item[lang]}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

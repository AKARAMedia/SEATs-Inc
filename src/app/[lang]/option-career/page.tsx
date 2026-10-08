import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Montserrat } from "next/font/google";
import { CAREER } from "@/content/pages/option-career";
import { isLang } from "@/lib/i18n";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = { title: "Option Career" };

export default async function Page({ params }: PageProps<"/[lang]/option-career">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const c = CAREER;
  const [cambodian, japanese] = c.buttons;
  const btn = "inline-flex items-center justify-center bg-[#0080cc] text-[#f5f5f5] hover:bg-accent hover:text-white";

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

      <div className="container-site relative flex flex-col items-center pb-[60px] pt-[67px] desktop:block desktop:pb-[56px] desktop:pt-[239px]">
        <Image
          src={c.images.hero.src}
          alt="Join S.E.A.T.S Inc."
          width={c.images.hero.width}
          height={c.images.hero.height}
          priority
          sizes="(min-width: 1025px) 384px, 230px"
          className="h-auto w-[230px] desktop:absolute desktop:left-[767px] desktop:top-[180px] desktop:w-[384px]"
        />

        <div className="w-full text-center desktop:-ml-[10px] desktop:w-[667px]">
          <p
            className={`${montserrat.className} mt-[30px] text-[32px] font-bold leading-[1.4] text-[#0080cc] desktop:mt-0 desktop:text-left desktop:text-[90px] desktop:leading-[100px]`}
          >
            <span className="mr-[30px] desktop:mr-0 desktop:block">{c.heading.join}</span>
            <span className="mr-[30px] text-[#abcd05] desktop:mr-[45px]">{c.heading.our}</span>
            <span>{c.heading.team}</span>
          </p>
          <p className="mt-[25px] text-[16px] leading-[1.6] desktop:mt-[41px]">{c.text[lang]}</p>

          <div className="mt-[35px] flex flex-col items-center gap-[25px] desktop:mt-[85px] desktop:flex-row desktop:gap-[47px] desktop:pl-[109px]">
            <a
              href={cambodian.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} h-[26px] w-[236px] font-[family-name:var(--font-montserrat)] text-[16px] desktop:h-[29px] desktop:w-[188px] desktop:font-sans desktop:text-[13px]`}
            >
              {cambodian.label}
            </a>
            <a href={japanese.href} className={`${btn} ${montserrat.className} h-[26px] w-[236px] text-[16px] desktop:h-[32px] desktop:w-[216px]`}>
              {japanese.label}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import HomeNews from "@/components/news/HomeNews";
import FancyText from "@/components/sections/FancyText";
import HeroSlider from "@/components/sections/HeroSlider";
import HomeSitemap from "@/components/sections/HomeSitemap";
import SmartLink from "@/components/SmartLink";
import { BRAND_TITLE, BRANDS, FACEBOOK_EMBED, HERO, RECRUIT_BANNERS } from "@/content/pages/home";
import { isLang } from "@/lib/i18n";

export const metadata: Metadata = { title: { absolute: "Home - S.E.A.T.S Inc. (シーツインク)" } };

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <div className="pb-[80px] pt-[40px]">
      <HeroSlider slides={HERO.slides} mobileSlide={HERO.mobileSlide}>
        <div className="absolute inset-x-[26px] top-[281px] text-center text-white tablet:inset-x-0 tablet:top-[395px]">
          <h1 className="text-[50px] font-bold text-white capitalize leading-[70px] tablet:text-[80px] tablet:leading-[112px]">
            {HERO.title}
          </h1>
          <FancyText
            prefix={HERO.fancy.prefix}
            words={HERO.fancy.words}
            suffix={HERO.fancy.suffix}
            className="-mt-px min-h-[24px] text-[15px] font-semibold leading-[24px] tablet:-mt-[18px] tablet:min-h-[48px] tablet:text-[30px] tablet:leading-[48px]"
          />
          <p className="mt-[26px] text-[25px] font-bold text-white leading-[40px] tablet:-mt-[12px] tablet:text-[45px] tablet:leading-[72px]">
            {HERO.tagline[lang]}
          </p>
        </div>
      </HeroSlider>

      <HomeNews lang={lang} />

      {/* Recruit banners */}
      <div className="mt-[25px] flex flex-col items-center gap-px tablet:mt-[50px] tablet:gap-[26px]">
        {RECRUIT_BANNERS.map((b) => (
          <SmartLink key={b.src} lang={lang} href={b.href} className="block w-full tablet:w-auto">
            <Image
              src={b.src}
              alt=""
              width={b.width}
              height={b.height}
              sizes={`(min-width: 768px) ${b.width}px, 100vw`}
              className="h-auto w-full tablet:w-[var(--w)]"
              style={{ "--w": `${b.width}px` } as React.CSSProperties}
            />
          </SmartLink>
        ))}
      </div>

      <div className="mx-auto mt-[40px] w-full max-w-[1192px] px-[15px] desktop:px-0">
        <HomeSitemap lang={lang} />

        {/* Our Brand */}
        <section className="mt-[90px] bg-[#dff7ff] p-[50px]">
          <h2 className="text-center text-[28px] font-bold capitalize leading-[28px] text-primary">{BRAND_TITLE}</h2>
          <div className="mt-[50px] flex flex-col items-center gap-[20px] tablet:flex-row tablet:flex-nowrap tablet:justify-center tablet:gap-[10px] desktop:gap-[20px]">
            {BRANDS.map((b) => (
              <div
                key={b.src}
                className="flex h-[var(--mh)] w-[260px] items-center justify-center tablet:h-[105px] tablet:w-auto tablet:min-w-0 tablet:flex-1"
                style={{ "--mh": `${b.mh}px` } as React.CSSProperties}
              >
                <Image
                  src={b.src}
                  alt={b.alt}
                  width={b.width}
                  height={b.height}
                  sizes="300px"
                  className="h-[var(--h)] w-[var(--w)] max-w-none shrink-0 tablet:h-auto tablet:w-[var(--dw)] tablet:max-w-full"
                  style={
                    {
                      "--w": `${b.m[0]}px`,
                      "--h": `${b.m[1]}px`,
                      "--dw": `${b.d[0]}px`,
                      "--dh": `${b.d[1]}px`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-[10px] flex justify-center">
          {/* Only the visible variant loads: lazy iframes inside display:none are never fetched */}
          {(["desktop", "mobile"] as const).map((v) => (
            <iframe
              key={v}
              src={FACEBOOK_EMBED[v].src}
              title="S.E.A.T.S Inc. Facebook"
              loading="lazy"
              style={{ maxWidth: FACEBOOK_EMBED[v].width, height: FACEBOOK_EMBED[v].height }}
              className={`w-full border-0 ${v === "desktop" ? "hidden tablet:block" : "tablet:hidden"}`}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

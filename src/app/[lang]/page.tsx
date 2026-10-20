import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import { notFound } from "next/navigation";
import HomeNews from "@/components/news/HomeNews";
import FancyText from "@/components/sections/FancyText";
import HeroSlider from "@/components/sections/HeroSlider";
import HomeSitemap from "@/components/sections/HomeSitemap";
import SmartLink from "@/components/SmartLink";
import { BRAND_TITLE, FACEBOOK_PAGE_URL, SOCIABLEKIT_FACEBOOK_FEED_EMBED_ID } from "@/content/pages/home";
import { isLang } from "@/lib/i18n";
import { getBrands, getHomeBanners, getHomeSlides } from "@/lib/home";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: { absolute: "Home - S.E.A.T.S Inc. (シーツインク)" } };

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const [{ home }, slides, banners, brands] = await Promise.all([getSettings(), getHomeSlides(), getHomeBanners(), getBrands()]);
  // Managed in admin → Home page / Brands
  const slideUrls = slides.length ? slides.map((s) => s.imageUrl) : [home.mobileImage];

  return (
    <div className="pb-[80px] pt-[40px]">
      <HeroSlider slides={slideUrls} mobileSlide={home.mobileImage}>
        <div className="absolute inset-x-[26px] top-[281px] text-center text-white tablet:inset-x-0 tablet:top-[395px]">
          <h1 className="text-[50px] font-bold text-white capitalize leading-[70px] tablet:text-[80px] tablet:leading-[112px]">
            {home.heroTitle}
          </h1>
          <FancyText
            prefix={home.typingPrefix}
            words={home.typingWords}
            suffix={home.typingSuffix}
            className="-mt-px min-h-[24px] text-[15px] font-semibold leading-[24px] tablet:-mt-[18px] tablet:min-h-[48px] tablet:text-[30px] tablet:leading-[48px]"
          />
          <p className="mt-[26px] text-[25px] font-bold text-white leading-[40px] tablet:-mt-[12px] tablet:text-[45px] tablet:leading-[72px]">
            {home.tagline[lang]}
          </p>
        </div>
      </HeroSlider>

      <HomeNews lang={lang} pinnedIds={home.pinnedPostIds} />

      {/* Recruit banners */}
      <div className="mt-[25px] flex flex-col items-center gap-px tablet:mt-[50px] tablet:gap-[26px]">
        {banners.map((b) => {
          const img = (
            <Image
              src={b.imageUrl}
              alt={b.alt}
              width={b.width}
              height={b.height}
              sizes={`(min-width: 768px) ${b.width}px, 100vw`}
              className="h-auto w-full tablet:w-[var(--w)]"
              style={{ "--w": `${b.width}px` } as React.CSSProperties}
            />
          );
          return b.href ? (
            <SmartLink key={b.id} lang={lang} href={b.href} className="block w-full tablet:w-auto">
              {img}
            </SmartLink>
          ) : (
            <div key={b.id} className="w-full tablet:w-auto">
              {img}
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-[40px] w-full max-w-[1192px] px-[15px] desktop:px-0">
        <HomeSitemap lang={lang} />

        {/* Our Brand */}
        <section className="mt-[90px] bg-[#dff7ff] p-[50px]">
          <h2 className="text-center text-[28px] font-bold capitalize leading-[28px] text-primary">{BRAND_TITLE}</h2>
          <div className="mt-[50px] flex flex-col items-center gap-[20px] tablet:flex-row tablet:flex-nowrap tablet:justify-center tablet:gap-[10px] desktop:gap-[20px]">
            {brands.map((b) => {
              const ratio = b.logoWidth / b.logoHeight;
              const logo = (
                <Image
                  src={b.logoUrl}
                  alt={b.name}
                  width={b.logoWidth}
                  height={b.logoHeight}
                  sizes="300px"
                  className="h-[var(--h)] w-[var(--w)] max-w-none shrink-0 tablet:h-auto tablet:w-[var(--dw)] tablet:max-w-full"
                  style={
                    {
                      "--w": `${Math.round(b.mobileHeight * ratio)}px`,
                      "--h": `${b.mobileHeight}px`,
                      "--dw": `${Math.round(b.desktopHeight * ratio)}px`,
                    } as React.CSSProperties
                  }
                />
              );
              const box = "flex h-[var(--mh)] w-[260px] items-center justify-center tablet:h-[105px] tablet:w-auto tablet:min-w-0 tablet:flex-1";
              const style = { "--mh": `${b.mobileRow}px` } as React.CSSProperties;
              return b.href ? (
                <SmartLink key={b.id} lang={lang} href={b.href} className={box} style={style} aria-label={b.name}>
                  {logo}
                </SmartLink>
              ) : (
                <div key={b.id} className={box} style={style}>
                  {logo}
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-[10px] flex flex-col items-center">
          <h3 className="mb-4 text-[20px] font-bold text-heading">S.E.A.T.S Inc. Facebook</h3>
          <div className="h-[620px] w-full max-w-[500px] overflow-y-auto rounded-[5px] shadow-[0_0_3px_rgba(0,0,0,0.15)]">
            <div className="sk-ww-facebook-page-posts" data-embed-id={SOCIABLEKIT_FACEBOOK_FEED_EMBED_ID} />
            <Script src="https://widgets.sociablekit.com/facebook-page-posts/widget.js" strategy="lazyOnload" />
          </div>
          <p className="mt-3">
            <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold text-primary hover:underline">
              {lang === "ja" ? "Facebookページを開く →" : "Open Facebook Page →"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

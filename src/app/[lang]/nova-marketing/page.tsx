import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import SmartLink from "@/components/SmartLink";
import { BlueHeading, DivisionPage, ImageCard, mont, ShadowBox } from "@/components/sections/division/primitives";
import { NOVA } from "@/content/pages/nova-marketing";
import { isLang } from "@/lib/i18n";

export const metadata: Metadata = { title: "NOVA Marketing" };

export default async function Page({ params }: PageProps<"/[lang]/nova-marketing">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const n = NOVA;

  return (
    <DivisionPage className="pb-[120px]">
      {/* Hero */}
      <section className="relative flex min-h-[500px] items-center overflow-hidden">
        <Image src={n.hero.bg} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="relative mx-auto w-full max-w-[1212px] px-[15px] desktop:px-0">
          <h1 className={`${mont} font-bold text-[#0080cc]`}>
            <span className="block text-[120px] leading-[120px] max-[767px]:text-[88px] max-[767px]:leading-[100px]">{n.hero.line1}</span>
            <span className="block text-[58px] leading-[58px] max-[767px]:text-[44px]">{n.hero.line2}</span>
          </h1>
          <span aria-hidden className="mt-[10px] mb-[10px] block h-[5px] w-[40%] bg-[#0080cc] max-[767px]:w-[70%]" />
        </div>
      </section>

      <div className="container-site mt-[60px] space-y-5">
        {/* Business Overview */}
        <ShadowBox className="grid desktop:grid-cols-2">
          <div className="p-[10px]">
            <BlueHeading className="mb-5 text-[30px] leading-[30px]">{n.overview.heading[lang]}</BlueHeading>
            <p className="text-justify text-[16px] leading-[1.6]">
              {n.overview.intro[lang]}
              {n.overview.bullets[lang].map((b) => (
                <span key={b}>
                  <br />
                  {b}
                </span>
              ))}
              <br />
              {n.overview.outro[lang]}
            </p>
          </div>
          <div className="p-10">
            <Image
              src={n.overview.image}
              alt=""
              width={1380}
              height={920}
              sizes="(min-width: 1025px) 516px, 100vw"
              className="h-auto w-full rounded-[10px] transition-transform duration-300 hover:scale-[1.1]"
            />
          </div>
        </ShadowBox>

        {/* Our Strength */}
        <ShadowBox className="p-[10px] pb-[30px]">
          <BlueHeading className="mb-5 pb-5 text-[30px] leading-[30px]">{n.strength.heading[lang]}</BlueHeading>
          <div className="mx-[5px] grid gap-[10px] tablet:grid-cols-3">
            {n.strength.cards.map((c, i) => (
              <ImageCard key={c.src} src={c.src} caption={c.caption[lang]}>
                <p className={i === 0 ? "text-justify" : ""}>{c.text[lang]}</p>
              </ImageCard>
            ))}
          </div>
        </ShadowBox>

        {/* Our Services */}
        <ShadowBox className="p-[10px] pb-[30px]">
          <BlueHeading className="mb-5 pb-5 text-[30px] leading-[30px]">{n.services.heading[lang]}</BlueHeading>
          <p className="mb-[29px] text-center text-[16px] leading-[1.6]">{n.services.intro[lang]}</p>
          <div className="mx-[5px] grid gap-[10px] tablet:grid-cols-2 desktop:grid-cols-4">
            {n.services.cards.map((c) => (
              <ImageCard key={c.src} src={c.src} caption={c.caption[lang]} sizes="(min-width: 1025px) 263px, 100vw">
                <p>{c.text[lang]}</p>
              </ImageCard>
            ))}
          </div>
        </ShadowBox>

        {/* Get in touch band */}
        <section className="bg-[#0080cc] p-5 max-[767px]:pb-10">
          <h2 className={`${mont} text-[40px] font-bold leading-[40px] text-white`}>
            <SmartLink lang={lang} href="/contact/" className="text-white hover:text-white">
              {n.getInTouch[lang]}
            </SmartLink>
          </h2>
        </section>

        {/* Best Solution Provider */}
        <ShadowBox className="grid py-[10px] desktop:grid-cols-[536px_1fr] desktop:items-center">
          <div className="p-[10px]">
            <BlueHeading className="mb-5 text-[30px] leading-[30px]">{n.solution.heading[lang]}</BlueHeading>
            <p className="text-[16px] leading-[1.6]">
              {n.solution.text[lang][0]}
              <br />
              {n.solution.text[lang][1]}
            </p>
          </div>
          <div className="grid tablet:grid-cols-3">
            {n.solution.images.map((src) => (
              <div key={src} className="bg-white p-[10px] shadow-[0_0_10px_-7px_rgba(0,0,0,0.5)]">
                <Image
                  src={src}
                  alt=""
                  width={800}
                  height={800}
                  sizes="(min-width: 1025px) 199px, 100vw"
                  className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-[1.1]"
                />
              </div>
            ))}
          </div>
        </ShadowBox>

        {/* Our Vision and Goals */}
        <ShadowBox className="p-[10px] pb-[30px]">
          <BlueHeading className="mb-5 pb-5 text-[30px] leading-[30px]">{n.vision.heading[lang]}</BlueHeading>
          <p className="mb-[30px] text-center text-[16px] leading-[1.6]">{n.vision.intro[lang]}</p>
          <div className="mx-[5px] grid gap-[10px] tablet:grid-cols-2 desktop:grid-cols-4">
            {n.vision.cards.map((c) => (
              <ImageCard key={c.src} src={c.src} caption={c.caption[lang]} sizes="(min-width: 1025px) 263px, 100vw">
                <p>{c.text[lang]}</p>
              </ImageCard>
            ))}
          </div>
          <div className="p-[52px] text-center text-[16px] leading-[1.6] max-[767px]:px-2.5">
            <p className="mb-5">{n.vision.outro[lang][0]}</p>
            <p>{n.vision.outro[lang][1]}</p>
          </div>
        </ShadowBox>

        <a href={n.banner.href} target="_blank" rel="noopener noreferrer" className="mx-auto block max-w-[930px]">
          <Image
            src={n.banner.src}
            alt={n.banner.alt}
            width={n.banner.width}
            height={n.banner.height}
            sizes="(min-width: 960px) 930px, 100vw"
            className="h-auto w-full rounded-[5px]"
          />
        </a>
      </div>
    </DivisionPage>
  );
}

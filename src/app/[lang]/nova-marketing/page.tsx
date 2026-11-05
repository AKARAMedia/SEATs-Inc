import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import CardCarousel from "@/components/CardCarousel";
import RevealOnView from "@/components/RevealOnView";
import SmartLink from "@/components/SmartLink";
import { BlueHeading, DivisionPage, mont, ShadowBox } from "@/components/sections/division/primitives";
import { getPage } from "@/lib/pages/store";
import { isLang } from "@/lib/i18n";

export const metadata: Metadata = { title: "NOVA Marketing" };

// 24×24 stroke icons for the hero feature strip (digital marketing, media, web, management)
const FEATURE_ICONS = [
  "M3 20h18M6 16V10M11 16V6M16 16v-4M21 16V8",
  "M4 7h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM16 11l5-3v8l-5-3",
  "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z",
  "M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1zM8 6H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2M9 13l2 2 4-4",
];

function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

const ARROW = "M5 12h14M13 6l6 6-6 6";

// Icons for the three Business Overview services (food e-commerce, baby products, media production)
const SERVICE_ICONS = [
  "M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6.2M9 20.2v.01M17 20.2v.01",
  "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  FEATURE_ICONS[1],
];

/** Start delay (seconds) for a hero entrance animation — read by .hero-* in globals.css */
const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export default async function Page({ params }: PageProps<"/[lang]/nova-marketing">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  // Editable in admin → Pages
  const { NOVA } = await getPage("nova-marketing");
  const n = NOVA;

  return (
    <DivisionPage className="pb-[120px]">
      {/* Turns the site header into a transparent glass bar over this hero (see globals.css) */}
      <span data-hero-nav hidden />
      {/* Without JS the scroll-in animation never fires, so keep its content visible */}
      <noscript>
        <style>{".nova-reveal .rv{opacity:1!important}"}</style>
      </noscript>
      {/* Hero */}
      <section className="relative flex min-h-svh flex-col overflow-hidden text-white">
        <Image src={n.hero.bg} alt="" fill priority sizes="100vw" className="hero-zoom object-cover object-[75%_center]" />
        {/* Blue wash for legibility: strong on the left behind the copy, fading to the photo on the right */}
        <div aria-hidden className="hero-fade absolute inset-0 bg-[linear-gradient(100deg,rgba(4,34,66,0.92)_0%,rgba(6,58,104,0.7)_38%,rgba(10,90,150,0.12)_75%,rgba(10,90,150,0.04)_100%)] max-[767px]:bg-[rgba(4,34,66,0.78)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[240px] bg-gradient-to-t from-[#031a33]/90 to-transparent" />

        {/* Copy — each piece fades up in turn (see .hero-* in globals.css) */}
        <div className="relative mx-auto flex w-full max-w-[1212px] flex-1 flex-col justify-center px-[15px] pt-[110px] pb-[40px] desktop:px-0">
          <span style={delay(0.25)} className="hero-up inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-[13px] leading-none backdrop-blur-md">
            <span aria-hidden className="text-[16px] leading-none">+</span>
            {n.hero.badge[lang]}
          </span>
          <h1 className={`${mont} mt-6 font-semibold tracking-[-0.01em]`}>
            <span style={delay(0.4)} className="hero-up block text-[84px] leading-[1.02] !text-white max-[767px]:text-[52px]">{n.hero.line1}</span>
            <span style={delay(0.55)} className="hero-up block bg-gradient-to-r from-[#7fd0ff] via-[#a9dcff] to-[#e4f6d0] bg-clip-text text-[84px] leading-[1.1] text-transparent max-[767px]:text-[48px]">
              {n.hero.line2}
            </span>
          </h1>
          <p style={delay(0.75)} className="hero-up mt-6 max-w-[500px] text-[16px] leading-[1.7] text-white/85">{n.hero.description[lang]}</p>
          <div style={delay(0.9)} className="hero-up mt-9 flex flex-wrap items-center gap-5">
            <SmartLink
              lang={lang}
              href="/contact/"
              className={`${mont} inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[15px] font-semibold !text-[#06365f] transition-colors hover:bg-[#d9f0ff] hover:!text-[#06365f]`}
            >
              {n.hero.primaryCta[lang]}
              <Icon d={ARROW} className="h-4 w-4" />
            </SmartLink>
            <a
              href="#services"
              className={`${mont} group inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/15 py-2 pr-7 pl-2 text-[15px] font-semibold !text-white backdrop-blur-md transition-colors hover:bg-white/25 hover:!text-white`}
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0.5">
                <Icon d="M6 9l6 6 6-6" className="h-5 w-5" />
              </span>
              {n.hero.secondaryCta[lang]}
            </a>
          </div>
        </div>

        {/* Feature strip */}
        <ul className="relative mx-auto grid w-full max-w-[1212px] grid-cols-2 gap-x-4 gap-y-5 px-[15px] pb-8 desktop:grid-cols-4 desktop:px-0">
          {n.hero.features.map((f, i) => (
            <li key={f.label.en} style={delay(1.15 + i * 0.12)} className="hero-up flex items-center gap-3 desktop:border-l desktop:border-white/15 desktop:pl-5 desktop:first:border-l-0 desktop:first:pl-0">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur-md">
                <Icon d={FEATURE_ICONS[i % FEATURE_ICONS.length]} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-tight">{f.label[lang]}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-white/70">{f.text[lang]}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Business Overview: profile-style card — gradient panel with a round photo and layered wave edge, over a white card */}
      <section className="bg-white px-6 py-[70px] tablet:px-10 max-[767px]:py-[50px]">
        <RevealOnView className="mx-auto flex max-w-[1180px] flex-col desktop:flex-row desktop:items-center">
          {/* Panel: one shaped SVG — gradient body with a wavy right edge, plus translucent wave layers peeking out behind it */}
          <div style={delay(0)} className="rv rv-left relative z-10 flex min-h-[260px] shrink-0 items-center justify-center rounded-[40px] bg-white shadow-[0_20px_50px_-15px_rgba(0,60,120,0.3)] max-[1024px]:mx-6 desktop:min-h-[470px] desktop:w-[400px] desktop:rounded-none desktop:bg-transparent desktop:pr-[76px] desktop:shadow-none">
            <svg
              aria-hidden
              viewBox="0 0 400 470"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full drop-shadow-[0_20px_20px_rgba(2,36,84,0.22)] max-[1024px]:hidden"
            >
              <defs>
                <linearGradient id="novaPanelGrad" x1="0" y1="0" x2="0.75" y2="1">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.55" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#ffffff" />
                </linearGradient>
                <clipPath id="novaPanelClip">
                  <path d="M48 0H290Q326 0 324 38C322 96 298 128 306 198S330 330 320 410Q318 470 280 470H48Q0 470 0 422V48Q0 0 48 0Z" />
                </clipPath>
                <radialGradient id="novaPanelGlow" cx="162" cy="235" r="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#cfeaff" stopOpacity="0.6" />
                  <stop offset="1" stopColor="#cfeaff" stopOpacity="0" />
                </radialGradient>
                <pattern id="novaPanelDots" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.3" fill="#0080cc" fillOpacity="0.28" />
                </pattern>
              </defs>
              {/* Back layers: same body, but the right edge is shifted and out of phase so the waves fan out */}
              <path d="M48 0H300Q366 0 362 52C358 112 326 160 346 226S372 330 356 420Q350 470 296 470H48Q0 470 0 422V48Q0 0 48 0Z" className="rv rv-wave" style={delay(0.55)} fill="#c3e56a" fillOpacity="0.6" />
              <path d="M48 0H296Q350 0 348 46C346 90 364 150 330 214S316 340 344 418Q338 470 290 470H48Q0 470 0 422V48Q0 0 48 0Z" className="rv rv-wave" style={delay(0.7)} fill="#5fd3c4" fillOpacity="0.5" />
              <path d="M48 0H292Q336 0 334 40C332 100 310 150 338 206S322 322 340 410Q330 470 286 470H48Q0 470 0 422V48Q0 0 48 0Z" className="rv rv-wave" style={delay(0.85)} fill="#9fdcff" fillOpacity="0.8" />
              {/* Front body */}
              <path d="M48 0H290Q326 0 324 38C322 96 298 128 306 198S330 330 320 410Q318 470 280 470H48Q0 470 0 422V48Q0 0 48 0Z" fill="url(#novaPanelGrad)" stroke="#0080cc" strokeOpacity="0.14" strokeWidth="1" />
              {/* Subtle depth: glow behind the photo, faint rings and corner dot patterns (blue tints on the white body) */}
              <g clipPath="url(#novaPanelClip)">
                <rect width="400" height="470" fill="url(#novaPanelGlow)" />
                <circle className="rv rv-fade" style={delay(0.9)} cx="162" cy="235" r="150" fill="none" stroke="#0080cc" strokeOpacity="0.14" strokeWidth="1.5" />
                <circle className="rv rv-fade" style={delay(1.05)} cx="162" cy="235" r="192" fill="none" stroke="#0080cc" strokeOpacity="0.1" strokeWidth="1.5" />
                <circle className="rv rv-fade" style={delay(1.2)} cx="162" cy="235" r="236" fill="none" stroke="#0080cc" strokeOpacity="0.07" strokeWidth="1.5" />
                <rect x="22" y="22" width="96" height="64" fill="url(#novaPanelDots)" />
                <rect x="200" y="392" width="96" height="56" fill="url(#novaPanelDots)" />
              </g>
            </svg>
            {/* Round photo: thin crisp white ring + soft shadow */}
            <div style={delay(0.45)} className="rv rv-pop relative rounded-full shadow-[0_22px_34px_-10px_rgba(0,0,0,0.5)] ring-[5px] ring-white">
              <div className="relative size-[220px] overflow-hidden rounded-full desktop:size-[250px]">
                <Image src={n.overview.image} alt="" fill sizes="250px" className="object-cover object-[38%_center]" />
              </div>
            </div>
          </div>

          {/* White card, tucked under the panel */}
          <div style={delay(0.2)} className="rv rv-left relative -mt-8 rounded-[28px] bg-white px-7 pt-14 pb-9 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.28),0_0_0_1px_rgba(0,0,0,0.04)] desktop:-ml-[100px] desktop:mt-0 desktop:flex-1 desktop:rounded-l-[10px] desktop:rounded-r-[64px] desktop:py-[44px] desktop:pr-[56px] desktop:pl-[96px]">
            <div className="grid gap-9 desktop:grid-cols-[1fr_270px] desktop:gap-12">
              <div>
                <h2 style={delay(0.8)} className={`rv rv-up font-roboto text-[26px] font-medium uppercase leading-[1.2] tracking-[0.04em] text-[#3a4150]`}>{n.overview.heading[lang]}</h2>
                <p style={delay(0.9)} className="rv rv-up mt-1 text-[13px] text-[#8a919c]">{n.overview.label[lang]}</p>
                <p style={delay(1.0)} className="rv rv-up mt-5 text-[15px] leading-[1.7]">{n.overview.intro[lang]}</p>
                <p style={delay(1.1)} className="rv rv-up mt-3 text-[15px] leading-[1.7]">{n.overview.outro[lang]}</p>
              </div>
              <ul className="space-y-5 desktop:border-l desktop:border-black/10 desktop:pl-8">
                {n.overview.bullets[lang].map((b, i) => (
                  <li key={b} style={delay(1.0 + i * 0.18)} className="rv rv-slide flex items-start gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e8f5fd] text-[#0080cc]">
                      <Icon d={SERVICE_ICONS[i % SERVICE_ICONS.length]} className="h-5 w-5" />
                    </span>
                    <span className="pt-0.5 text-[14px] leading-[1.5]">{b.replace(/^・\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </RevealOnView>
      </section>

      <div className="container-site mt-[40px] space-y-20 px-6 tablet:px-10">

        {/* Our Strength */}
        <ShadowBox className="px-6 pt-8 pb-12 tablet:px-10">
          <BlueHeading className="mb-5 pb-5 text-[30px] leading-[30px]">{n.strength.heading[lang]}</BlueHeading>
          {/* Ribbon cards: blue title tab with a folded corner, round photo overlapping its end, grey body with a blue rule */}
          <RevealOnView className="mx-[5px] grid gap-x-[26px] gap-y-14 pt-6 pb-2 tablet:grid-cols-3">
            {n.strength.cards.map((c, i) => (
              <article key={c.src} style={delay(i * 0.18)} className="rv rv-up relative flex flex-col">
                {/* Folded corner under the ribbon's left end */}
                <span aria-hidden className="absolute top-[40px] left-0 z-0 h-[84px] w-[40px] rounded-bl-[28px] bg-[#064a85]" />
                {/* Ribbon title tab */}
                <div className={`${mont} relative z-10 flex h-[104px] w-[calc(100%-92px)] flex-col justify-center rounded-[28px] bg-[#0a67b5] py-3 pr-12 pl-8 text-white shadow-[0_8px_18px_-8px_rgba(6,74,133,0.7)]`}>
                  <h3 className="text-[16px] font-bold leading-[1.25] !text-white">{c.caption[lang]}</h3>
                  <span className="mt-0.5 text-[13px] font-normal text-white/75">{`0${i + 1}`} · {n.strength.heading[lang]}</span>
                </div>
                {/* Round photo overlapping the ribbon's end */}
                <div style={delay(0.25 + i * 0.18)} className="rv rv-pop absolute top-[-22px] right-0 z-20 size-[132px] overflow-hidden rounded-full bg-white shadow-[0_12px_24px_-8px_rgba(0,0,0,0.35)] ring-[4px] ring-white">
                  <Image src={c.src} alt={c.caption[lang]} fill sizes="132px" className="object-cover" />
                </div>
                {/* Grey body with a blue rule beside the copy */}
                <div className="relative z-[1] -mt-[28px] ml-[22px] flex-1 rounded-[28px] bg-[#f2f3f5] px-7 pt-[84px] pb-8 shadow-[0_14px_26px_-14px_rgba(0,0,0,0.35)]">
                  <div className="border-l-2 border-[#0a67b5] pl-5 text-[14.5px] leading-[1.7]">{c.text[lang]}</div>
                </div>
              </article>
            ))}
          </RevealOnView>
        </ShadowBox>

        {/* Our Services: review-style card carousel — avatar + title + icon, copy, counter, round prev/next buttons */}
        <section id="services" className="scroll-mt-[100px]">
          <RevealOnView>
            <h2 className={`${mont} rv rv-up text-center text-[30px] font-bold capitalize leading-[1.2] text-[#3a4150]`}>{n.services.heading[lang]}</h2>
            <p style={delay(0.1)} className="rv rv-up mx-auto mt-3 mb-8 max-w-[640px] text-center text-[16px] leading-[1.6]">
              {n.services.intro[lang]}
            </p>
            <CardCarousel prevLabel={lang === "ja" ? "前へ" : "Previous"} nextLabel={lang === "ja" ? "次へ" : "Next"}>
              {n.services.cards.map((c, i) => (
                <article
                  key={c.src}
                  style={delay(0.2 + i * 0.12)}
                  className="rv rv-up flex shrink-0 basis-full snap-start flex-col rounded-[14px] border border-[#d9dce1] bg-[#f4f5f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] tablet:basis-[calc((100%-20px)/2)] desktop:basis-[calc((100%-40px)/3)]"
                >
                  <header className="flex min-h-[64px] items-start gap-3">
                    <span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#29abe2,#0080cc)] text-white shadow-[0_8px_16px_-6px_rgba(0,128,204,0.65)] ring-2 ring-white">
                      <Icon d={FEATURE_ICONS[i % FEATURE_ICONS.length]} className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1 pt-0.5">
                      <h3 className={`${mont} text-[15px] font-semibold leading-[1.3] text-[#2b303b]`}>{c.caption[lang]}</h3>
                      <span className="mt-1 block text-[11px] text-[#8a919c]">{`0${i + 1}`} · {n.services.heading[lang]}</span>
                    </span>
                  </header>
                  <p className="mt-4 flex-1 text-[14px] leading-[1.65]">{c.text[lang]}</p>
                  <p className="mt-5 text-center text-[11px] tracking-[0.2em] text-[#9aa1ac]">
                    {`0${i + 1}`} / {String(n.services.cards.length).padStart(2, "0")}
                  </p>
                </article>
              ))}
            </CardCarousel>
          </RevealOnView>
        </section>

        {/* Best Solution Provider: modern split card — copy + CTA on the left, rounded photo collage on the right */}
        <RevealOnView className="relative overflow-hidden rounded-[28px] border border-[#e1edf7] bg-[linear-gradient(135deg,#eef8ff_0%,#ffffff_55%)] shadow-[0_28px_60px_-32px_rgba(0,80,150,0.4)]">
          {/* Soft colour glows for depth */}
          <span aria-hidden className="pointer-events-none absolute -top-28 -right-24 size-[340px] rounded-full bg-[#29abe2]/20 blur-3xl" />
          <span aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 size-[300px] rounded-full bg-[#aacd06]/15 blur-3xl" />
          <div className="relative grid items-center gap-12 p-8 tablet:p-12 desktop:grid-cols-[1fr_470px]">
            <div>
              <h2 style={delay(0.05)} className={`${mont} rv rv-up text-[34px] font-bold leading-[1.15] text-[#0b2540] max-[767px]:text-[28px]`}>
                {n.solution.heading[lang]}
              </h2>
              <span aria-hidden style={delay(0.15)} className="rv rv-up mt-4 block h-1 w-14 rounded-full bg-[linear-gradient(90deg,#29abe2,#aacd06)]" />
              <p style={delay(0.25)} className="rv rv-up mt-6 text-[16px] leading-[1.75]">{n.solution.text[lang][0]}</p>
              <p style={delay(0.35)} className="rv rv-up mt-4 text-[16px] leading-[1.75]">{n.solution.text[lang][1]}</p>
              <div style={delay(0.5)} className="rv rv-up mt-8">
                <SmartLink
                  lang={lang}
                  href="/contact/"
                  className={`${mont} group inline-flex items-center gap-3 rounded-full bg-[linear-gradient(90deg,#29abe2,#0080cc)] px-8 py-4 text-[14px] font-bold uppercase tracking-[0.04em] !text-white shadow-[0_14px_28px_-10px_rgba(0,128,204,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-10px_rgba(0,128,204,0.85)] hover:!text-white`}
                >
                  {n.getInTouch[lang]}
                  <span className="grid size-7 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">
                    <Icon d={ARROW} className="h-4 w-4" />
                  </span>
                </SmartLink>
              </div>
            </div>

            {/* Photo collage: one tall photo + two stacked, rounded with white borders */}
            <div className="relative">
              <div className="grid grid-cols-2 grid-rows-2 gap-3 desktop:h-[400px] max-[1024px]:h-[340px]">
                {n.solution.images.map((src, i) => (
                  <div
                    key={src}
                    style={delay(0.2 + i * 0.15)}
                    className={`rv rv-pop relative overflow-hidden rounded-[22px] border-4 border-white shadow-[0_18px_34px_-16px_rgba(0,40,90,0.5)] ${i === 0 ? "row-span-2" : ""}`}
                  >
                    <Image src={src} alt="" fill sizes="(min-width: 1025px) 230px, 45vw" className="object-cover transition-transform duration-500 hover:scale-[1.06]" />
                  </div>
                ))}
              </div>
              {/* Floating glass chip */}
              <div style={delay(0.8)} className="rv rv-up absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_16px_30px_-14px_rgba(0,40,90,0.5)] backdrop-blur-md max-[767px]:left-3">
                <span className="grid size-10 place-items-center rounded-full bg-[linear-gradient(135deg,#29abe2,#0080cc)] text-white">
                  <Icon d={FEATURE_ICONS[0]} className="size-5" />
                </span>
                <span className={`${mont} text-[14px] font-semibold leading-snug text-[#0b2540]`}>{n.hero.card.text[lang]}</span>
              </div>
            </div>
          </div>
        </RevealOnView>

        {/* Our Vision and Goals: no outer box, 2x2 cards (photo beside text), closing line under a divider */}
        <RevealOnView>
          <div className="relative">
            <div className="relative mx-auto max-w-[720px] text-center">
              <h2 style={delay(0)} className={`${mont} rv rv-up text-[34px] font-bold leading-[1.15] !text-[#0b2540] max-[767px]:text-[28px]`}>{n.vision.heading[lang]}</h2>
              <p style={delay(0.12)} className="rv rv-up mx-auto mt-5 text-[16px] leading-[1.7] text-[#4a5563]">{n.vision.intro[lang]}</p>
            </div>

            <div className="relative mt-12 grid gap-5 tablet:grid-cols-2">
              {n.vision.cards.map((c, i) => (
                <article
                  key={c.src}
                  style={delay(0.25 + i * 0.12)}
                  className="rv rv-up group flex flex-col gap-5 rounded-[24px] border border-[#e3edf6] bg-white p-4 shadow-[0_18px_40px_-26px_rgba(0,60,120,0.4)] transition-all duration-300 hover:border-[#29abe2]/60 hover:shadow-[0_24px_48px_-24px_rgba(0,110,190,0.5)] min-[480px]:flex-row min-[480px]:items-stretch"
                >
                  <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-[16px] min-[480px]:aspect-auto min-[480px]:min-h-[170px] min-[480px]:w-[38%]">
                    <Image src={c.src} alt="" fill sizes="(min-width: 1025px) 190px, (min-width: 480px) 30vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.08]" />
                  </div>
                  <div className="flex flex-col justify-center py-1 pr-2">
                    <span aria-hidden className="mb-3 block h-[3px] w-8 rounded-full bg-[linear-gradient(90deg,#29abe2,#aacd06)] transition-all duration-300 group-hover:w-14" />
                    <h3 className={`${mont} text-[18px] font-bold leading-[1.25] !text-[#0b2540]`}>{c.caption[lang]}</h3>
                    <p className="mt-2.5 text-[14px] leading-[1.7] text-[#4a5563]">{c.text[lang]}</p>
                  </div>
                </article>
              ))}
            </div>

            <div style={delay(0.8)} className="rv rv-up relative mx-auto mt-12 max-w-[820px] border-t border-[#e3edf6] pt-9 text-center">
              <p className="text-[17px] leading-[1.7] text-[#1f2a37]">{n.vision.outro[lang][0]}</p>
              <p className={`${mont} mt-4 text-[15px] font-semibold leading-[1.6] text-[#0080cc]`}>{n.vision.outro[lang][1]}</p>
            </div>
          </div>
        </RevealOnView>

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

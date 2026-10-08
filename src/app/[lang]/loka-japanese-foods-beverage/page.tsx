import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { DivisionPage, mont } from "@/components/sections/division/primitives";
import { LOKA } from "@/content/pages/loka-japanese-foods-beverage";
import { isLang } from "@/lib/i18n";

export const metadata: Metadata = { title: "LOKA JAPANESE FOODS & BEVERAGE" };

const shadow = "shadow-[0_0_10px_-7px_rgba(0,0,0,0.5)]";
const body = `${mont} text-[16px] leading-[1.6]`;

/** Full-width white band with the soft LOKA shadow; content constrained to the 1270px Elementor container. */
function Band({ children, className = "", inner = "", id }: { children: ReactNode; className?: string; inner?: string; id?: string }) {
  return (
    <section id={id} className={`bg-white ${shadow} ${className}`}>
      <div className={`mx-auto max-w-[1270px] px-[10px] desktop:px-0 ${inner}`}>{children}</div>
    </section>
  );
}

function H({ children, className = "", as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h2" | "h3" }) {
  return <Tag className={`${mont} font-bold text-[#0080cc] ${className}`}>{children}</Tag>;
}

function Photo({ src, className = "", sizes, rounded = "" }: { src: string; className?: string; sizes: string; rounded?: string }) {
  return (
    <div className={`bg-white ${shadow} ${className}`}>
      <Image src={src} alt="" width={800} height={800} sizes={sizes} className={`aspect-square w-full object-cover transition-transform duration-300 hover:scale-[1.1] ${rounded}`} />
    </div>
  );
}

export default async function Page({ params }: PageProps<"/[lang]/loka-japanese-foods-beverage">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const l = LOKA;

  return (
    <DivisionPage className="space-y-10 pb-[120px] pt-10 max-[1024px]:space-y-5">
      {/* Hero: grey overlay band (no background image on live) */}
      <section className="flex min-h-[335px] items-center bg-[#cdcdcd] px-10 py-[30px] tablet:min-h-[600px] tablet:px-5 tablet:py-0">
        <div className="mx-auto w-full max-w-[1270px] p-[10px]">
          <h1 className={`${mont} whitespace-pre-line text-[40px] font-bold capitalize leading-[1.3] text-white tablet:text-[70px] tablet:leading-[91px]`}>
            {l.hero.heading[lang]}
          </h1>
          <a
            href={l.hero.button.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${mont} mt-10 inline-block rounded-[25px] bg-white px-[30px] py-[15px] text-[16px] leading-[16px] text-[#0080cc] hover:text-[#0080cc]`}
          >
            {l.hero.button.label[lang]}
          </a>
        </div>
      </section>

      {/* Business overview */}
      <Band inner="grid items-center desktop:grid-cols-[753px_1fr] desktop:min-h-[608px]">
        <div className="p-[10px]">
          <H className="mb-5 text-[30px] uppercase leading-[30px]">{l.overview.heading[lang]}</H>
          <p className={`${body} text-justify`}>{l.overview.text[lang]}</p>
        </div>
        <div className="px-[25px] pb-[35px] pt-[25px] desktop:pt-[95px]">
          <Image src={l.overview.image} alt="" width={800} height={800} sizes="(min-width: 1025px) 458px, 100vw" className="aspect-square w-full rounded-[8px] object-cover" />
        </div>
      </Band>

      {/* Product introduction */}
      <Band inner="p-[10px] pt-[35px] pb-[35px]">
        <H className="mb-5 text-center text-[30px] uppercase leading-[30px]">{l.products.heading[lang]}</H>
        <p className={`${body} mb-5 text-justify`}>{l.products.text[lang]}</p>
        <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-5">
          {l.products.items.map((it) => (
            <figure key={it.src} className={`bg-white p-[10px] ${shadow}`}>
              <Image src={it.src} alt={it.caption[lang]} width={800} height={800} sizes="(min-width: 1025px) 230px, 50vw" className="aspect-square w-full object-cover" />
              <figcaption className="mt-2 text-center text-[16px] italic leading-[1.6]">{it.caption[lang]}</figcaption>
            </figure>
          ))}
        </div>
      </Band>

      {/* Our strength */}
      <Band inner="grid items-center desktop:grid-cols-[754px_1fr] desktop:min-h-[628px]">
        <div className="px-[10px] py-[25px] desktop:px-0">
          <H className="mb-5 text-[30px] uppercase leading-[30px]">{l.strength.heading[lang]}</H>
          <h3 className={`${mont} mb-5 text-[26px] font-semibold leading-[1.2] text-[#0080cc]`}>{l.strength.sub[lang]}</h3>
          <p className={`${body} text-justify`}>
            {l.strength.text[lang][0]}
            <br />
            {l.strength.text[lang][1]}
          </p>
        </div>
        <div className="p-[10px] desktop:pt-[110px]">
          <Image src={l.strength.image} alt="" width={800} height={800} sizes="(min-width: 1025px) 488px, 100vw" className="aspect-square w-full object-cover" />
        </div>
      </Band>

      {/* 2. Products uniqueness */}
      <div className="space-y-5">
        <div className="mx-auto max-w-[1270px] p-[10px] text-center">
          <h3 className={`${mont} mb-5 text-[26px] font-semibold leading-[1.2] text-[#0080cc]`}>{l.uniqueness.heading[lang]}</h3>
          <p className={body}>{l.uniqueness.text[lang]}</p>
        </div>
        {l.uniqueness.rows.map((row) => {
          const pics = (
            <div className={`grid grid-cols-2 bg-white p-[10px] ${shadow} desktop:w-[445px]`}>
              {row.images.map((src) => (
                <Photo key={src} src={src} sizes="(min-width: 1025px) 192px, 50vw" className="p-[10px]" />
              ))}
            </div>
          );
          const copy = (
            <div className="flex-1 p-[10px]">
              <H className="mb-5 text-[20px] capitalize leading-[20px]">{row.heading[lang]}</H>
              <p className={body}>{row.text[lang]}</p>
            </div>
          );
          return (
            <Band key={row.heading.en} inner={`flex flex-col items-center desktop:min-h-[232px] ${row.imagesFirst ? "desktop:flex-row" : "desktop:flex-row-reverse"}`}>
              {pics}
              {copy}
            </Band>
          );
        })}
      </div>

      {/* 3. Best solution provider */}
      <Band inner="px-5 py-[25px]">
        <h3 className={`${mont} mb-5 text-[26px] font-semibold leading-[1.2] text-[#0080cc]`}>{l.solution.heading[lang]}</h3>
        <p className={body}>{l.solution.text[lang]}</p>
        <div className="mt-5 grid tablet:grid-cols-3">
          {l.solution.images.map((src) => (
            <Photo key={src} src={src} sizes="(min-width: 1025px) 390px, 100vw" className="p-[10px]" rounded="rounded-[10px]" />
          ))}
        </div>
      </Band>

      {/* Get in touch */}
      <section className="!mt-5 bg-[#0080cc] p-5 tablet:px-[30px] tablet:py-[10px] desktop:px-0 desktop:py-0">
        <div className="mx-auto grid min-h-[100px] max-w-[1140px] items-center gap-4 tablet:grid-cols-2">
          <h2 className={`${mont} p-[10px] text-[30px] font-bold uppercase leading-[30px] text-white`}>{l.contact.heading[lang]}</h2>
          <div className="p-[10px] text-center">
            <a
              href={l.contact.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-[25px] bg-white px-[30px] py-[10px] text-[16px] leading-[16px] text-[#0080cc] hover:text-[#0080cc]"
            >
              {l.contact.button[lang]}
            </a>
          </div>
        </div>
      </section>

      {/* Major clients */}
      <Band className="!mt-5" inner="p-[10px] py-[35px]">
        <H className="text-center text-[25px] capitalize leading-[25px]">{l.clients.heading[lang]}</H>
        <H as="h3" className="mt-5 text-center text-[25px] capitalize leading-[25px]">
          {l.clients.sub[lang]}
        </H>
        <div className="mt-[35px] grid grid-cols-2 desktop:grid-cols-4">
          {l.clients.images.map((src) => (
            <Photo key={src} src={src} sizes="(min-width: 1025px) 303px, 50vw" className="p-[5px]" rounded="rounded-[10px]" />
          ))}
        </div>
      </Band>

      {/* JETRO video */}
      <Band inner="px-[25px] py-[25px]">
        <H className="text-center text-[25px] capitalize leading-[39px]">{l.video.heading[lang]}</H>
        <H as="h3" className="mt-5 text-center text-[25px] capitalize leading-[39px]">
          {l.video.sub[lang]}
        </H>
        <div className="mx-auto mt-5 aspect-video w-full max-w-[1220px]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${l.video.youtubeId}?controls=1&rel=0`}
            title={l.video.sub[lang]}
            className="size-full border-0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </Band>

      {/* Initiatives */}
      {l.initiatives.map((it) => (
        <Band key={it.heading.en} inner="py-5 px-[10px] desktop:px-0">
          <h3 className={`${mont} mb-5 text-center text-[26px] font-semibold leading-[1.2] text-[#0080cc]`}>{it.heading[lang]}</h3>
          <p className={`${body} text-center`}>{it.text[lang]}</p>
          <div className="mt-10 grid grid-cols-2 desktop:grid-cols-4">
            {it.images.map((src) => (
              <Photo key={src} src={src} sizes="(min-width: 1025px) 298px, 50vw" className="p-[10px]" rounded="rounded-[10px]" />
            ))}
          </div>
        </Band>
      ))}

      {/* Future perspective */}
      <div className="!mt-[60px] pb-10">
        <section className="flex min-h-[400px] flex-col items-center justify-center bg-[#808080] px-5 text-center">
          <h2 className={`${mont} mb-5 text-[30px] font-bold capitalize leading-[30px] text-white`}>{l.future.heading[lang]}</h2>
          <p className={`${body} text-white`}>{l.future.text[lang]}</p>
          <a
            href="#future"
            className="mt-5 inline-flex items-center gap-[5px] rounded-[50px] bg-white px-10 py-[10px] text-[15px] leading-[15px] text-[#0080cc] hover:text-[#0080cc]"
          >
            {l.future.button[lang]}
            <svg viewBox="0 0 448 512" aria-hidden className="size-[15px] fill-current">
              <path d="M207 477.5c9.4 9.4 24.6 9.4 33.9 0l160-160c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L248 402.7V56c0-13.3-10.7-24-24-24s-24 10.7-24 24v346.7L81 283.6c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l160 160z" />
            </svg>
          </a>
        </section>
        <div id="future" className="mx-auto mt-10 max-w-[1270px] space-y-5 px-[10px] desktop:px-0">
          {l.future.rows.map((row) => (
            <div
              key={row.heading.en}
              className={`flex flex-col items-center gap-5 desktop:gap-0 ${row.imageFirst ? "desktop:flex-row" : "desktop:flex-row-reverse"}`}
            >
              <div className={`w-full p-[15px] desktop:w-[445px] ${row.imageFirst ? "" : "desktop:pl-[15px]"}`}>
                <Image
                  src={row.image}
                  alt=""
                  width={800}
                  height={800}
                  sizes="(min-width: 1025px) 415px, 100vw"
                  className={`aspect-square w-full rounded-[8px] object-cover ${shadow}`}
                />
              </div>
              <div className="flex-1 desktop:px-10">
                <H className="mb-5 text-[26px] font-semibold capitalize leading-[35px]">{row.heading[lang]}</H>
                {row.text[lang].map((p) => (
                  <p key={p} className={`${body} mb-4 text-justify last:mb-0`}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DivisionPage>
  );
}

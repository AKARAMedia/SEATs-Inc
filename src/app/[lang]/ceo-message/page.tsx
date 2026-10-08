import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import CenteredPageTitle from "@/components/sections/CenteredPageTitle";
import { CEO } from "@/content/pages/ceo-message";
import { isLang } from "@/lib/i18n";

export const metadata: Metadata = { title: "CEO Message" };

const X_PATH =
  "M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm297.1 84L257.3 234.6 379.4 396H283.8L209 298.1 123.3 396H75.8l111-126.9L69.7 116h98l67.7 89.5L313.6 116h47.5zM323.3 367.6L153.4 142.9H125.1L296.9 367.6h26.3z";
const FB_PATH =
  "M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z";
const TG_PATH =
  "M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm121.8 169.9l-40.7 191.8c-3 13.6-11.1 16.9-22.4 10.5l-62-45.7-29.9 28.8c-3.3 3.3-6.1 6.1-12.5 6.1l4.4-63.1 114.9-103.8c5-4.4-1.1-6.9-7.7-2.5l-142 89.4-61.2-19.1c-13.3-4.2-13.6-13.3 2.8-19.7l239.1-92.2c11.1-4 20.8 2.7 17.2 19.5z";

function LinkBox({ path, viewBox, label, text, href, className }: { path: string; viewBox: string; label: string; text: string; href: string; className: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex min-h-[92px] items-center py-[60px] pl-[7px] pr-4 text-black hover:text-black tablet:py-0 tablet:pl-3 ${className}`}
    >
      <svg viewBox={viewBox} aria-hidden className="mr-[32px] size-[50px] shrink-0 fill-[#0080cc] tablet:mr-[30px]">
        <path d={path} />
      </svg>
      <span className="min-w-0 break-words text-[20px] leading-[32px]">
        {label}
        <br />
        {text}
      </span>
    </a>
  );
}

export default async function Page({ params }: PageProps<"/[lang]/ceo-message">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const c = CEO;

  return (
    <div className="pb-[160px]">
      <CenteredPageTitle>{c.title[lang]}</CenteredPageTitle>

      <section className="container-site grid gap-10 desktop:grid-cols-[minmax(0,536px)_minmax(0,590px)] desktop:justify-between desktop:gap-x-8 desktop:gap-y-0 desktop:pb-[64px]">
        <div className="text-[18px] leading-[1.6]">
          <p className="mb-5 text-[19px] font-semibold italic capitalize leading-[35px] text-[#0080cc] tablet:text-[22px]">
            {c.quote[lang]}
          </p>
          {c.message[lang].map((p) => (
            <p key={p} className="mb-5">
              {p}
            </p>
          ))}
          <p className="mt-5">
            {c.signature.role}
            <br />
            {c.signature.name[lang]}
          </p>
        </div>
        <Image
          src={c.photo.src}
          alt={c.signature.name[lang]}
          width={c.photo.width}
          height={c.photo.height}
          sizes="(min-width: 1025px) 590px, 100vw"
          className="h-auto w-full"
        />
      </section>

      <section className="container-site mt-16 desktop:mt-0">
        <h2 className="border-b-2 border-black pb-[2px] text-[22px] font-bold capitalize leading-[30.8px] text-text">
          {c.profile.title[lang]}
        </h2>
        <div className="pt-[12px] text-[16px] leading-[1.6]">
          <p className="mb-5">
            {c.profile.name[lang]}
            <br />
            {c.profile.role}
          </p>
          {c.profile.paragraphs[lang].map((p, i, all) => (
            <p key={p} className={i === all.length - 1 ? "" : "mb-5"}>
              {p}
            </p>
          ))}
        </div>

        <div className="-mx-[10px] mt-[17px] flex items-center">
          <a href={c.links.x} target="_blank" rel="noopener noreferrer" aria-label="X">
            <svg viewBox="0 0 448 512" aria-hidden className="block size-[52px] fill-black">
              <path d={X_PATH} />
            </svg>
          </a>
          <a href={c.links.note.href} target="_blank" rel="noopener noreferrer" className="hidden tablet:block" aria-label="note" style={{ marginLeft: -1 }}>
            <Image src={c.links.note.img} alt="note" width={c.links.note.width} height={c.links.note.height} className="h-auto w-[265px]" />
          </a>
        </div>

        <div className="mt-[60px] grid tablet:mt-[67px] tablet:grid-cols-2 [&>*]:min-w-0">
          <LinkBox
            path={FB_PATH}
            viewBox="0 0 512 512"
            label={c.links.facebook.label}
            text={c.links.facebook.text}
            href={c.links.facebook.href}
            className="bg-[#f1f7fa]"
          />
          <LinkBox
            path={TG_PATH}
            viewBox="0 0 496 512"
            label={c.links.telegram.label}
            text={c.links.telegram.text}
            href={c.links.telegram.href}
            className="bg-[#e4f1f7] desktop:pl-[112px]"
          />
        </div>
      </section>

      {/* Live uses a 3-up Elementor image carousel (all slides visible on desktop); mobile shows 2 per view */}
      <section className="container-site mt-[38px] tablet:mt-[68px]">
        <div className="-mx-[10px] flex snap-x snap-mandatory gap-[15px] overflow-x-auto px-[15px] [scrollbar-width:none] tablet:gap-[30px] tablet:px-0">
          {c.interviews.images.map((img) => (
            <a
              key={img.src}
              href={c.interviews.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[calc(50%-8px)] shrink-0 snap-start tablet:w-[calc((100%-60px)/3)]"
            >
              <Image src={img.src} alt={img.alt} width={1024} height={1280} sizes="(min-width: 768px) 384px, 50vw" className="h-auto w-full" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

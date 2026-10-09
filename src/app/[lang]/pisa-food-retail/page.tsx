import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/pages/store";
import { isLang } from "@/lib/i18n";

export const metadata: Metadata = { title: "PISA FOOD RETAIL" };

/** Underlined black heading link with soft glow (Elementor heading with text-shadow). */
function GlowHeading({ href, children }: { href: string; children: string }) {
  return (
    <h2 className="text-center text-[24px] font-bold capitalize leading-[1.2]">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#010101] underline [text-shadow:0_0_10px_rgba(0,0,0,0.3)] hover:text-[#010101]"
      >
        {children}
      </a>
    </h2>
  );
}

export default async function Page({ params }: PageProps<"/[lang]/pisa-food-retail">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  // Editable in admin → Pages
  const { PISA } = await getPage("pisa-food-retail");
  const p = PISA;
  const [row1, row2] = p.gallery;
  const img = "aspect-[334/220] h-auto w-full object-cover tablet:h-[220px]";

  return (
    <div className="container-site pb-20 pt-10">
      <Image
        src={p.logo.src}
        alt="PISA Food Retail"
        width={p.logo.width}
        height={p.logo.height}
        priority
        sizes="400px"
        className="mx-auto h-auto w-full max-w-[400px]"
      />

      <section className="grid bg-[#e9e9e996] p-[25px] tablet:grid-cols-[381px_1fr]">
        <h1 className="text-center text-[22px] font-bold capitalize leading-[1.4] text-[#f54545]">
          {p.heading[lang].map((line, i) => (
            <span key={line} className="block">
              {i > 0 && " "}
              {line}
            </span>
          ))}
        </h1>
        <p className="text-[16px] leading-[1.6]">{p.text[lang]}</p>
      </section>

      <div className="pb-5 pt-[17px] tablet:pt-[31px]">
        <Image
          src={p.storeLogo.src}
          alt={p.storeLogo.alt}
          width={p.storeLogo.width}
          height={p.storeLogo.height}
          sizes="536px"
          className="ml-[6px] h-auto w-[244px] tablet:ml-0 tablet:w-[536px]"
        />
      </div>

      {/* Two staggered rows of store photos, as laid out on the live page */}
      <div className="grid gap-[2px] px-1 tablet:mt-[16px] tablet:grid-cols-3 tablet:gap-0 tablet:pl-[170px] tablet:pr-0">
        {row1.map((src) => (
          <div key={src} className="tablet:px-[3px]">
            <Image src={src} alt="SELECT STORE SORA" width={1280} height={720} sizes="(min-width: 768px) 334px, 100vw" className={img} />
          </div>
        ))}
      </div>
      <div className="mt-[2px] grid gap-[2px] px-1 tablet:mt-[6px] tablet:grid-cols-3 tablet:gap-0 tablet:pl-0 tablet:pr-[66px]">
        {row2.map((src) => (
          <div key={src} className="tablet:px-[4px]">
            <Image src={src} alt="SELECT STORE SORA" width={1280} height={720} sizes="(min-width: 768px) 368px, 100vw" className={img} />
          </div>
        ))}
      </div>

      <div className="mt-[57px] pb-[6px]">
        <GlowHeading href={p.storeLocation.href}>{p.storeLocation.label}</GlowHeading>
      </div>
      <iframe
        src={p.storeLocation.embed}
        title="SELECT STORE SORA — Google Maps"
        className="mt-[25px] block h-[450px] w-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <div className="mt-[57px] pb-[6px]">
        <GlowHeading href={p.jobs.href}>{p.jobs.label}</GlowHeading>
      </div>
    </div>
  );
}

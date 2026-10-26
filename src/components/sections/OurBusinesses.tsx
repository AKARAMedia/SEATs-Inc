import Image from "next/image";
import { OUR_BUSINESSES } from "@/content/pages/option-career";
import type { Lang } from "@/lib/i18n";
import SmartLink from "@/components/SmartLink";

export default function OurBusinesses({ lang }: { lang: Lang }) {
  return (
    <section className="py-16 tablet:py-20">
      <div className="container-site">
        <h2 className="text-center text-[28px] font-bold text-heading desktop:text-[36px]">
          {lang === "ja" ? "私たちの事業" : "Our Businesses"}
        </h2>
        <div className="mt-10 grid gap-6 tablet:grid-cols-2 desktop:grid-cols-4">
          {OUR_BUSINESSES.map((b) => (
            <SmartLink
              key={b.key}
              lang={lang}
              href={b.href}
              target={b.href.startsWith("http") ? "_blank" : undefined}
              rel={b.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
            >
              <div className="relative h-40 w-full overflow-hidden" style={{ borderTop: `4px solid ${b.color}` }}>
                {b.image ? (
                  <Image
                    src={b.image.src}
                    alt={b.name}
                    fill
                    sizes="(min-width: 1025px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: b.color }}>
                    {b.logo && (
                      <span className="flex size-24 items-center justify-center overflow-hidden rounded-xl bg-white p-3 shadow-sm">
                        <Image src={b.logo.src} alt={b.name} width={b.logo.width} height={b.logo.height} className="size-full object-contain" />
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-1 items-center p-5">
                <h3 className="text-[15px] font-bold text-heading">{b.name}</h3>
              </div>
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  );
}

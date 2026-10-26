import Image from "next/image";
import { MEET_OUR_MEMBERS } from "@/content/pages/option-career";
import type { Lang } from "@/lib/i18n";

export default function MeetOurMembers({ lang }: { lang: Lang }) {
  return (
    <section className="bg-sky py-16 tablet:py-20">
      <div className="container-site">
        <h2 className="text-center text-[28px] font-bold text-heading desktop:text-[36px]">
          {lang === "ja" ? "メンバー紹介" : "Meet Our Members"}
        </h2>
        <div className="mt-10 grid gap-6 tablet:grid-cols-2 desktop:grid-cols-4">
          {MEET_OUR_MEMBERS.map((m) => (
            <figure key={m.name} className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image src={m.photo.src} alt="" fill sizes="(min-width: 1025px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <blockquote className="flex-1 p-5 text-[14px] leading-[1.6] text-text">&ldquo;{m.quote}&rdquo;</blockquote>
              <figcaption className="px-5 pb-5 text-[14px]">
                <span className="block font-bold text-heading">{m.name}</span>
                <span className="text-text">{m.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

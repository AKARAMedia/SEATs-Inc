import Image from "next/image";
import { CAREER } from "@/content/pages/option-career";
import type { Lang } from "@/lib/i18n";

const LABELS = {
  cambodian: { prefix: { en: "Find Jobs for", ja: "" }, nation: { en: "CAMBODIAN", ja: "カンボジア人" }, suffix: { en: "Candidates", ja: "採用情報" } },
  japanese: { prefix: { en: "Find Jobs for", ja: "" }, nation: { en: "JAPANESE", ja: "日本人" }, suffix: { en: "Candidates", ja: "採用情報" } },
};

const SIZES = {
  lg: "p-4 desktop:p-5",
  md: "p-3.5 desktop:p-4",
};

/** Circular Cambodia flag badge, cropped from the real flag (public/media/flags/cambodia.svg). */
function CambodiaFlag({ className = "size-12" }: { className?: string }) {
  return (
    <span className={`block overflow-hidden rounded-full ${className}`}>
      <Image src="/media/flags/cambodia.svg" alt="" width={56} height={56} className="size-full object-cover" />
    </span>
  );
}

/** Circular Japan flag badge: a red circle (Hinomaru) centered on white. */
function JapanFlag({ className = "size-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <circle cx="20" cy="20" r="20" fill="#fff" />
      <circle cx="20" cy="20" r="11" fill="#bc002d" />
    </svg>
  );
}

function ArrowBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full desktop:size-9 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

/** The two Cambodian/Japanese recruiting CTAs. Destinations come straight from CAREER.buttons so this and the smaller inline buttons on this page never drift apart. */
export default function RecruitCtaButtons({ lang, size = "lg" }: { lang: Lang; size?: "lg" | "md" }) {
  const [cambodian, japanese] = CAREER.buttons;
  const pad = SIZES[size];

  return (
    <div className="flex w-full max-w-[720px] flex-col gap-4 tablet:flex-row">
      <a
        href={cambodian.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-1 items-center gap-3 rounded-2xl bg-primary text-white shadow-sm transition-colors hover:bg-accent ${pad}`}
      >
        <CambodiaFlag className="size-12 shrink-0 desktop:size-14" />
        <span className="flex-1 leading-[1.3]">
          {LABELS.cambodian.prefix[lang] && <span className="block text-[13px] desktop:text-[14px]">{LABELS.cambodian.prefix[lang]}</span>}
          <span className="block text-[18px] font-bold desktop:text-[20px]">{LABELS.cambodian.nation[lang]}</span>
          <span className="block text-[13px] desktop:text-[14px]">{LABELS.cambodian.suffix[lang]}</span>
        </span>
        <ArrowBadge className="bg-white text-primary" />
      </a>

      <a
        href={japanese.href}
        className={`flex flex-1 items-center gap-3 rounded-2xl border-2 border-[#bc002d] bg-white text-heading shadow-sm transition-colors hover:bg-[#fff5f6] ${pad}`}
      >
        <JapanFlag className="size-12 shrink-0 desktop:size-14" />
        <span className="flex-1 leading-[1.3]">
          {LABELS.japanese.prefix[lang] && <span className="block text-[13px] desktop:text-[14px]">{LABELS.japanese.prefix[lang]}</span>}
          <span className="block text-[18px] font-bold text-[#bc002d] desktop:text-[20px]">{LABELS.japanese.nation[lang]}</span>
          <span className="block text-[13px] desktop:text-[14px]">{LABELS.japanese.suffix[lang]}</span>
        </span>
        <ArrowBadge className="bg-[#bc002d] text-white" />
      </a>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Woodmart full-width slider replica: background-image slides (desktop set + one shared
 * mobile image), autoplay 8s, arrows + dots, with a static text overlay (children) on top.
 */
export default function HeroSlider({
  slides,
  mobileSlide,
  children,
}: {
  slides: string[];
  mobileSlide: string;
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const n = slides.length;

  const restart = useCallback(() => {
    clearInterval(timer.current);
    timer.current = setInterval(() => setIndex((i) => (i + 1) % n), 8000);
  }, [n]);

  useEffect(() => {
    restart();
    return () => clearInterval(timer.current);
  }, [restart]);

  const go = (i: number) => {
    setIndex((i + n) % n);
    restart();
  };

  return (
    <section className="relative h-[680px] overflow-hidden tablet:h-[920px]" aria-roledescription="carousel">
      <div
        className="flex h-full transition-transform duration-[900ms] ease-[cubic-bezier(0.645,0.045,0.355,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((src, i) => (
          <div
            key={src}
            className="relative h-full w-full shrink-0 overflow-hidden"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${n}`}
            aria-hidden={i !== index}
          >
            {/* Parallax-ish: background drifts against the slide motion */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[900ms] max-[767px]:![background-image:var(--m)]"
              style={
                {
                  backgroundImage: `url(${src})`,
                  "--m": `url(${mobileSlide})`,
                  transform: `translateX(${(i - index) * -30}%)`,
                } as React.CSSProperties
              }
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0">{children}</div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(index - 1)}
        className="absolute left-[15px] top-1/2 hidden -translate-y-1/2 p-[10px] text-[#333]/70 hover:text-[#333] tablet:block"
      >
        <svg viewBox="0 0 12 22" className="h-[22px] w-[12px]" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
          <path d="M11 1L1 11l10 10" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(index + 1)}
        className="absolute right-[3px] top-1/2 -translate-y-1/2 p-[10px] text-white/60 hover:text-white tablet:right-[15px] tablet:text-[#333]/70 tablet:hover:text-[#333]"
      >
        <svg viewBox="0 0 12 22" className="h-[22px] w-[12px]" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
          <path d="M1 1l10 10L1 21" />
        </svg>
      </button>

      <div className="absolute inset-x-0 bottom-[15px] flex justify-center gap-[10px]">
        {slides.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={`size-[10px] rounded-full border-2 ${i === index ? "border-[#333] bg-[#333]" : "border-[#bbb] bg-transparent"}`}
          />
        ))}
      </div>
    </section>
  );
}

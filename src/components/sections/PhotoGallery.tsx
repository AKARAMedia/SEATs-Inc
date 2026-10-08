"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Img = { src: string; width: number; height: number };

/**
 * Elementor "Basic Gallery" replica: 4 columns at every width, 2px #cfcfcf borders,
 * fixed tile aspect, click opens a simple lightbox (prev/next, Esc to close).
 */
export default function PhotoGallery({ images, aspect, label }: { images: Img[]; aspect: string; label: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  return (
    <>
      <div className="grid grid-cols-4 gap-y-[10px]">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setOpen(i)}
            className="relative block w-full overflow-hidden border-2 border-[#cfcfcf]"
            style={{ aspectRatio: aspect }}
            aria-label={`${label} ${i + 1}`}
          >
            <Image
              src={img.src}
              alt=""
              fill
              sizes="(min-width: 1025px) 298px, 25vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>
      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90"
          onClick={close}
        >
          <Image
            src={images[open].src}
            alt=""
            width={images[open].width}
            height={images[open].height}
            className="max-h-[85vh] w-auto max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button type="button" aria-label="Close" className="absolute right-5 top-4 text-[32px] leading-none text-white/80 hover:text-white" onClick={close}>
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-4 text-[40px] leading-none text-white/80 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-4 text-[40px] leading-none text-white/80 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

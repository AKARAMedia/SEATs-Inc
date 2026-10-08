"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, CloseIcon } from "@/components/icons";

type Photo = { src: string; alt: string };

/**
 * Wraps a news article: clicking any photo (featured image or in the body) opens it full-size
 * in its original aspect ratio, with prev/next across all photos in the article.
 */
export default function ArticleLightbox({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const collect = () =>
    Array.from(root.current?.querySelectorAll<HTMLImageElement>("img") ?? []).filter((img) => !img.closest("[data-no-lightbox]"));

  const onClick = (e: React.MouseEvent) => {
    const img = (e.target as HTMLElement).closest("img");
    if (!img || img.closest("[data-no-lightbox]")) return;
    e.preventDefault(); // images wrapped in <a href="…jpg"> open here instead of navigating
    const imgs = collect();
    setPhotos(imgs.map((i) => ({ src: fullSrc(i), alt: i.alt })));
    setIndex(Math.max(0, imgs.indexOf(img as HTMLImageElement)));
  };

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, step]);

  const photo = index !== null ? photos[index] : null;

  return (
    <div ref={root} onClick={onClick} className="[&_img]:cursor-zoom-in">
      {children}
      {photo &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
            onClick={close}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- full-resolution original, any aspect ratio */}
            <img
              src={photo.src}
              alt={photo.alt}
              className="max-h-[90vh] max-w-[92vw] cursor-default object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25"
            >
              <CloseIcon className="size-[18px]" />
            </button>
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25"
                >
                  <ChevronRight className="size-[14px] rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25"
                >
                  <ChevronRight className="size-[14px]" />
                </button>
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[14px] text-white/80">
                  {index! + 1} / {photos.length}
                </p>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

/** Best full-size source: a linked original, else the un-optimized src behind next/image. */
function fullSrc(img: HTMLImageElement) {
  const link = img.closest("a")?.getAttribute("href");
  if (link && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(link)) return link;
  const optimized = img.currentSrc || img.src;
  try {
    const u = new URL(optimized, location.href);
    if (u.pathname.startsWith("/_next/image")) return u.searchParams.get("url") ?? optimized;
  } catch {}
  return optimized;
}

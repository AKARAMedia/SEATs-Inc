import Image from "next/image";
import type { ReactNode } from "react";
import { montserrat } from "./fonts";

/**
 * Building blocks shared by the NOVA / PISA / LOKA division pages, matching the live
 * Elementor sections: white boxes with a soft shadow (0 0 10px -5px / -7px), Montserrat
 * headings in brand blue, and image cards with an italic caption.
 */

export function DivisionPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  // Exposes the Montserrat family as --font-montserrat for the `font-[family-name:...]` utilities below
  return <div className={`${montserrat.variable} ${className}`}>{children}</div>;
}

export const mont = "font-[family-name:var(--font-montserrat)]";

export function ShadowBox({
  children,
  className = "",
  soft = false,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  /** -7px spread (cards / LOKA) instead of the -5px section shadow */
  soft?: boolean;
  as?: "section" | "div";
}) {
  return (
    <Tag className={`bg-white ${soft ? "shadow-[0_0_10px_-7px_rgba(0,0,0,0.5)]" : "shadow-[0_0_10px_-5px_rgba(0,0,0,0.5)]"} ${className}`}>
      {children}
    </Tag>
  );
}

export function BlueHeading({ children, className = "", as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h1" | "h2" | "h3" }) {
  return <Tag className={`${mont} font-bold capitalize text-[#0080cc] ${className}`}>{children}</Tag>;
}

/** Card: padded box with shadow, square image, centred italic blue caption, then body copy. */
export function ImageCard({
  src,
  alt = "",
  caption,
  children,
  imgClassName = "",
  captionClassName = "text-[#0080cc]",
  sizes = "(min-width: 1025px) 361px, 100vw",
  className = "",
}: {
  src: string;
  alt?: string;
  caption?: string;
  children?: ReactNode;
  imgClassName?: string;
  captionClassName?: string;
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={`bg-white p-[10px] shadow-[0_0_10px_-7px_rgba(0,0,0,0.5)] ${className}`}>
      <figure>
        <Image
          src={src}
          alt={alt || caption || ""}
          width={800}
          height={800}
          sizes={sizes}
          className={`aspect-square w-full object-cover shadow-[0_0_10px_-5px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-[1.1] ${imgClassName}`}
        />
        {caption && <figcaption className={`mt-2 text-center text-[16px] italic leading-[1.6] ${captionClassName}`}>{caption}</figcaption>}
      </figure>
      {children && <div className="mt-5 text-[16px] leading-[1.6]">{children}</div>}
    </div>
  );
}

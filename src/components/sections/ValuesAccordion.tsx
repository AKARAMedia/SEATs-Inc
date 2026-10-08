"use client";

import { useId, useState } from "react";

const PLUS =
  "M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z";
const MINUS =
  "M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z";

/** Elementor accordion replica: one item open at a time, first item open initially. */
export default function ValuesAccordion({ items }: { items: { title: string; body: string[] }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <div>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.title} className={`border border-[#d5d8dc] ${i ? "border-t-0" : ""}`}>
            <button
              type="button"
              id={`${id}-t${i}`}
              aria-expanded={isOpen}
              aria-controls={`${id}-c${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-start px-[20px] py-[15px] text-left text-[16px] font-bold leading-[16px] text-primary"
            >
              <svg viewBox="0 0 448 512" className="mr-[8px] mt-[0px] size-[16px] shrink-0 fill-current" aria-hidden>
                <path d={isOpen ? MINUS : PLUS} />
              </svg>
              <span className="leading-[16px]">{item.title}</span>
            </button>
            <div
              id={`${id}-c${i}`}
              role="region"
              aria-labelledby={`${id}-t${i}`}
              hidden={!isOpen}
              className="border-t border-[#d5d8dc] px-[20px] py-[15px] text-[16px] leading-[25.6px] text-text"
            >
              {item.body.map((p, j) => (
                <p key={j} className="mb-[20px] last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

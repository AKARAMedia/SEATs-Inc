"use client";

import { useState } from "react";
import type { DayStat } from "@/lib/stats";

const fmtDay = (day: string, opts: Intl.DateTimeFormatOptions) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });

/** Round the axis max up to a "nice" even number so the midline is a whole number too. */
function niceMax(n: number) {
  if (n <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(n));
  return [1, 2, 3, 4, 5, 6, 8, 10].map((s) => s * pow).find((v) => v >= n && v % 2 === 0) ?? 10 * pow;
}

/** Daily page views as bars (single series, brand blue); hover/focus a day for views + visitors. */
export default function ViewsChart({ data }: { data: DayStat[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.views)));
  const ticks = [max, max / 2, 0];
  const a = active === null ? null : data[active];

  return (
    <figure className="m-0">
      <div className="relative flex h-[200px] gap-2">
        {/* y-axis labels */}
        <div className="flex w-8 shrink-0 flex-col justify-between pb-0 text-right text-[11px] leading-none text-[#999]">
          {ticks.map((t) => (
            <span key={t}>
              {t}
            </span>
          ))}
        </div>
        <div className="relative flex-1" onMouseLeave={() => setActive(null)}>
          {/* gridlines */}
          {ticks.map((t, i) => (
            <div key={t} className="absolute inset-x-0 border-t border-black/[0.06]" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d, i) => (
              <button
                key={d.day}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${fmtDay(d.day, { day: "numeric", month: "short" })}: ${d.views} views, ${d.visitors} visitors`}
                className="group flex h-full flex-1 items-end"
              >
                <span
                  className={`block w-full rounded-t-[4px] transition-colors ${active === i ? "bg-[#005f99]" : "bg-primary"} ${d.views ? "" : "!bg-transparent"}`}
                  style={{ height: `${(d.views / max) * 100}%`, minHeight: d.views ? 2 : 0 }}
                />
              </button>
            ))}
          </div>
          {a && active !== null && (
            <div
              role="status"
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-[#222] px-2.5 py-1.5 text-[12px] text-white shadow-lg"
              style={{ left: `${((active + 0.5) / data.length) * 100}%` }}
            >
              <div className="font-semibold">{fmtDay(a.day, { weekday: "short", day: "numeric", month: "short" })}</div>
              <div>
                {a.views} views · {a.visitors} visitors
              </div>
            </div>
          )}
        </div>
      </div>
      {/* x-axis: every 7th day and the last day (skipping a weekly label that would collide with it) */}
      <div className="ml-10 mt-1.5 flex text-[11px] text-[#999]">
        {data.map((d, i) => (
          <span key={d.day} className="flex w-0 flex-1 justify-center overflow-visible whitespace-nowrap">
            {(i % 7 === 0 && i < data.length - 4) || i === data.length - 1 ? fmtDay(d.day, { day: "numeric", month: "short" }) : ""}
          </span>
        ))}
      </div>
    </figure>
  );
}

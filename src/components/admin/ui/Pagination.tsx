import Link from "next/link";

/** Page numbers to show: first, last, and a window around the current page, with gaps as null. */
export function pageItems(page: number, pages: number, around = 1): (number | null)[] {
  const keep = new Set([1, pages]);
  for (let n = page - around; n <= page + around; n++) if (n >= 1 && n <= pages) keep.add(n);
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((n, i) => {
    const prev = sorted[i - 1];
    // A gap of exactly one page is shown as that page rather than "…"
    if (prev !== undefined && n - prev === 2) out.push(prev + 1);
    else if (prev !== undefined && n - prev > 2) out.push(null);
    out.push(n);
  });
  return out;
}

export default function Pagination({ page, pages, href }: { page: number; pages: number; href: (n: number) => string }) {
  if (pages <= 1) return null;
  const base = "flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-[13px]";
  const idle = `${base} bg-white ring-1 ring-black/10 hover:bg-black/5`;
  const off = `${base} pointer-events-none bg-white text-[#bbb] ring-1 ring-black/5`;
  return (
    <nav className="flex flex-wrap items-center justify-center gap-1" aria-label="Pagination">
      <Link href={href(page - 1)} aria-label="Previous page" aria-disabled={page <= 1} className={page <= 1 ? off : idle}>
        ‹
      </Link>
      {pageItems(page, pages).map((n, i) =>
        n === null ? (
          <span key={`gap${i}`} className="px-1 text-[#999]">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={n === page ? `${base} bg-primary font-semibold text-white` : idle}
          >
            {n}
          </Link>
        ),
      )}
      <Link href={href(page + 1)} aria-label="Next page" aria-disabled={page >= pages} className={page >= pages ? off : idle}>
        ›
      </Link>
    </nav>
  );
}

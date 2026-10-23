"use client";

import { usePathname, useRouter } from "next/navigation";

/** Rows-per-page dropdown; picking a size navigates to page 1 with the other query params kept. */
export default function PageSizeSelect({ sizes, value, params }: { sizes: readonly number[]; value: number; params: Record<string, string> }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <select
      value={value}
      aria-label="Rows per page"
      className="admin-input !w-auto"
      onChange={(e) => router.push(`${pathname}?${new URLSearchParams({ ...params, limit: e.target.value, page: "1" })}`)}
    >
      {sizes.map((n) => (
        <option key={n} value={n}>
          {n} / page
        </option>
      ))}
    </select>
  );
}

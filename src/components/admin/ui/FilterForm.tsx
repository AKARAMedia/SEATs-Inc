"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

/** A GET filter form that navigates client-side (no full page reload); empty fields are left out of the URL. */
export default function FilterForm({ children, className }: { children: ReactNode; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        for (const [k, v] of new FormData(e.currentTarget)) if (typeof v === "string" && v) params.set(k, v);
        router.push(`${pathname}${params.size ? `?${params}` : ""}`);
      }}
    >
      {children}
    </form>
  );
}

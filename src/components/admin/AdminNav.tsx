"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin/", label: "News & Events", match: (p: string) => p === "/admin/" || p.startsWith("/admin/posts") },
  { href: "/admin/messages/", label: "Contact messages", match: (p: string) => p.startsWith("/admin/messages") },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`rounded px-3 py-1.5 text-[13px] font-semibold ${
            i.match(pathname) ? "bg-primary/10 text-primary" : "text-[#555] hover:bg-black/5 hover:text-[#333]"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

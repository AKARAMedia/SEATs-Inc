"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Role } from "@/db/schema";
import { can, ROLE_LABELS, type Perm } from "@/lib/permissions";
import { Icon, type IconName } from "./ui/icons";

type Item = { href: string; label: string; icon: IconName; perm?: Perm; badge?: "unread" | "applications" | "careerApplications"; match: (p: string) => boolean };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/admin/", label: "Dashboard", icon: "dashboard", match: (p) => p === "/admin/" }],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/posts/", label: "News & Events", icon: "news", perm: "viewPosts", match: (p) => p.startsWith("/admin/posts") },
      { href: "/admin/translate/", label: "Translation", icon: "translate", perm: "translate", match: (p) => p.startsWith("/admin/translate") },
      { href: "/admin/home/", label: "Home page", icon: "home", perm: "content", match: (p) => p.startsWith("/admin/home") },
      { href: "/admin/pages/", label: "Pages", icon: "page", perm: "content", match: (p) => p.startsWith("/admin/pages") },
      { href: "/admin/brands/", label: "Brands", icon: "tag", perm: "content", match: (p) => p.startsWith("/admin/brands") },
      { href: "/admin/media/", label: "Media library", icon: "image", perm: "content", match: (p) => p.startsWith("/admin/media") },
    ],
  },
  {
    title: "Inbox",
    items: [
      { href: "/admin/messages/", label: "Messages", icon: "mail", perm: "messages", badge: "unread", match: (p) => p.startsWith("/admin/messages") },
      { href: "/admin/careers/", label: "Careers", icon: "briefcase", perm: "careers", badge: "applications", match: (p) => p.startsWith("/admin/careers") },
    ],
  },
  {
    title: "Career Site",
    items: [
      {
        href: "/admin/career-jobs/",
        label: "Career Jobs",
        icon: "briefcase",
        perm: "careers",
        badge: "careerApplications",
        match: (p) => p.startsWith("/admin/career-jobs"),
      },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/users/", label: "Users", icon: "users", perm: "users", match: (p) => p.startsWith("/admin/users") },
      { href: "/admin/settings/", label: "Settings", icon: "settings", perm: "settings", match: (p) => p.startsWith("/admin/settings") },
      { href: "/admin/activity/", label: "Activity log", icon: "history", perm: "activity", match: (p) => p.startsWith("/admin/activity") },
    ],
  },
];

type User = { name: string; email: string; role: Role };

function NavLinks({
  role,
  pathname,
  unread,
  applications,
  careerApplications,
}: {
  role: Role;
  pathname: string;
  unread: number;
  applications: number;
  careerApplications: number;
}) {
  const badgeValue = { unread, applications, careerApplications };
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {SECTIONS.map((s) => {
        const items = s.items.filter((i) => !i.perm || can(role, i.perm));
        if (!items.length) return null;
        return (
          <div key={s.title}>
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9aa3ad]">{s.title}</p>
            {items.map((i) => {
              const active = i.match(pathname);
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium ${
                    active ? "bg-primary/10 text-primary" : "text-[#4a5561] hover:bg-black/[0.04] hover:text-[#222]"
                  }`}
                >
                  <Icon name={i.icon} />
                  <span className="flex-1">{i.label}</span>
                  {i.badge && badgeValue[i.badge] > 0 && (
                    <span className="min-w-5 rounded-full bg-red-600 px-1.5 text-center text-[11px] font-bold leading-5 text-white" aria-label={`${badgeValue[i.badge]} new`}>
                      {Math.min(99, badgeValue[i.badge])}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

function UserBox({ user, pathname, logout }: { user: User; pathname: string; logout: () => Promise<void> }) {
  const initials = (user.name || user.email).trim().slice(0, 1).toUpperCase();
  return (
    <div className="border-t border-black/10 p-3">
      <Link
        href="/admin/account/"
        aria-current={pathname.startsWith("/admin/account") ? "page" : undefined}
        className="flex items-center gap-3 rounded-md p-2 hover:bg-black/[0.04] aria-[current=page]:bg-primary/10"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-semibold text-white">{initials}</span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-[#222]">{user.name || user.email}</span>
          <span className="block truncate text-[12px] text-[#888]">{ROLE_LABELS[user.role].label} · My account</span>
        </span>
      </Link>
      <div className="mt-1 flex gap-1">
        <a href="/" target="_blank" className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-[#555] hover:bg-black/[0.04]">
          <Icon name="external" className="size-4" /> View site
        </a>
        <form action={logout} className="flex-1">
          <button type="submit" className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-[#555] hover:bg-red-50 hover:text-red-600">
            <Icon name="logout" className="size-4" /> Log out
          </button>
        </form>
      </div>
    </div>
  );
}

/** Fixed sidebar on desktop; top bar with a slide-out drawer below 1024px. */
export default function AdminSidebar({
  user,
  unread,
  applications,
  careerApplications,
  logout,
}: {
  user: User;
  unread: number;
  applications: number;
  careerApplications: number;
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const logo = (
    <Link href="/admin/" className="flex items-center gap-2.5">
      <Image src="/media/seats-inc.png" alt="S.E.A.T.S Inc." width={1701} height={412} className="h-7 w-auto" priority />
      <span className="rounded bg-black/5 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#777]">Admin</span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-black/10 bg-white px-4 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="-ml-2 rounded-md p-2 hover:bg-black/5">
          <Icon name="menu" className="size-5" />
        </button>
        {logo}
        {unread > 0 && (
          <Link href="/admin/messages/?view=unread" className="ml-auto flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-semibold text-red-700">
            <Icon name="mail" className="size-4" /> {unread}
          </Link>
        )}
      </header>

      {/* Drawer backdrop (mobile) */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-black/10 bg-white transition-transform lg:w-[240px] lg:translate-x-0 ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        aria-label="Admin menu"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 px-4">
          {logo}
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-md p-1.5 hover:bg-black/5 lg:hidden">
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <NavLinks role={user.role} pathname={pathname} unread={unread} applications={applications} careerApplications={careerApplications} />
        <UserBox user={user} pathname={pathname} logout={logout} />
      </aside>
    </>
  );
}

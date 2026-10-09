"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MAIN_NAV, type NavItem } from "@/content/site";
import { SOCIAL_LABELS, type Settings } from "@/lib/settings-schema";
import { href as localHref, type Lang } from "@/lib/i18n";
import { Suspense } from "react";
import LangSwitcher, { LangSwitcherFallback } from "./LangSwitcher";
import SmartLink from "./SmartLink";
import ActiveNavLink from "./ActiveNavLink";
import { ArrowUpRight, ChevronDown, ChevronRight, CloseIcon, MenuIcon, PinIcon, SocialIcon } from "./icons";

function Dropdown({ items, lang, nested = false }: { items: NavItem[]; lang: Lang; nested?: boolean }) {
  return (
    <ul
      className={`invisible absolute z-50 w-[220px] rounded-[5px] bg-white p-5 text-left opacity-0 shadow-[0_0_3px_rgba(0,0,0,0.15)] transition-all duration-200 ${
        nested
          ? "left-full top-[-20px] ml-5 group-hover/sub:visible group-hover/sub:opacity-100"
          : "left-[-15px] top-full mt-[15px] translate-y-[10px] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      } before:absolute before:inset-x-0 before:-top-[25px] before:h-[25px] before:content-['']`}
    >
      {items.map((c) => (
        <li key={c.label.en} className={c.children ? "group/sub relative" : undefined}>
          {c.href ? (
            <SmartLink
              lang={lang}
              href={c.href}
              className="block py-2 text-[14px] leading-[1.3] text-[#838383] hover:text-heading"
            >
              {c.label[lang]}
            </SmartLink>
          ) : (
            <span className="flex cursor-default items-center justify-between py-2 text-[14px] leading-[1.3] text-[#838383] hover:text-heading">
              {c.label[lang]}
              <ChevronRight className="size-[8px]" />
            </span>
          )}
          {c.children && <Dropdown items={c.children} lang={lang} nested />}
        </li>
      ))}
    </ul>
  );
}

type SocialLinks = Settings["social"]["links"];

function Socials({ links, className = "" }: { links: SocialLinks; className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      {links.map((s) => (
        <a
          key={s.url}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={SOCIAL_LABELS[s.network]}
          className="flex size-[26px] items-center justify-center text-black/60 hover:text-black"
        >
          <SocialIcon name={s.network} />
        </a>
      ))}
    </div>
  );
}

// Recruit call-to-action: green pill (#AACD06 / #0F1B2D), navy with white text on hover
const RECRUIT_BTN =
  "inline-flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-[22px] text-[12px] font-bold uppercase tracking-[0.08em] text-[#0f1b2d] transition-colors duration-200 hover:bg-[#0f1b2d] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1b2d]";

function MobileItem({ item, lang, depth = 0 }: { item: NavItem; lang: Lang; depth?: number }) {
  const [open, setOpen] = useState(false);
  const row = "flex min-h-[50px] items-center border-b border-black/10 text-[13px] font-semibold uppercase text-heading";
  return (
    <li>
      <div className={row} style={{ paddingLeft: 20 + depth * 15 }}>
        {item.highlight && item.href ? (
          <div className="flex-1 py-2.5 pr-5">
            <SmartLink lang={lang} href={item.href} className={RECRUIT_BTN}>
              {item.label[lang]}
              <ArrowUpRight />
            </SmartLink>
          </div>
        ) : item.href ? (
          <SmartLink lang={lang} href={item.href} className="flex-1 py-3">
            {item.label[lang]}
          </SmartLink>
        ) : (
          <button type="button" className="flex-1 py-3 text-left uppercase" onClick={() => setOpen(!open)}>
            {item.label[lang]}
          </button>
        )}
        {item.children && (
          <button
            type="button"
            aria-label="Toggle submenu"
            aria-expanded={open}
            className="flex h-[50px] w-[50px] items-center justify-center border-l border-black/10"
            onClick={() => setOpen(!open)}
          >
            <ChevronDown className={`size-[10px] transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
      {item.children && open && (
        <ul>
          {item.children.map((c) => (
            <MobileItem key={c.label.en} item={c} lang={lang} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Header({ lang, socials, mapUrl }: { lang: Lang; socials: SocialLinks; mapUrl: string }) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 70);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Spacer for the fixed header (Woodmart sticky header, 70px) */}
      <div className="h-[70px]" aria-hidden />
      <header
        className={`fixed inset-x-0 top-0 z-40 bg-white transition-shadow ${stuck ? "shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : ""}`}
      >
        <div
          className="mx-auto flex h-[70px] max-w-[1440px] items-center px-[15px] min-[1366px]:px-[51px]"
        >
          <Link href={localHref(lang, "/")} aria-label="Site logo" className="mr-auto shrink-0 desktop:mr-0">
            <Image
              src="/media/seats-inc.png"
              alt="S.E.A.T.S Inc. (シーツインク)"
              width={1701}
              height={412}
              priority
              className="h-[42px] w-auto desktop:h-auto desktop:w-[190px] min-[1200px]:w-[248px]"
            />
          </Link>

          <nav aria-label="Main navigation" className="hidden flex-1 justify-center desktop:flex">
            <ul className="flex h-[40px] items-center gap-x-[14px] min-[1200px]:gap-x-5 min-[1366px]:gap-x-[30px]">
              {MAIN_NAV.map((item) => (
                <li key={item.label.en} className="group relative">
                  {item.highlight && item.href ? (
                    <ActiveNavLink
                      href={localHref(lang, item.href)}
                      className={RECRUIT_BTN}
                      activeClassName="!bg-[#0f1b2d] !text-white"
                    >
                      {item.label[lang]}
                      <ArrowUpRight />
                    </ActiveNavLink>
                  ) : item.href ? (
                    <ActiveNavLink
                      href={localHref(lang, item.href)}
                      className="flex h-10 items-center whitespace-nowrap text-[14px] font-semibold uppercase leading-[18px] text-heading hover:text-heading/60 min-[1200px]:text-[15px]"
                      activeClassName="!text-primary"
                    >
                      {item.label[lang]}
                    </ActiveNavLink>
                  ) : (
                    <span
                      tabIndex={0}
                      className="flex h-10 cursor-default items-center gap-1 whitespace-nowrap text-[14px] font-semibold uppercase leading-[18px] text-heading group-hover:text-heading/60 min-[1200px]:text-[15px]"
                    >
                      {item.label[lang]}
                      <ChevronDown className="size-[7px] opacity-50" />
                    </span>
                  )}
                  {item.children && <Dropdown items={item.children} lang={lang} />}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 desktop:gap-4 min-[1366px]:gap-[30px]">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Map"
              className="hidden h-10 items-center text-black min-[1280px]:flex"
            >
              <PinIcon className="size-[12px]" />
            </a>
            {/* Hidden at 1025–1279px so the menu stays on one row */}
            <Socials links={socials} className="hidden min-[1280px]:flex min-[1366px]:pl-[20px]" />
            {/* Mobile shows socials in two rows next to the logo */}
            <Socials links={socials} className="flex max-w-[80px] flex-wrap justify-center desktop:hidden" />
            <Suspense fallback={<LangSwitcherFallback lang={lang} />}>
              <LangSwitcher lang={lang} />
            </Suspense>
            <button
              type="button"
              className="flex size-10 items-center justify-center text-heading desktop:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile side drawer */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity desktop:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] overflow-y-auto bg-white transition-transform duration-300 desktop:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile menu"
        inert={!open}
        // Close the drawer when any link inside it is followed
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
      >
        <div className="flex h-[50px] items-center justify-between border-b border-black/10 px-5 text-[13px] font-semibold uppercase">
          Menu
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <ul>
          {MAIN_NAV.map((item) => (
            <MobileItem key={item.label.en} item={item} lang={lang} />
          ))}
        </ul>
      </aside>
    </>
  );
}

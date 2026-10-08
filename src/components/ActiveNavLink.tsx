"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

type Props = { href: string; className: string; activeClassName: string; children: ReactNode };

function Active({ href, className, activeClassName, children }: Props) {
  const active = usePathname() === href;
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`${className} ${active ? activeClassName : ""}`}>
      {children}
    </Link>
  );
}

/** Top-level nav link highlighted on its own page (Woodmart current-menu-item). Falls back to a plain link in prerendered shells. */
export default function ActiveNavLink(props: Props) {
  return (
    <Suspense
      fallback={
        <Link href={props.href} className={props.className}>
          {props.children}
        </Link>
      }
    >
      <Active {...props} />
    </Suspense>
  );
}

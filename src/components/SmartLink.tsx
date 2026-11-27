import Link from "next/link";
import type { ComponentProps } from "react";
import { href as localHref, type Lang } from "@/lib/i18n";
import { isExternal } from "@/content/site";

/**
 * Link that prefixes internal paths with the current language. External http(s) URLs are plain anchors that
 * open in a new tab (callers can still override `target`/`rel`).
 */
export default function SmartLink({
  lang,
  href,
  ...rest
}: { lang: Lang; href: string } & Omit<ComponentProps<"a">, "href">) {
  if (isExternal(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...rest} />;
  }
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return <a href={href} {...rest} />;
  }
  return <Link href={localHref(lang, href)} {...rest} />;
}

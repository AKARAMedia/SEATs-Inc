import Link from "next/link";
import type { ComponentProps } from "react";
import { href as localHref, type Lang } from "@/lib/i18n";
import { isExternal } from "@/content/site";

/** Link that prefixes internal paths with the current language and opens external URLs as plain anchors. */
export default function SmartLink({
  lang,
  href,
  ...rest
}: { lang: Lang; href: string } & Omit<ComponentProps<"a">, "href">) {
  if (isExternal(href) || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return <a href={href} {...rest} />;
  }
  return <Link href={localHref(lang, href)} {...rest} />;
}

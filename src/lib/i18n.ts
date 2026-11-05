export const LANGS = ["en", "ja"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}

/** Cookie holding the visitor's language; middleware.ts picks the page language from it. */
export const LANG_COOKIE = "seats-lang";

/**
 * Public URL for a path. Both languages share one URL (e.g. "/overview/"): the language comes from the
 * visitor's cookie, not the path, so `lang` is accepted only to keep call sites unchanged.
 */
export function href(_lang: Lang, path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

/** Pick the string for the current language from an EN/JA pair. */
export function t<T>(lang: Lang, pair: { en: T; ja: T }): T {
  return pair[lang];
}

export function formatDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Phnom_Penh",
  });
}

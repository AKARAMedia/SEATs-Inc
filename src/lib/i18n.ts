export const LANGS = ["en", "ja"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}

/** Public URL for a path in a given language. `path` is unprefixed, e.g. "/overview/". */
export function href(lang: Lang, path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return lang === "ja" ? `/ja${p}` : p;
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

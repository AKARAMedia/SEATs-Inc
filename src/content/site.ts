// Shared site chrome content (header nav, footer, socials) — hardcoded EN/JA pairs
// mirroring the live WordPress menus + TranslatePress translations.
import type { Lang } from "@/lib/i18n";

type L = { en: string; ja: string };

export type NavItem = {
  label: L;
  /** Internal unprefixed path ("/overview/") or absolute external URL */
  href?: string;
  children?: NavItem[];
  /** Render as the green call-to-action pill (Recruit) */
  highlight?: boolean;
};

export const MAIN_NAV: NavItem[] = [
  {
    label: { en: "Our Company", ja: "会社概要" },
    children: [
      { label: { en: "Overview", ja: "会社概要" }, href: "/overview/" },
      { label: { en: "History", ja: "沿革" }, href: "/history/" },
      { label: { en: "Philosophy & Our Value", ja: "行動指針&企業理念" }, href: "/philosophy-our-value/" },
    ],
  },
  {
    label: { en: "Business", ja: "Business" },
    children: [
      {
        label: { en: "LOKA Japanese Foods&Beverage", ja: "LOKA Japanese Foods&Beverage  (食品輸入卸事業)" },
        href: "https://lokajapanesefoodsbeverage.com/",
      },
      { label: { en: "S.E.A.T.S Farm", ja: "S.E.A.T.S Farm  (農業生産開発事業)" }, href: "https://seatsfarm.com/" },
      { label: { en: "NOVA MARKETING", ja: "NOVA MARKETING  (デジタルマーケティング事業)" }, href: "/nova-marketing/" },
      { label: { en: "PISA FOOD RETAIL", ja: "PISA FOOD RETAIL  (食品小売事業)" }, href: "/pisa-food-retail/" },
      {
        label: { en: "Group Company", ja: "Group Company" },
        children: [{ label: { en: "Sherpa Agent Co,ltd", ja: "Sherpa Agent Co,ltd" }, href: "https://sherpagent.com/" }],
      },
    ],
  },
  { label: { en: "CEO Message", ja: "CEOメッセージ" }, href: "/ceo-message/" },
  { label: { en: "News&Event", ja: "ニュース" }, href: "/news-event/" },
  { label: { en: "Contact", ja: "お問い合わせ" }, href: "/contact/" },
  { label: { en: "Recruit", ja: "S.E.A.T.Sではたらく" }, href: "/option-career/", highlight: true },
];

export const SOCIALS = [
  { name: "Facebook", icon: "facebook", href: "https://www.facebook.com/seatsinccambodia/" },
  { name: "X", icon: "x", href: "https://x.com/seatscoo" },
  { name: "Instagram", icon: "instagram", href: "https://www.instagram.com/seatsinc_cambodia/" },
  { name: "YouTube", icon: "youtube", href: "https://www.youtube.com/@seatsinc5038/featured" },
  { name: "note", icon: "note", href: "https://note.com/mine_blog" },
] as const;

export const MAP_URL = "https://maps.app.goo.gl/NVLMhrNkBYBsuVHA6";

export const COMPANY = {
  phone: "+855 23 966 313",
  address: "No.54 & 56, Street 388, Sangkat Toul Svay Prey 1, Khan Boeng Keng Kang, Phnom Penh, Cambodia.",
};

export const FOOTER = {
  about: {
    title: { en: "About Us", ja: "S.E.A.T.S Inc.とは" },
    text: {
      en: "is a Japanese-owned enterprise based in Phnom Penh, Cambodia since 2013. We focus on sustainable business growth by combining Japanese expertise with Cambodian potential.",
      ja: "は、カンボジア・プノンペンに拠点を置く2013年創業の日系企業です。日本で培った専門知識とカンボジアの可能性を組み合わせることで、サスティナブルなビジネスを展開しています。",
    },
  },
  quickLinks: {
    title: { en: "Quick Links", ja: "クイックメニュー" },
    links: [
      { label: { en: "Company Overview", ja: "会社概要" }, href: "/overview/" },
      { label: { en: "History", ja: "沿革" }, href: "/history/" },
      { label: { en: "Philosophy & Our Value", ja: "企業理念 / 行動指針" }, href: "/philosophy-our-value/" },
      { label: { en: "CEO Message", ja: "CEOメッセージ" }, href: "/ceo-message/" },
      { label: { en: "News & Event", ja: "ニュース" }, href: "/news-event/" },
      { label: { en: "Contact", ja: "お問い合わせ" }, href: "/contact/" },
      { label: { en: "Recruit", ja: "S.E.A.T.Sではたらく" }, href: "/option-career/" },
    ],
  },
  business: {
    title: { en: "Our Business", ja: "S.E.A.T.S Inc.の事業" },
    links: [
      { label: { en: "LOKA Japanese Foods&Beverage", ja: "LOKA Japanese Foods&Beverage (食品輸入卸事業)" }, href: "https://lokajapanesefoodsbeverage.com/" },
      { label: { en: "S.E.A.T.S Farm", ja: "S.E.A.T.S Farm (農業生産開発事業)" }, href: "https://seatsfarm.com/" },
      // Live site renders NOVA as plain text (no link) in the footer
      { label: { en: "NOVA MARKETING", ja: "NOVA MARKETING (デジタルマーケティング事業)" } },
      { label: { en: "PISA FOOD RETAIL", ja: "PISA FOOD RETAIL (食品小売事業)" }, href: "/pisa-food-retail/" },
    ],
    groupTitle: { en: "Group Company", ja: "Group Company" },
    group: [{ label: { en: "Sherpa Agent Co., Ltd", ja: "Sherpa Agent Co., Ltd" }, href: "https://sherpagent.com/EN/" }],
  },
  contact: {
    title: { en: "Contact", ja: "お問い合わせ" },
    phone: { en: "Phone:", ja: "電話番号:" },
    address: { en: "Address:", ja: "本社住所:" },
  },
  jbac: { href: "https://jbac.info/", img: "/media/jbac-image.jpg" },
  copyright: "©SEATS Inc 2013",
} satisfies Record<string, unknown>;

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

export type { L };
export const pick = (lang: Lang, l: L) => l[lang];

// Home page — exact live copy (EN + JA via TranslatePress). News & Events block is DB-driven (HomeNews).
import type { L } from "@/content/site";


// Hero slider, hero text, recruit banners and brand logos are edited in admin → Home page / Brands
// (seeded with the original values by drizzle/0004_phase3_media_brands_home.sql).

export const SITEMAP = {
  company: {
    title: "Company",
    links: [
      { label: { en: "Overview", ja: "会社概要" } as L, href: "/overview/" },
      { label: { en: "History", ja: "沿革" } as L, href: "/history/" },
      { label: { en: "Philosophy & Our Value", ja: "行動指針&企業理念" } as L, href: "/philosophy-our-value/" },
    ],
  },
  business: {
    title: "Business",
    links: [
      {
        label: { en: "LOKA Japanese Foods&Beverage", ja: "LOKA Japanese Foods&Beverage  (食品卸事業)" } as L,
        href: "https://lokajapanesefoodsbeverage.com/",
      },
      { label: { en: "S.E.A.T.S Farm", ja: "S.E.A.T.S Farm  (農業生産開発事業)" } as L, href: "https://seatsfarm.com/" },
      { label: { en: "NOVA MARKETING", ja: "NOVA MARKETING  (デジタルマーケティング事業)" } as L, href: "/nova-marketing/" },
      { label: { en: "PISA FOOD RETAIL", ja: "PISA FOOD RETAIL  (食品小売事業)" } as L, href: "/pisa-food-retail/" },
    ],
  },
  other: [
    { label: { en: "CEO Message", ja: "CEOメッセージ" } as L, href: "/ceo-message/" },
    { label: { en: "News & Events", ja: "最新ニュース" } as L, href: "/news-event/" },
    { label: { en: "Contact", ja: "お問い合わせ" } as L, href: "/contact/" },
    // Live links "Recruit" here to /jp/ (header nav uses /option-career/)
    { label: { en: "Recruit", ja: "S.E.A.T.Sではたらく" } as L, href: "/jp/" },
  ],
};

export const BRAND_TITLE = "Our Brand";

// Note: Facebook's Page Plugin timeline only renders posts for visitors who are
// logged into Facebook in their own browser — it shows blank (header only) for
// everyone else, confirmed by loading the plugin URL directly on facebook.com
// outside any iframe. Kept anyway per request; the "Open Facebook Page" link
// below the embed is the fallback for visitors who see a blank box.
export const FACEBOOK_PAGE_URL = "https://www.facebook.com/seatsinccambodia";

const facebookEmbedSrc = (width: number, locale: "en_US" | "ja_JP") =>
  `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(FACEBOOK_PAGE_URL)}&tabs=timeline&width=${width}&height=620&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&locale=${locale}`;

/** Facebook page plugin: 500px (plugin maximum) on desktop/tablet, 360px on mobile */
export const FACEBOOK_EMBED = {
  desktop: { width: 500, height: 620 },
  mobile: { width: 360, height: 620 },
};
export const facebookEmbedUrl = (variant: "desktop" | "mobile", locale: "en_US" | "ja_JP") =>
  facebookEmbedSrc(FACEBOOK_EMBED[variant].width, locale);

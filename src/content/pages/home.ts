// Home page — exact live copy (EN + JA via TranslatePress). News & Events block is DB-driven (HomeNews).
import type { L } from "@/content/site";

type Img = { src: string; width: number; height: number };

export const HERO = {
  title: "S.E.A.T.S Inc.",
  fancy: {
    prefix: "A Japanese ",
    // Typed one after another (eael-fancy-text "typing", 70ms/char, 2500ms hold, loop)
    words: ["Trading", "Import and Export", "Agricultural Production", "Distribution"],
    suffix: " Company",
  },
  tagline: { en: "Based In Phnom Penh, Cambodia.", ja: "カンボジアから世界へ" } as L,
  /** Woodmart slider: 4 slides, autoplay 8s. Tablet/mobile use one shared background. */
  slides: [
    "/media/2025/09/Untitled-design4.jpg",
    "/media/2025/01/stock-photo-central-phnom-penh-city-modern-urban-skyscraper-buildings-skyline-cambodia.jpg",
    "/media/2025/01/Untitled-2.jpg",
    "/media/2025/09/Untitled-design3.jpg",
  ],
  mobileSlide: "/media/2025/01/phnom-penh-4903134_1280.jpg",
};

export const RECRUIT_BANNERS: (Img & { href: string; mobileHeight: number })[] = [
  { src: "/media/2025/01/seats-inc-career.jpg", width: 1024, height: 162, href: "https://seatsinc-career.com/", mobileHeight: 61 },
  // Live links this banner to /jp/ (Japanese recruiting page)
  { src: "/media/2026/09/banner.jpg", width: 768, height: 175, href: "/jp/", mobileHeight: 89 },
];

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

/** "Our Brand" logos. `d` = rendered size on desktop row, `m` = mobile stacked size, `mh` = mobile row height (from live). */
export const BRANDS: { src: string; alt: string; width: number; height: number; d: [number, number]; m: [number, number]; mh: number }[] = [
  { src: "/media/elementor/thumbs/LOKA-logo1-1-r2hzw3mcwn006p03ye21f4gn18nz3tjei56b00risc.png", alt: "LOKA Japanese Foods & Beverage", width: 200, height: 150, d: [139, 104], m: [200, 150], mh: 150 },
  { src: "/media/elementor/thumbs/seatsfarm-logo-r2hzx57wi0fh33hhuub46uz2sninnponzb9q737rvg.png", alt: "S.E.A.T.S Farm", width: 200, height: 150, d: [139, 104], m: [200, 150], mh: 150 },
  { src: "/media/2026/09/NOVA-Logo-Final.png", alt: "NOVA Marketing", width: 3000, height: 3000, d: [178, 178], m: [299, 299], mh: 222 },
  { src: "/media/elementor/thumbs/PISA-Logo-1-scaled-rtfht309vqbcrdp9l0r7gjw96gz7s6b0y7gam9ofz0.png", alt: "PISA Food Retail", width: 200, height: 150, d: [155, 116], m: [200, 150], mh: 139 },
  { src: "/media/2026/09/SELECT-STORE-SORA-Logo.png", alt: "SELECT STORE SORA", width: 3740, height: 1083, d: [166, 48], m: [287, 83], mh: 111 },
  { src: "/media/2026/09/Janpan-Farm-Product-logo.png", alt: "Japan Farm Products", width: 3980, height: 3879, d: [107, 104], m: [228, 222], mh: 223 },
  { src: "/media/2026/09/wordmark.png", alt: "Phsar Ichiba", width: 562, height: 311, d: [107, 59], m: [228, 126], mh: 158 },
];

export const BRAND_TITLE = "Our Brand";

export const FACEBOOK_EMBED =
  "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fseatsinccambodia&tabs=timeline%2Cevents%2Cmessages&width=340&height=700&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true";

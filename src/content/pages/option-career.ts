import type { L } from "@/content/site";

// Recruit ("Option Career") page copy. The live /ja/ version is untranslated (same English copy).
export const CAREER = {
  title: { en: "Option Career", ja: "Option Career" },
  heading: { join: "Join", our: "Our", team: "Team" },
  text: {
    en: "Seeking an opportunity to earn, learn and push yourself to new limits? Discover more about the recruitment process with S.E.A.T.S Inc., for both Cambodian and Japanese by clicking the button below.",
    ja: "Seeking an opportunity to earn, learn and push yourself to new limits? Discover more about the recruitment process with S.E.A.T.S Inc., for both Cambodian and Japanese by clicking the button below.",
  },
  buttons: [
    { label: "CAMBODIAN", href: "https://seatsinc-career.com" },
    // /jp/ is the separate static Japanese recruiting site hosted alongside WordPress.
    // (Live mobile links to seatsinc-career.com/jp/, which 404s — not copied.)
    { label: "JAPANESE", href: "/jp/" },
  ],
  images: {
    hero: { src: "/media/2025/01/career.png", width: 1673, height: 1830 },
    blobRight: { src: "/media/2025/01/bg-career-2.png", width: 323, height: 244 },
    blobLeft: { src: "/media/2025/01/bg-career-1.png", width: 526, height: 367 },
  },
} as const;

// Everything below is additive page content (hardcoded, same as src/content/pages/home.ts's
// SITEMAP/BRAND_TITLE) — not part of the admin-editable CAREER object above, so new sections
// can't collide with the registry's shape-conform system for this page.

export const RECRUIT_HERO_IMAGE = {
  // Real LOKA team photo at a trade-fair booth (src/content/pages/overview.ts's IN_ACTION set).
  src: "/media/2025/03/photo_1_2025-03-19_10-32-19.jpg",
  width: 1280,
  height: 721,
};

export const WHY_JOIN_US = {
  title: { en: "Why Join Us?", ja: "S.E.A.T.Sで働く理由" } as L,
  items: [
    {
      title: { en: "Career Growth", ja: "キャリア成長" } as L,
      text: { en: "Learn from diverse businesses and develop new skills.", ja: "多様な事業から学び、新しいスキルを身につけられます。" } as L,
    },
    {
      title: { en: "Global Team", ja: "グローバルなチーム" } as L,
      text: { en: "Work with Cambodian and Japanese colleagues.", ja: "カンボジア人・日本人の同僚と一緒に働けます。" } as L,
    },
    {
      title: { en: "Real Business Experience", ja: "実践的なビジネス経験" } as L,
      text: { en: "Gain hands-on experience across our businesses.", ja: "複数の事業で実践的な経験を積めます。" } as L,
    },
    {
      title: { en: "Supportive Culture", ja: "支え合う企業文化" } as L,
      text: { en: "We value teamwork, respect, and continuous improvement.", ja: "チームワーク、相互尊重、そして継続的な成長を大切にしています。" } as L,
    },
  ],
};

type BusinessImage = { src: string; width: number; height: number };

export const OUR_BUSINESSES: {
  key: string;
  name: string;
  color: string;
  image: BusinessImage | null;
  logo?: BusinessImage;
  href: string;
}[] = [
  {
    key: "loka",
    name: "LOKA Japanese Foods & Beverage",
    color: "var(--color-loka)",
    image: { src: "/media/2026/10/loka-team.png", width: 2048, height: 1149 },
    href: "https://lokajapanesefoodsbeverage.com/",
  },
  {
    key: "farm",
    name: "S.E.A.T.S Farm",
    color: "var(--color-farm)",
    // seatsfarm.com returned an empty page when checked (2026-10-26) — no live photo could be
    // sourced. Falls back to the brand logo on a solid brand-color tile; swap in a real photo
    // once the live site is back up, or when one is supplied.
    image: null,
    logo: { src: "/media/elementor/thumbs/seatsfarm-logo-r2hzx57wi0fh33hhuub46uz2sninnponzb9q737rvg.png", width: 200, height: 150 },
    href: "https://seatsfarm.com/",
  },
  {
    key: "nova",
    name: "NOVA Marketing",
    color: "var(--color-nova)",
    image: { src: "/media/2026/10/nova-team.png", width: 2048, height: 1149 },
    href: "/nova-marketing/",
  },
  {
    key: "pisa",
    name: "PISA Food Retail",
    color: "var(--color-pisa)",
    image: null,
    logo: { src: "/media/2026/10/pisa-logo.jpg", width: 640, height: 640 },
    href: "/pisa-food-retail/",
  },
];

// Names/roles/quotes copied verbatim from the sibling SEATs-Inc-Career site's real employee
// interviews (its INTERVIEWS array) — real people, real quotes. Paired here with neutral
// activity photos (not their original poster-style graphics, which have baked-in text/decor
// that wouldn't fit a clean redesign) from this repo's own overview.ts IN_ACTION set.
export const MEET_OUR_MEMBERS = [
  {
    name: "Phatya Seng",
    role: "Sales Promotion Supervisor",
    photo: { src: "/media/2025/03/photo_2_2025-03-19_10-32-19.jpg", width: 1280, height: 721 },
    quote:
      "10 years in, my biggest challenge has been adapting as the company grows: team structures shift, roles blur and workloads rise. It built my problem-solving, communication and ownership. I stay for the chance to grow, take on new responsibilities and help teammates reach their goals.",
  },
  {
    name: "Linda Ny",
    role: "Operation Control",
    photo: { src: "/media/2025/07/Container-e1751446909896.jpg", width: 1976, height: 1100 },
    quote:
      "4.5 years and still going strong. Juggling orders, payments, deliveries and last-minute issues is messy but never boring; it keeps me thinking fast and organized. What keeps me here is the team energy: we support each other, communicate openly and solve problems together.",
  },
  {
    name: "Kazuhiro Okuda",
    role: "General Manager, Agri-Business",
    photo: { src: "/media/2025/06/photo_2025-06-19_09-19-32-e1750824385905.jpg", width: 1280, height: 720 },
    quote: "Our dedicated General Manager in Agri-Business, and a key part of our growth since day one. Stay tuned for his inspiring journey.",
  },
  {
    name: "Poch Bunthy",
    role: "General Manager, NOVA Marketing",
    photo: { src: "/media/2025/06/photo_2025-06-19_09-19-27-e1750824586482.jpg", width: 1280, height: 720 },
    quote:
      "Our visionary General Manager, shaping Nova Marketing's journey since day one. His dedication and leadership are at the heart of our success. Stay tuned for his story.",
  },
] as const;

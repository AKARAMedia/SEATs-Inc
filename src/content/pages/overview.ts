// Company Overview — exact live copy (EN + JA via TranslatePress).
import type { L } from "@/content/site";

export const OVERVIEW_TITLE: L = { en: "OVERVIEW", ja: "会社概要" };

export type FactIcon = "card" | "cake" | "user" | "money" | "phone" | "users";

export const FACTS: { icon: FactIcon; value: L; label: L }[] = [
  { icon: "card", value: { en: "S.E.A.T.S Inc.", ja: "S.E.A.T.S Inc." }, label: { en: "Company Name", ja: "社名" } },
  { icon: "cake", value: { en: "November, 2013", ja: "November, 2013" }, label: { en: "Date Established", ja: "設立" } },
  {
    icon: "user",
    value: { en: "Kosuke Mineshima", ja: "峯島 浩輔" },
    label: { en: "Director & CEO", ja: "Director & CEO" },
  },
  { icon: "money", value: { en: "US $100,000", ja: "US $100,000" }, label: { en: "Capital", ja: "資本金" } },
  {
    icon: "phone",
    value: { en: "Kh: (+855)023-966-313", ja: "Kh: (+855)023-966-313" },
    label: { en: "Phone", ja: "本社電話番号" },
  },
  { icon: "users", value: { en: "Total 100", ja: "Total 100" }, label: { en: "Number of Employees", ja: "従業員数" } },
];

export const OFFICES = {
  title: { en: "Offices", ja: "オフィス" } as L,
  items: [
    {
      label: { en: "Cambodia head office:", ja: "カンボジア本社" } as L,
      address: {
        en: "No.54 & 56, Street 388, Sangkat Toul Svay Prey 1, Khan Boeng Keng Kang, Phnom Penh, Cambodia.",
        ja: "No.54 & 56, Street 388, Sangkat Toul Svay Prey 1, Khan Boeng Keng Kang, Phnom Penh, Cambodia.",
      } as L,
    },
    {
      label: { en: "Japan office:", ja: "日本オフィス" } as L,
      address: {
        en: "8F Nipponbashi Kawabe Building, 1-2-6 Nipponbashi, Chuo-ku, Osaka City, Osaka 542-0073, Japan",
        ja: "〒542-0073 大阪市中央区日本橋1丁目2-6 日本橋河辺ビル8F",
      } as L,
    },
  ],
  map: "https://maps.google.com/maps?q=11.548654066286069%2C%20104.90703330490835&t=m&z=15&output=embed&iwloc=near",
};

export const SERVICES = {
  title: { en: "Our Services", ja: "事業内容" } as L,
  items: [
    {
      heading: { en: "1. Food Import & Wholesale", ja: "1.食品輸入卸事業" } as L,
      link: { label: "> LOKA Japanese Foods & Beverage", href: "https://lokajapanesefoodsbeverage.com/" },
      text: {
        en: "We import and wholesale a wide range of authentic Japanese food products, including fresh seafood, Japanese Wagyu beef, and sake, supplying restaurants, hotels, and other businesses. Through our high-frequency logistics network covering all temperature ranges and transportation by land, sea, and air, we source a diverse range of products from Japan and neighboring countries such as Thailand, Vietnam, and Malaysia, delivering them throughout Cambodia. By maintaining close relationships with our partners and suppliers and prioritizing communication with our customers, we meet a wide variety of business needs. We also actively participate in projects connecting Japan and Cambodia in cooperation with organizations such as the Japanese Embassy and JETRO.",
        ja: "鮮魚や和牛、日本酒をはじめとした日本ならではの食材を、レストランやホテルなどへ卸売をしています。日本や周辺各国(タイ、ベトナム、マレーシアなど)から全温度帯・陸海空・高頻度の物流ネットワークを構築し、パートナー企業やサプライヤーと密に連携することでバラエティーに富んだ商品を輸入し、カンボジア全土へ配送。お客様とのコミュニケーションを大切にし様々な顧客のニーズに応えています。また大使館やJETRO等と協力し、日本とカンボジアを繋ぐプロジェクトにも積極的に取り組んでいます。",
      } as L,
    },
    {
      heading: { en: "2. Agricultural Production & Development", ja: "2.農業生産開発事業" } as L,
      link: { label: "> S.E.A.T.S Farm", href: "https://seatsfarm.com/" },
      text: {
        en: "In addition to wholesaling high-quality vegetables and selling products through our own e-commerce platform, we cultivate premium agricultural products with a strong focus on safety and quality at our own farm in Kampot, Cambodia. Our produce includes Kampot Pepper and shiso leaves. We also develop our own original product brand. One of our signature products, Kampot Pepper – Fresh Pepper in Brine, sold 10,000 units at Expo 2025 Osaka, Kansai, gaining attention on social media and driving further sales growth. In recent years, we have also started exporting to the United States, expanding the global reach of products developed in Cambodia.",
        ja: "高品質野菜類の卸売や自社ECでの販売に加え、カンボジア国内(カンポット地方)にある自社農園で胡椒(カンポットペッパー)や大葉など、安心・安全を重視した高付加価値農産物を栽培しています。オリジナル商品ブランドを展開し、目玉商品である「カンポットペッパー生胡椒の塩漬け」は大阪・関西万博で1万個を売り上げ、SNSで話題を呼び、売り上げを伸ばしています。近年はアメリカへの輸出も開始し、カンボジアで生まれた商品の海外展開にも取り組んでいます。",
      } as L,
    },
    {
      heading: { en: "3. Digital Marketing and Web Creation Service", ja: "3. デジタルマーケティング事業" } as L,
      link: { label: "> NOVA Marketing", href: "/nova-marketing/" },
      text: {
        en: "We provide digital marketing and promotional services in Cambodia, specializing in social media platforms. Our services include the production of visual content, videos, and websites, supporting creative projects across a wide range of fields, including our own group businesses. Leveraging our in-house import capabilities, we also operate an e-commerce platform for general consumers, primarily featuring Japanese food products. The platform has served a cumulative total of more than 10,000 customers across Cambodia. Drawing on this experience and expertise, we help businesses grow through effective digital solutions.",
        ja: "カンボジアでのSNS向けデジタルマーケティングおよびプロモーションサービスを提供しています。 ビジュアル、映像、Webなどのコンテンツ制作を手がけ、自社事業をはじめ、幅広いプロジェクトのクリエイティブを支えています。カンボジア全土の累計10,000人への販売実績を持つ、日本食材をメインとした一般消費者向けECプラットフォームの運営も行っています。この知見を活かしお客様のビジネスをデジタル面からサポートいたします。",
      } as L,
    },
    {
      heading: { en: "4. Food Retail", ja: "4. 食品小売事業" } as L,
      link: { label: "> PISA FOOD RETAIL", href: "/pisa-food-retail/" },
      text: {
        en: "We operate our own directly managed retail store, SELECT STORE SORA, with a strong focus on engaging directly with customers. The store offers a selection of products imported from Japan, including Japanese sake, which has been gaining popularity in Cambodia, as well as our own original products. We are also developing unique processed food products and ready-to-eat items, such as bento boxes and prepared dishes, as we continue to explore new ways to bring Japanese food to a wider audience.",
        ja: "お客様と対面で接することを重視し、自社直営店舗 「SELECT STORE SORA」 を運営しています。店舗では近頃カンボジアでも注目されている日本酒を中心に、日本から輸入した食材や、当社のオリジナル商品などを販売しています。独自の加工食品や、お弁当やお惣菜といったReady-To-Eat商品の開発にも取り組み、より幅広い層へ日本食を届ける挑戦をしています。",
      } as L,
    },
  ],
};

export type GalleryImage = { src: string; width: number; height: number };

export const AWARDS = {
  title: { en: "Awards and Honors", ja: "受賞・表彰歴" } as L,
  images: [
    { src: "/media/2025/01/seatsinc-awards-3.jpg", width: 1200, height: 800 },
    { src: "/media/2025/01/seatsinc-awards-1-1.jpg", width: 1200, height: 800 },
    { src: "/media/2025/01/seatsinc-awards-2.jpg", width: 1200, height: 800 },
    { src: "/media/2025/01/seatsinc-awards-4.jpg", width: 1200, height: 800 },
  ] satisfies GalleryImage[],
};

export const IN_ACTION = {
  title: { en: "Our Business In Action", ja: "業務風景" } as L,
  images: [
    { src: "/media/2025/03/photo_1_2025-03-19_10-32-19.jpg", width: 1280, height: 721 },
    { src: "/media/2025/03/photo_2_2025-03-19_10-32-19.jpg", width: 1280, height: 721 },
    { src: "/media/2025/07/Container-e1751446909896.jpg", width: 1976, height: 1100 },
    { src: "/media/2025/03/photo_3_2025-03-19_10-32-19.jpg", width: 1280, height: 718 },
    { src: "/media/2025/06/photo_2025-06-19_09-19-36-e1750824530498.jpg", width: 1280, height: 720 },
    { src: "/media/2025/06/photo_2025-06-19_09-19-32-e1750824385905.jpg", width: 1280, height: 720 },
    { src: "/media/2025/06/photo_2025-06-19_09-19-27-e1750824586482.jpg", width: 1280, height: 720 },
  ] satisfies GalleryImage[],
};

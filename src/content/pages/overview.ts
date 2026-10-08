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
      heading: { en: "1. Food wholesale importing business", ja: "1.食品輸入卸事業" } as L,
      link: { label: "> LOKA Japanese Foods&Beverage", href: "https://lokajapanesefoodsbeverage.com/" },
      text: {
        en: "We purchase fresh food and beverages from Japan, Thailand, and Cambodia, and offer them to Cambodian domestic restaurants and hotels with proposals of new services. In particular, we have strengths in providing fresh fish, and we are offering products that are not available locally and responding to the issues that are unique to the region.",
        ja: "日本、タイをはじめとする周辺各国から新鮮な食品や飲料を輸入し、カンボジア国内の飲食店や小売店に提案、販売および配送をしています。特に鮮魚の提供に強みを持ち、現地では手に入らない製品や現地ならではの課題に応えています。",
      } as L,
    },
    {
      heading: { en: "2. Agricultural production business", ja: "2.農業生産開発事業" } as L,
      link: { label: ">S.E.A.T.S Farm", href: "https://seatsfarm.com/" },
      text: {
        en: "We cultivate high-value-added commodities such as high-quality branded vegetables and high-grade pepper that are safe, at our own farm. We have also started rearing local cows and ducks, and we are in the process of coming up with new business services.",
        ja: "カンボジア国内に保有する自社農園で、高品質ブランド野菜、高級胡椒など、安心・安全を重視した高付加価値農産物を栽培しています。野菜や葉物類は国内の主要小売店へ販売し、胡椒については主に国外への輸出向けに製品化しています。",
      } as L,
    },
    {
      heading: { en: "3. Digital Marketing and Web Creation service", ja: "3. デジタルマーケティング事業" } as L,
      link: { label: ">NOVA Marketing", href: "/nova-marketing/" },
      text: {
        en: "We offer digital marketing and promotion services on social media platforms in Cambodia. Our services include a wide range of solutions such as page maintenance, poster design, content marketing, Facebook advertising, and website creation. We offer a full package front-end and back-end design, and our professional team works closely with you to help grow your business in the digital space.",
        ja: "当社は、カンボジアのSNS向けデジタルマーケティングおよびプロモーションサービスを提供しています。 ページメンテナンス、ポスターデザイン、コンテンツマーケティング、カンボジアで広く利用されているFacebook向け広告、ウェブサイト制作など、幅広いサービスを提供しています。 フロントエンドとバックエンドデザインのフルパッケージを提供し、当社の専門チームがお客様と密にコミュニケーションを取りながら、デジタルの部分からお客様のビジネスの成長に貢献いたします",
      } as L,
    },
    {
      heading: { en: "4. Food retail service", ja: "4. 食品小売事業" } as L,
      link: { label: ">PISA FOOD RETAIL", href: "/pisa-food-retail/" },
      text: {
        en: "We focus on creating direct, face-to-face connections with customers through our own retail store, SELECT STORE SORA. Centered around Japanese sake, we offer a wide range of food products while also developing our own processed foods and Ready-to-Eat products, including bento boxes and prepared dishes. Through these efforts, we are taking on the challenge of bringing Japanese food to a broader range of customers.",
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

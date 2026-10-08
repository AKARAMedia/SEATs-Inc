// LOKA Japanese Foods & Beverage page copy (EN + TranslatePress JA from the live site).
// Note: the live header/footer link "LOKA" to lokajapanesefoodsbeverage.com; this on-domain page
// still exists at /loka-japanese-foods-beverage/ and is rebuilt as-is. Copy is kept verbatim,
// including a few run-on sentences present on the live page.
const m = (p: string) => `/media/2025/01/${p}`;
type L = { en: string; ja: string };
const same = (s: string): L => ({ en: s, ja: s });

export type ProductRow = { heading: L; text: L; images: [string, string]; imagesFirst: boolean };

export const LOKA = {
  title: same("LOKA JAPANESE FOODS & BEVERAGE"),
  hero: {
    heading: same("Japanese Foods Distributor\nIn Cambodia"),
    button: { label: same("LOKA Japanese Food&Beverage"), href: "https://lokajapanesefoodsbeverage.com/" },
  },
  overview: {
    heading: { en: "Business Overview", ja: "概要" },
    text: {
      en: "We started the business in April 2014. As of 2021, we have a total of about 450 customers and are dealing with more than 400 items, making it one of the major Japanese food import and wholesale trading companies in Cambodia. In particular, our strength In addition to fresh fish and other marine products that are shipped directly from Japan by air freight, we are building a distribution network from neighboring countries through our own routes in collaboration with our Bangkok branch office and partners in more than 10 countries. As for agricultural products, we mainly deliver branded vegetables produced at our own farms to supermarkets and restaurants in Phnom Penh. Our business partners are focusing on restaurants, hotels, supermarkets and convenience stores in Cambodia, as well as direct sales to consumers. Recently, we have started to promote Japanese products in Cambodian market as the projects in collaboration with the local governments and producers in Japan and Cambodia.",
      ja: "2014年4月事業開始。2021年現在では総顧客数約450社、400品目以上を取り扱っており、日系の食品輸入卸商社としては有数の規模になっています。特に当社の強みは生鮮品です。日本から航空貨物で直送する鮮魚を始めとする水産品の他、バンコク支社や各国のパートナーとも連携し、独自のルートで近隣諸国からの物流網を構築しています。",
    },
    image: m("banner-distribution.jpg"),
  },
  products: {
    heading: { en: "Product introduction", ja: "製品紹介 PRODUCTS" },
    text: {
      en: "We handle a wide range of categories such as marine products, agricultural products, livestock products, seasonings, beverages, alcoholic beverages, and concerning goods mainly necessary for the restaurant business.",
      ja: "日系食材を中心に、水産物・農産物・畜産物及び調味料・飲料・酒類その他常温品全般という幅広いカテゴリーをお取り扱いしております。",
    },
    items: [
      { src: m("tuna.jpg"), caption: { en: "Fishery", ja: "水産品" } },
      { src: m("wagyu.jpg"), caption: { en: "Livestock", ja: "畜産品" } },
      { src: m("japanese-seasoning-1.jpg"), caption: { en: "Dried Ingredients", ja: "調味料" } },
      { src: m("agricultural-loka-food-and-beverage.jpg"), caption: { en: "Vegetable", ja: "Vegetable" } },
      { src: m("Alcohol.jpg"), caption: { en: "Alcohol Beverages", ja: "酒類" } },
    ],
  },
  strength: {
    heading: { en: "Our strength", ja: "私たちの強み" },
    sub: { en: "1. Original Procurement Network", ja: "１．独自の仕入れネットワーク" },
    text: {
      en: [
        "Since the beginning of our business, we have been building and optimizing the purchasing and distribution routes to deliver the proper products that match domestic needs from customers. Regarding fresh marine products from Japan, we secure stable purchases of 2-3 flights a week from the In addition, in collaboration with partner companies, we have been making efforts to procure reasonable and fresher products by purchasing directly from the producers.",
        "We also have a branch office in Bangkok and are focusing on developing food production factories and supply chains in Thailand. Vietnam , we are actively discovering the potential utilization of local marine products such as Nha Trang. Even in the Mekong area, we have our We secure a stable distribution route every week by land transportation from Bangkok and Ho Chi Minh.",
      ],
      ja: [
        "創業以来、現地のニーズにマッチする商品をお届けするために最適な仕入れ・物流ルートを構築してきました。日本からの生鮮水産品については、東京・大阪・福岡の3大都市より、週2~3便の安定的な仕入れを確保しています。また、パートナー企業との連携により、産地からの直接購入（いわゆる“浜買い“）により、安価で鮮度の高い品物を調達すべく工夫しています。",
        "また、バンコクに調達支店を持ち、タイ国内の食品生産工場やサプライチェーンの開拓にも注力しています。ベトナムではニャチャンをはじめとする現地水産品の活用を積極的にすすめております。メコン領域でもカンボジアの現地ニーズに適した商品の提案力を強化する独自のネットワークを有しています。バンコク、ホーチミンからは陸送で毎週、安定的に物流ルートを確保しています。",
      ],
    },
    image: m("global_network.jpg"),
  },
  uniqueness: {
    heading: { en: "2. Products Uniqueness and Services", ja: "２．当社にしかない品揃え＆サービス" },
    text: {
      en: "We have several representative products in addition to fresh products.",
      ja: "当社は生鮮品以外にも複数の代表的な商品を保有しています。",
    },
    rows: [
      {
        heading: { en: "Azuma-Nishin", ja: "お寿司屋にしん" },
        text: {
          en: "As the sole-authorized distributor of Azuma Foods Co., Ltd. in Cambodia, we are developing Azuma Foods products such as Azuma-Nishin.",
          ja: "製造メーカーである、三重県あづまフーズ社のディストリビューターとして、代表商品である「お寿司屋にしん」をはじめ、あずまフーズ社の製品をカンボジア市場で展開しています。",
        },
        images: [m("Osushiya-Nishin.jpg"), m("Osushiya-Nishin5.jpg")],
        imagesFirst: true,
      },
      {
        heading: { en: "Japanese Whiskey", ja: "酒類（ジャパニーズウィスキー）" },
        text: {
          en: "We have been purchasing Japanese whiskey, which is popular all over the world, through our own procurement route. No exceptions of the recent high demand in all over world, it is sold mainly at foreign-affiliated hotels and specialized liquor shops here in Cambodia also . The demand is getting bigger and bigger year by year.",
          ja: "近年、世界中で人気のあるジャパニーズウィスキーを独自のルートで日本から直接仕入れています。カンボジアでも外資系のホテルや専門的なリカーショップを中心に販売しており、年々人気が加速しています。",
        },
        images: [m("japanese-whiskey-yamazaki.jpg"), m("japanese-whiskey-yamazaki3.jpg")],
        imagesFirst: false,
      },
      {
        heading: { en: "Oba-Leaf (Sushi-leaf)", ja: "大葉" },
        text: {
          en: "In partnership with our agri-business S.E.A.T.S Farm, we also sell fresh agricultural products such as Oba-leaf and several kinds of lettuce. Since we manufacture “Oba”, which is indispensable for fresh fishery products by our own farm, we deliver safe and secure vegetables with 100% established traceability.",
          ja: "自社の農業生産開発事業との提携により、大葉やレタスなどの新鮮な農産物を併せて販売しています。お寿司や刺し身の彩りには欠かせない「大葉」を、現地で完全自社生産しているため、トレーサビリティを確立した安心・安全な品物の提供を実現しています。",
        },
        images: [m("oba3.jpg"), m("oba1.jpg")],
        imagesFirst: true,
      },
      {
        heading: { en: "Cold Chain with Agility", ja: "機動力のあるコールドチェーン" },
        text: {
          en: "In order to flexibly respond to the needs of restaurants, we support small-lot piston delivery in the city, and among them, we are the only company in Cambodia that uses IceBattery® for delivery. IceBattery® is a technology from Japan that can maintain a -18°C environment without using electricity.",
          ja: "当社は英語対応可能な日本人・カンボジア人担当者が常時複数名在籍しています。主に日本語・英語・クメール語・中国語でのお取り合わせに対応できる体制があります。当社の営業は単なる「モノ売り」ではなく、お客様の「コンサルタント」です。",
        },
        images: [m("freepik_br_c62f2f4c-92ec-4ba4-b8d2-878f1fc9ef0c.png"), m("2.jpg")],
        imagesFirst: false,
      },
    ] satisfies ProductRow[],
  },
  solution: {
    heading: same("3. Best Solution Provider"),
    text: {
      en: "We have multiple Japanese and Cambodian staff who can speak English all the time. We have a system that can handle inquiries not only from Khmer customers but also from people of all nationalities. Our business is not just a “selling products”, but a ” We value the stance to think together and exploring what is the best for our customers. We think carefully about how to solve them through our network and experience. We value the stance to think together and exploring what is the best for our customers. Beyond being a business that imports and sells food & Cambodias, our first priority is to become the best partner to prosper together in the future.",
      ja: "食材のお問い合わせの根本にあるお客様の本質的な問題・課題を見極め、当社のネットワークや経験を通じて、どのように解決するのかを親身に考える。お客様にとってなにが良いのかを提案し、模索していくスタンスを大切にしております。",
    },
    images: [m("Best-Solution-1.jpg"), m("Best-Solution-2.jpg"), m("Best-Solution-3.jpg")],
  },
  contact: {
    heading: { en: "Get in touch with Us", ja: "お問い合わせ" },
    button: { en: "Contact Us", ja: "お問い合わせ" },
    // Live button points at lokafoodbeverage.com/contact/ (LOKA's own site)
    href: "https://lokafoodbeverage.com/contact/",
  },
  clients: {
    heading: { en: "Major clients Event / PR", ja: "お取引先例" },
    sub: { en: "AEON Cambodia Japan Fair (September 2018)", ja: "AEONカンボジア ジャパンフェア出展（2018年9月）" },
    images: [m("aeon-japan-fair-2023-6.jpg"), m("aeon-japan-fair-2023-4.jpg"), m("aeon-japan-fair-2023-7.jpg"), m("aeon-japan-fair-2023-5.jpg")],
  },
  video: {
    heading: same("Business meeting for Cambodia sponsored"),
    sub: same("By JETRO Kumamoto as a Japanese food supplier (January 2020)"),
    youtubeId: "cYQBxAHlorY",
  },
  initiatives: [
    {
      heading: { en: "Digital marketing business initiatives (JETRO adopted)", ja: "JETRO採択案件 デジタルマーケティング事業の取り組み" },
      text: {
        en: "As a project adopted by JETRO (Japan External Trade Organization), we promote products of companies in Yamaguchi and Saitama prefectures. We made our first attempt using local social media using Cambodian influencers.",
        ja: "\"JETRO（日本貿易振興機構）の採択事業として、山口県・埼玉県の企業様の製品のプロモーションを実施。 カンボジア人のインフルエンサーを活用し、現地でのソーシャルメディアを活用して初の試みを行いました。\"",
      },
      images: [m("digital-marketing-7.jpg"), m("digital-marketing-5.jpg"), m("digital-marketing-4.jpg"), m("digital-marketing-3.jpg")],
    },
    {
      heading: { en: "Umamil Food Export Platform in Japan", ja: "ウマミル社 カンボジアパートナー" },
      text: same(
        "We are collaborating with Umamil, a startup company wholly owned by SoftBank Corp. We will collaborate in all aspects to develop sales channels for Japanese companies in Cambodia.",
      ),
      images: [m("umamil-food-export-4.jpg"), m("umamil-food-export-2.jpg"), m("umamil-food-export-1.jpg"), m("umamil-food-export-3.jpg")],
    },
  ],
  future: {
    heading: { en: "FUTURE PERSPECTIVE", ja: "これから注力していく取組み" },
    text: {
      en: "As a future initiative, we will expand our business in the following directions .",
      ja: "今後の取り組みとして、以下の方向性で事業を拡大させていきます。",
    },
    button: { en: "Read More", ja: "続きを表示する" },
    rows: [
      {
        heading: { en: "Strengthening Of The Supplier Network", ja: "仕入元ネットワークの強化" },
        text: {
          en: ["We will communicate more closely with each producer in each origin country. In order to realize the optimized distribution in Cambodia at a lower cost at the fresher and more suitable for the clients."],
          ja: ["より鮮度が高く、現地にあった形で、より安価にカンボジアで流通させるため、各生産者様とより密にコミュニケーションを図っていきます。"],
        },
        image: m("digital-marketing-seo-google-1725340.jpg"),
        imageFirst: true,
      },
      {
        heading: { en: "LOKA Brand Products", ja: "LOKAブランド商品の企画、提案" },
        text: {
          en: [
            "We will also start producing package designs for Khmer, planning LOKA original brand products, and developing products that meet the needs of the Cambodian market.",
            "We will always do our best to make the best proposals to our customers from the direct marketing in Cambodia",
          ],
          ja: [
            "タイやベトナムをはじめとした近隣東南アジア諸国の生産者との連携により、調達力を一層強化していきます。クメール語対応のパッケージデザイン製作やLOKAオリジナルブランド商品の企画、カンボジアの市場のニーズに合った製品の開発にも着手します。",
            "常にお客様への最適な提案ができるよう尽力していきます。",
          ],
        },
        image: m("events-makro-1.jpg"),
        imageFirst: false,
      },
      {
        heading: { en: "Supporting For Japanese Food Business To Expand Into Cambodia", ja: "飲食企業様のカンボジア進出支援" },
        text: {
          en: [
            "We will support and encourage the food business players in Japan to enter the Cambodian market, where growth is accelerating. Utilizing our knowledge so far, we will provide a wide range of support to provide the information from the perspective of restaurants as a food wholesaler.",
            "The prosperity of our customers is the prosperity of our company. So that we can start our journey as a partner of the same ship from the beginning. We would like to form partnerships with restaurants both domestically and internationally. If you have any interest, please feel free to contact us for any inquiries.",
          ],
          ja: [
            "成長の加速するカンボジア市場へ進出される飲食店様へ、進出段階からのサポートも強化していきます。とはいえ、当事業は進出支援が生業ではありません。これまでの知見を活かし、食品卸事業者としての飲食店様目線での情報のご提供を主軸に幅広いお手伝いをさせて頂きます。",
            "お客様の繁栄こそが当社の繁栄です。進出段階から、同じ船のパートナーとしての歩みをはじめられるよう、サポート体制を強化して参ります。",
          ],
        },
        image: m("g.jpg"),
        imageFirst: true,
      },
    ],
  },
} as const;

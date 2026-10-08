// CEO Message page copy (EN + TranslatePress JA from the live site).
export const CEO = {
  title: { en: "CEO Message", ja: "CEO Message" },
  quote: {
    en: "” Bringing wisdom and experiences acquired in Japan and surrounded nations to Cambodia. “",
    ja: "“日本や周辺国が積み上げてきた知識と経験をカンボジアの現場に。”",
  },
  message: {
    en: [
      "“Creating people, things, and ideas from Cambodia”, this is S.E.A.T.S Inc.’s imperative responsibility.",
      "Bringing wisdom and experiences acquired in Japan and surrounded nations to Cambodia. We make full use of Cambodia’s strength, maximize the on-site productivity, and produce “power” from Cambodia that can compete in the world.",
      "S.E.A.T.S Inc. believes that doing business on a real-site is everything. We continuously push forward the grounded businesses, and by that, we aspire to meet imperative responsibilities.",
    ],
    ja: [
      "「カンボジアから世界で勝負できるヒト・モノ・コトを創り出す」、これがS.E.A.T.S Inc.の果たすべき役割です。",
      "日本や先進国が積み上げてきた知識と経験をカンボジアの現場に。カンボジアの強みを最大限に活かして、生産性を高め続ける。そしてカンボジアから、世界で戦える”力”を生み出していく。",
      "事業は、リアルな現場で実現できることが全てだと考えています。S.E.A.T.S Inc.は地に足のついたリアルビジネスを愚直に推し進めることで、果たすべき役割の実現に全力で取り組んで参ります。",
    ],
  },
  signature: {
    role: "Director & CEO",
    name: { en: "Kosuke Mineshima", ja: "峯島 浩輔" },
  },
  photo: { src: "/media/2025/01/ceo-1.jpeg", width: 720, height: 720 },
  profile: {
    title: { en: "Profile", ja: "プロフィール" },
    name: { en: "Kosuke Mineshima", ja: "峯島 浩輔" },
    role: "S.E.A.T.S Inc. Director & CEO",
    paragraphs: {
      en: [
        "Born in Shizuoka Prefecture in 1988. He graduated from Rikkyo University in Tokyo. Experiences of backpackers and internships in Shanghai during his time at the university sparked his interest in Asia’s growing market. Soon after graduating from the university, he joined Mitsubishi Electric Corporation and became in charge of FA (factory automation) machine’s marketer. Here, he mainly engaged in the business expansion in Taiwan, India, and Singapore.",
        "In 2014, at the age of 26, he moved to Cambodia and started a business at S.E.A.T.S Inc.",
        "In 2018, he returned to and moved the main base to Japan and worked at Recruit Lifestyle Co., Ltd as his second job. Here, he engaged in pioneering a new major client market for payment services in the Business Development Sector.",
        "In 2019, he returned to and moved the main base to Cambodia again and is currently serving as the CEO.",
      ],
      ja: [
        "1988年、静岡県沼津市生まれ。立教大学卒。学生時代は十数カ国へのバックパッカー旅行の経験や、上海での長期インターンなどを通じて、成長市場のアジアでのビジネスを志向する。また、キャリア支援の学生団体を設立し、個々人の価値観を尊重するキャリア形成に興味を持つ。 2011年、三菱電機(株)に新卒入社。FA（ファクトリーオートメーション）機器のアジアエリアマーケティングを担当。1年目にタイでの長期出張を経験し事業部表彰を受ける。主に、台湾、インド、シンガポールエリアを担当し、拡販活動に従事。",
        "2014年、26歳でカンボジアへ移住し、現S.E.A.T.S Inc.にてDirector & COO就任。食品輸入卸事業、農業生産開発事業、等を立ち上げる。",
        "2018年、拠点を日本へ移し、複業で(株)リクルートライフスタイルに入社。ビジネス開発組織にてペイメントサービスの大手クライアント開拓に従事。",
        "2019年、再度拠点をカンボジアへ移し、現職に就任。",
      ],
    },
  },
  links: {
    x: "https://twitter.com/seatscoo",
    note: { href: "https://note.com/mine_blog", img: "/media/2025/01/note-2-1.png", width: 400, height: 74 },
    // Live link has a stray "%20" (facebook.com/%20seatsinccambodia) which 404s — fixed here
    facebook: { label: "Facebook Page", text: "https://www.facebook.com/ seatsinccambodia", href: "https://www.facebook.com/seatsinccambodia" },
    telegram: { label: "Telegram Channel", text: "https://t.me/seatsincrecruit", href: "https://t.me/seatsincrecruit" },
  },
  interviews: {
    href: "https://www.youtube.com/@seatsinc5038/videos",
    images: [
      { src: "/media/2025/01/ceo-interview-2.jpg", alt: "ceo-interview-2.jpg" },
      { src: "/media/2025/01/ceo-interview-1.jpg", alt: "ceo-interview-1.jpg" },
      { src: "/media/2025/01/ceo-interviews-8.jpg", alt: "ceo-interviews-8.jpg" },
    ],
  },
} as const;

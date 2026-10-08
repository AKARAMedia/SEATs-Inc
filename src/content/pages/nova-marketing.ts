// NOVA Marketing page copy (EN + TranslatePress JA from the live site).
const card = (src: string, en: string, ja: string, textEn: string, textJa: string) => ({
  src,
  caption: { en, ja },
  text: { en: textEn, ja: textJa },
});

export const NOVA = {
  title: { en: "NOVA Marketing", ja: "NOVA Marketing" },
  hero: { bg: "/media/2025/08/nova_banner-scaled.jpg", line1: "NOVA", line2: "MARKETING" },
  overview: {
    heading: { en: "Business Overview", ja: "概要" },
    intro: {
      en: "NOVA Marketing was launched in May 2022 as a new business initiative under S.E.A.T.S Inc., focusing on digital marketing. We currently operate three main services:",
      ja: "NOVA Marketingは、2022年5月にデジタルマーケティング事業を軸にS.E.A.T.S Inc.の新事業としてスタートしました。現在は以下の3つのサービスを主に展開しています。",
    },
    bullets: {
      en: [
        "・The E-commerce business selling food and beverages imported from Japan to general consumers",
        "・The E-commerce business offering Japanese-made baby products",
        "・Media production and support for planning and executing marketing strategies",
      ],
      ja: [
        "・日本から輸入した食品・飲料を一般消費者向けに販売するEC事業",
        "・日本製ベビー用品を取り扱うEC事業",
        "・メディア制作とマーケティング戦略の企画・実行支援事業",
      ],
    },
    outro: {
      en: "Through a wide range of services such as digital marketing, promotions, media production, and web development, we provide comprehensive support for brands to grow their online presence. With a wealth of experience and a team of experts, we are committed to delivering strategies that drive tangible results.",
      ja: "デジタルマーケティング、プロモーション、メディア制作、Web開発など、幅広いサービスを通じてブランドのオンライン展開を総合的にサポートしています。豊富な実績と専門チームにより、成果につながる戦略を提供することを使命としています。",
    },
    image: "/media/2025/01/startup-business-teamwork-meeting-concept_1421-194.jpg",
  },
  strength: {
    // JA heading on live is "提供サービス" (TranslatePress entry) — kept as-is
    heading: { en: "Our Strength", ja: "提供サービス" },
    cards: [
      card(
        "/media/2026/09/Expertise-in-Food-Marketing.jpg",
        "Expertise in Food Marketing",
        "食品マーケティングの専門性",
        "NOVA Marketing operates two food-focused brands, primarily through online channels. We import high-quality products from Japan and promote them using marketing methods tailored to the local market. By maintaining strong relationships with trusted suppliers and designing strategies that deeply understand consumer needs, we enhance brand value and drive sales growth.",
        "NOVA Marketingは、食品分野に特化した2つのブランドをオンラインをメインに展開しています。日本から高品質な製品を輸入し、現地市場に適したマーケティング手法で展開。信頼できる仕入先との強固な関係性と、消費者ニーズを深く理解した戦略設計により、ブランド価値の向上と売上拡大を実現しています。",
      ),
      card(
        "/media/2025/07/Creative-Production-Strategic-Planning.jpg",
        "Creative Production & Strategic Planning",
        "クリエイティブ制作と戦略立案",
        "At Akara Media, we produce engaging digital content such as videos, graphics, and social media posts. Through media strategies based on each brand’s message and goals, we support sustainable brand growth.",
        "Akara Mediaでは、動画やグラフィック、SNS投稿などの魅力的なデジタルコンテンツ制作を手がけています。ブランドのメッセージと目標に基づいたメディア戦略を通じて、継続的なブランド成長を支援します。",
      ),
      card(
        "/media/2025/07/20943566.jpg",
        "Specialized Teamwork",
        "専門性の高いチームワーク",
        "Our greatest strength lies in our collaborative team structure, bringing together experts from various fields. By combining specialized knowledge in digital marketing, content creation, media production, and web development, we offer comprehensive marketing solutions tailored to each client’s needs.",
        "当社の最大の強みは、多彩な分野の専門家が連携するチーム体制にあります。デジタルマーケティング、コンテンツ制作、メディアプロダクション、Web開発などの専門知識を活かし、クライアントごとに最適化された包括的なマーケティングソリューションを提供しています。",
      ),
    ],
  },
  services: {
    heading: { en: "Our Services", ja: "事業内容" },
    intro: {
      en: "At Nova Marketing, we offer unique products and services that help your business grow and succeed in the digital world.",
      ja: "ビジネスの成長とデジタル分野での成功を支援するユニークなサービスを提供しています。",
    },
    cards: [
      card(
        "/media/2025/01/marketing-ideas-scaled-1.jpg",
        "Digital Marketing and Promotion",
        "デジタルマーケティングとプロモーション",
        "We design data-driven strategies to effectively reach the right target audience. Our services span a variety of channels, including Facebook, Instagram, and Google, covering SEO, social media management, PPC advertising, personalized email campaigns, and more.",
        "データに基づいた計画設計により、適切なターゲット層へ効果的にアプローチ。Facebook、Instagram、Googleなどを活用し、SEO対策、SNS運用、PPC広告、パーソナライズドメール配信など、多岐にわたるサービスを展開しています。",
      ),
      card(
        "/media/2025/01/media_creation-scaled-1.jpg",
        "Media Creation",
        "メディア制作",
        "We produce high-quality videos, photos, and graphics that align with each brand’s image. Utilizing the latest tools for design, video production, and animation, we create visually compelling brand expressions.",
        "ブランドイメージに合った高品質な動画、写真、グラフィックを制作。最新ツールを用いたデザイン、動画撮影、アニメーションにより、視覚的に印象的なブランド表現を実現します。",
      ),
      card(
        "/media/2025/01/web_creation-scaled-1.jpg",
        "Web Creation",
        "Web制作",
        "We develop mobile-friendly, secure, and scalable websites. From custom design and e-commerce site development to WordPress builds and ongoing support, we offer end-to-end solutions.",
        "モバイルフレンドリーかつ安全で拡張性のあるWebサイトを制作。カスタムデザイン、ECサイト開発、WordPress構築、サポートまで一貫して対応します。",
      ),
      card(
        "/media/2025/01/administrative_support-scaled-1.jpg",
        "Business Management Support",
        "ビジネス管理支援",
        "We also provide management services that support workflow optimization, including project management, scheduling, document organization, and client communications.",
        "プロジェクト管理、スケジュール管理、ドキュメント整理、クライアント対応など、業務の効率化をサポートする管理サービスも提供しています。",
      ),
    ],
  },
  getInTouch: { en: "GET IN TOUCH WITH US", ja: "お気軽にお問い合わせください" },
  solution: {
    heading: { en: "Best Solution Provider", ja: "最適なソリューションを提供" },
    text: {
      en: [
        "We deliver optimal solutions to help businesses grow online. From digital marketing and media production to web development and business management support, we tailor strategies to each client’s unique needs.",
        "With a goal of strengthening businesses and achieving measurable results using cutting-edge tools, our experienced team is here to support your success in the digital space.",
      ],
      ja: [
        "ビジネスのオンラインでの成長を支援するために、ベストなソリューションを提供します。デジタルマーケティング、メディア制作、ウェブ開発、ビジネス管理支援など、ニーズに合わせてパーソナライズした戦略を提供。",
        "ビジネスを強化し最先端のツールを使用して確実に結果を出すことを目標に、経験豊富なチームがデジタルの世界での成功をお手伝いします。",
      ],
    },
    images: [
      "/media/2025/01/startup-business-teamwork-meeting-concept_1421-194.jpg",
      "/media/2025/01/desktop-table-office_53876-42947.jpg",
      "/media/2025/01/graph1.jpg",
    ],
  },
  vision: {
    heading: { en: "Our Vision and Goals", ja: "私たちの目標と展望" },
    intro: {
      en: "NOVA Marketing is committed to supporting our clients’ success through innovative approaches.",
      ja: "NOVA Marketingは、革新的な手法でお客様のビジネス成功をサポートし続けます。",
    },
    cards: [
      card(
        "/media/2025/01/graphic-investment-stock-market-data-analysis-business_53876-167114.jpg",
        "Utilizing New Technologies",
        "新技術の活用",
        "We leverage advanced technologies such as AI, automation, and data analytics to build more precise marketing strategies, enabling us to reach the target audience at the right time and in the right way.",
        "AI、自動化、データ分析などの先進技術を活用し、より精度の高いマーケティング戦略を構築。最適なタイミングと方法でターゲットにアプローチします。",
      ),
      card(
        "/media/2025/01/workplace-business-modern-male-accessories-laptop-white_155003-1722.jpg",
        "Service Expansion",
        "サービスの拡充",
        // Live copy ends in a stray "z" ("solutions.z") — typo dropped
        "We stay ahead of market trends and continuously expand our service offerings. By evolving constantly, we provide increasingly high-quality solutions.",
        "市場のトレンドを常に把握し、サービス領域を拡大。常に進化し続けることで、より質の高いソリューションを提供していきます。",
      ),
      card(
        "/media/2025/01/close-up-workers-analyzing-statistical-data_1098-2075.jpg",
        "Commitment to Client Success",
        "お客様の成功へコミット",
        "We prioritize client success above all, offering practical, results-driven strategies that lead to increased online visibility and improved sales.",
        "お客様の成果を最優先に考え、オンラインでの認知拡大や売上向上に直結する、実践的で成果重視の戦略を提供します。",
      ),
      card(
        "/media/2025/01/global-leader.jpg",
        "Towards Global Leadership",
        "グローバルリーダーを目指して",
        "We strive to become a global leader in digital marketing by continuously providing innovative and reliable solutions.",
        "私たちは、デジタルマーケティング分野におけるグローバルなリーダーとして、革新的で信頼性の高いソリューションを提供し続けます。",
      ),
    ],
    outro: {
      en: [
        "By utilizing the latest tools and strategies, we help clients achieve their goals, drive innovation, and remain committed to delivering outstanding business results through continued growth.",
        "We drive your marketing activity by S.E.A.T.S Group in Cambodia.",
      ],
      ja: [
        "最新のツールや戦略を活用し、お客様の目標達成とイノベーションの推進を支援するとともに、継続的な成長を通じて卓越したビジネスの成果をもたらすことに尽力します。",
        "カンボジアのS.E.A.T.S グループが、お客様のマーケティング活動をサポートいたします。",
      ],
    },
  },
  banner: { src: "/media/2025/08/Your-paragraph-text.jpg", width: 930, height: 180, href: "https://sherpagent.com/EN", alt: "Sherpa Agent" },
} as const;

// Philosophy & Our Value — exact live copy (EN + JA via TranslatePress).
import type { L } from "@/content/site";

export type ValueItem = { title: L; body: { en: string[]; ja: string[] } };

export const VALUES_TITLE: L = { en: "OUR VALUES", ja: "行動指針" };

export const VALUES_INTRO: L = { en: "We Uphold 12 Action Guidelines As Core Values That All Members Of S.E.A.T.S Inc. Recognize In Common. In Order To Produce Solid Output In An Environment Where Members Of Multiple Nationalities Cooperate, We Clarify Decisions And Behavioral Standards That Are Considered Appropriate. We Believe That Each Member Realizing These Action Guidelines With Higher Standards Will Be The Driving Force In Increasing The Corporation’s Productivity As A Whole.", ja: "S.E.A.T.S Inc.のメンバーが共通して保有する重要な価値観として、12の行動指針を掲げています。複数の国籍のメンバーが協同する環境では、判断基準や正しさの価値観が大切です。一人ひとりがより高い基準でこれらの行動指針を実現することで、組織としての生産性を高めています。" };

/**
 * Updated to the "Action Policy 2025" revision (12 items, reordered; 5 brand-new,
 * 2 reworded, 5 carried over unchanged). Source: internal slide with English titles only.
 * JA copy for the new/updated items (marked DRAFT below) is a first-pass translation
 * and should be reviewed by a native speaker before publishing — unlike the rest of
 * this file, it is not yet "exact live copy" verified against TranslatePress.
 */

/** Two accordion columns of six guidelines each */
export const VALUES: [ValueItem[], ValueItem[]] = [
  [
    {
      title: { en: "1 Think of purpose", ja: "1. 目的を考える" },
      body: {
        en: ["When taking an action, you need to think of the meaning and the purpose of that.","Without the consciousness of what are the purposes we have set before taking action, some people just end up doing something unclearly and would be thinking the action is the purpose.However, you can prevent that by always being aware of what the purpose or meaning is.","This is a basic understanding of all activities not only for when you request someone to do something but also for when you are requested to do something as well.","In order to achieve the goals at a high standard of quality in an organization in which all members are independently working, it requires them to clearly understand the purpose."],
        ja: ["何かアクションをする時、そのアクションに何の意味があるのか、何の意図があるのかを把握します。","アクションの開始時、途中での振り返りに、本来の目的を常に意識することで手段の目的化を防ぎます。","これは全ての行動の基本であり、仕事を依頼する側、受ける側の両者が常に確認することです。","個々人が自走する組織においては、全ての担当者が目的を理解し、目的をより高水準で果たすために自ら業務を創り出すことが求められます。"],
      },
    },
    {
      title: { en: "2 Cause and Effect", ja: "2. 原因と結果" },
      body: {
        en: ["All results come with at least one cause. Thinking from all the results in the past, not only the good ones but also the bad ones, why it becomes like that, and figure out what the causes are, you could apply this knowledge to other opportunities to step up to success.","We will not say that business will not rely on luck, but in our opinion, the achievement after encountering good luck is all the efforts of accumulating all possible causes correctly through our daily activities and continuing to improve."],
        ja: ["全ての結果には必ず原因があります。結果にこだわるためにも、良い結果を出すための原因をつくることにこだわります。過去の良い結果も悪かった結果も、なぜそうなったのかを考え、成功要因を探ることで、別の機会にそれを再現できるからです。","ビジネスは運に頼る要素がないとは言えません。しかしながら、良き運を巡らせるためには、考えうる正しい原因を日々の行動で積み上げて、改善し続ける努力の先にあるものと考えています。"],
      },
    },
    {
      // NEW — drafted from scratch, no prior copy to carry over
      title: { en: "3 Quantity breeds Quality", ja: "3. 量が質を生む（DRAFT）" },
      body: {
        en: ["Before you can produce great output, you need enough volume of attempts to learn from. Waiting to produce the single perfect version before starting wastes time that could be spent learning through repetition.","By generating ideas, drafts, or actions quickly and in quantity, you create more chances to discover what actually works, and quality rises naturally as a result of that repetition.","This does not mean sacrificing care for speed — it means trusting that the fastest route to a high-quality result runs through enough reps, not through waiting for the perfect first try."],
        ja: ["優れたアウトプットを生み出すには、まず学びの材料となる十分な「量」のトライが必要です。最初から完璧な一つの正解を出そうと待っていると、繰り返しの中でしか得られない学びの時間を失います。","アイデアや下書き、アクションを素早く、かつ数多く生み出すことで、何が実際にうまくいくのかを発見する機会が増え、その繰り返しの結果として質は自然と高まっていきます。","これはスピードのために丁寧さを犠牲にするという意味ではありません。高い質に至る一番の近道は、完璧な一回を待つことではなく、十分な回数を重ねることだと信じることです。"],
      },
    },
    {
      // UPDATED — reworded from the former "3 Collect information and Connect information"
      title: { en: "4 Collect & Connect Information for Value", ja: "4. 情報を集めて繋げ、価値を生む（DRAFT）" },
      body: {
        en: ["When we started this business, something called “Value” did not exist at all. Creating this “Value” from nothing, we started by collecting information.","Even in an age when almost any information can be found online, the value of information gathered directly — through an actual visit to a client or a site — never diminishes.","What matters most is connecting these pieces of information together. A single fact is rarely useful on its own; value is created in the act of linking facts to form insight for our stakeholders."],
        ja: ["私たちが事業を開始したとき、バリューと呼べるものは何もありませんでした。何もないところから価値を創るために「情報収集」から始めたのです。","ネットであらゆる情報に触れられるようになった時代にも、実際に足を運んで得る一次情報（collect）の価値は普遍です。","最も大切なのは、それらの情報を繋ぎ合わせる（connect）ことです。単独の事実だけでは価値を生みません。事実と事実を繋げることで、初めてステークホルダーにとっての価値が生まれます。"],
      },
    },
    {
      // UPDATED — reworded from the former "5 Maximize performance, Minimize cost"
      title: { en: "5 Maximize Performance by Optimizing Resources", ja: "5. リソースを最適化し、パフォーマンスを最大化する（DRAFT）" },
      body: {
        en: ["Productivity is measured by dividing the outcome (output) by the resources you put in (input). To maximize productivity, you need to input the right amount and the right mix of resources to pull out the maximum possible outcome — not simply more resources.","We believe it is essential for each individual to objectively understand and manage how they allocate their time, budget, and skill, so that every resource is working toward the highest possible return.","Optimizing resources, rather than simply spending more of them, is what allows performance to scale sustainably across the organization."],
        ja: ["生産性は、成果（アウトプット）を投入資源（インプット）で割ることで測られます。生産性を最大化するには、単純に資源を増やすのではなく、最大の成果を引き出すために適した量と組み合わせの資源を投入することが必要です。","個々人が自分の持つ資源（時間、予算、スキル）をどのように配分して投下するかを客観的に把握し管理することが重要だと考えています。","資源を増やすことではなく最適化することこそが、組織全体でパフォーマンスを持続的に高めていく鍵です。"],
      },
    },
    {
      // NEW — drafted from scratch, no prior copy to carry over
      title: { en: "6 Ask Until Understood", ja: "6. 理解するまで問う（DRAFT）" },
      body: {
        en: ["Pretending to understand an instruction, a client's request, or a colleague's explanation just to avoid looking slow almost always costs more time later than asking a clarifying question up front.","If something is unclear, ask again — and if needed, ask a third time — until you can explain it back in your own words. This is especially important in a multinational team, where language and cultural context can easily hide a misunderstanding.","A short pause to confirm understanding is never wasted time; it is the fastest way to make sure the work that follows is built on a correct foundation."],
        ja: ["遅れていると思われたくないからと、指示や依頼、説明を理解したふりをすることは、後になって確認するよりも大きな時間のロスにつながります。","分からないことがあれば、自分の言葉で説明できるようになるまで、何度でも聞き直してください。特に多国籍のチームでは、言語や文化の違いが誤解を隠してしまうことがあるため、これは一層重要です。","理解を確認するための短い立ち止まりは、決して無駄な時間ではありません。それこそが、その後の作業を正しい土台の上に築くための最短の方法です。"],
      },
    },
  ],
  [
    {
      // NEW — drafted from scratch, no prior copy to carry over
      title: { en: "7 Act Before Objection", ja: "7. 反対される前に行動する（DRAFT）" },
      body: {
        en: ["When you see a problem, a risk, or an opportunity, raise it and act on it before someone else has to point it out to you. Waiting to be told, or waiting until an objection is raised against you, means you have already lost the initiative.","This does not mean acting recklessly — it means thinking ahead, anticipating what a reviewer, client, or teammate would object to, and addressing it in advance.","People who consistently act before objection are the ones who are trusted with bigger responsibility, because they can be relied on to move a situation forward without needing to be pushed."],
        ja: ["問題やリスク、あるいは機会に気づいたら、誰かに指摘される前に、自ら声を上げて行動してください。指示を待つこと、あるいは反対意見を受けてから動くことは、すでに主導権を失っていることを意味します。","これは無謀に行動することを意味するのではありません。レビュアーや顧客、チームメンバーがどこに異議を唱えるかを先回りして考え、事前に対応しておくということです。","反対される前に行動し続けられる人こそが、より大きな責任を任される人材です。誰かに動かされるのを待たずに物事を前に進められると信頼されるからです。"],
      },
    },
    {
      // NEW — drafted from scratch, no prior copy to carry over
      title: { en: "8 Ask AI First", ja: "8. まずAIに聞く（DRAFT）" },
      body: {
        en: ["Before spending time struggling alone with a drafting task, a translation, a piece of code, or a first analysis, bring it to AI first. In most cases, AI can produce a usable first draft, catch an obvious mistake, or surface an angle you had not considered, in a fraction of the time it would take to start from a blank page.","Using AI first is not a shortcut that replaces thinking — it is a way to spend your own time and judgment on the parts of the work that genuinely need a human decision, instead of on the parts that do not.","The goal is the same as the old \"Just google it\" guideline: do not waste effort reinventing something that a tool can already help you produce faster."],
        ja: ["下書きや翻訳、コード、最初の分析などに一人で長く悩む前に、まずAIに相談してください。多くの場合、AIは使えるたたき台を作ったり、明らかなミスを見つけたり、自分では気づかなかった視点を示してくれたりします。白紙から始めるよりもはるかに短い時間で済みます。","AIをまず使うことは、思考を放棄することではありません。人間の判断が本当に必要な部分に自分の時間と判断力を使うために、そうでない部分をAIに任せるということです。","以前の「グーグルで調べるだけ」と目的は同じです。ツールがすでに速く生み出せるものを、わざわざゼロから作り直す労力を使わないということです。"],
      },
    },
    {
      // NEW — drafted from scratch, no prior copy to carry over
      title: { en: "9 FOQ – Fact, Opinion, Question", ja: "9. FOQ – 事実・意見・質問（DRAFT）" },
      body: {
        en: ["Much of the confusion in daily communication comes from mixing together three very different things — a Fact, an Opinion, and a Question — without making clear which one you are stating.","Before you speak or write, decide which of the three you are communicating, and say so plainly: “This is a fact,” “This is my opinion,” or “This is a question I need answered.” This lets the listener respond in the right way immediately, instead of guessing what kind of response you are looking for.","By separating Fact, Opinion, and Question, we keep discussions efficient, reduce misunderstanding, and make sure that opinions are not mistaken for facts, or questions are not mistaken for conclusions."],
        ja: ["日々のコミュニケーションにおける混乱の多くは、「事実（Fact）」「意見（Opinion）」「質問（Question）」という全く異なる3つのものを、区別せずに話してしまうことから生まれます。","話す、あるいは書く前に、自分が伝えようとしているのがこの3つのうちどれなのかを決め、「これは事実です」「これは私の意見です」「これは確認したい質問です」とはっきり伝えてください。これにより、聞き手はどう反応すべきかをすぐに判断できます。","事実・意見・質問を区別することで、議論は効率的になり、誤解が減り、意見が事実と誤解されたり、質問が結論と誤解されたりすることを防げます。"],
      },
    },
    {
      // Unchanged content, reordered from the former "12 Bad information first"
      title: { en: "10 Bad information first", ja: "10. 最初に悪い情報" },
      body: {
        en: ["Unexpected accidents or problems are inherent to business. As one company, taking action to deal immediately is greatly important when those happen.","It is probably difficult to reveal that it happened because of your mistake or failure, but you must follow this guideline and put the highest priority on reporting that.","Those kinds of things are completely not desirable occurrences, but we believe that a person who can take a quick and proper measure to solve when it happens is the one who should get a warm applause."],
        ja: ["ビジネスに思わぬアクシデントや問題はつきものです。それらが発生したときに、会社として最も重要なことは即座に対策を取ることです。","自身のミスや失敗で起きたことはなかなか言いづらいかもしれませんが、その時こそこの指針に則り最優先に報告するべきです。","発生したこと自体は望ましいことではないものの、大事になる前に、一刻も早く対策を打つために行動できたこと自体は称賛されるべきことだと考えています。"],
      },
    },
    {
      // Unchanged content, reordered from the former "9 Telling, Writing, Repeating and Checking"
      title: { en: "11 Telling, Writing, Repeating and Checking", ja: "11. 話す、書く、繰り返し、確認する" },
      body: {
        en: ["“Misunderstanding is unavoidable in most communication”, is our basic understanding. It is impossible that people can totally express themselves or understand one’s opinion or feeling by just using the words in any language.","Communication is a tool that people use to do such things, so misunderstanding certainly occurs.","Especially for people who have different cultural backgrounds and try to communicate in their non-native languages.","Based on this premise, the expectation that people will just understand right away when we are just saying once is so foolish.","However, by just repeating the process of “Telling”, “Writing”, “Repeating”, and “Checking”, the abstract things that we want to express ourselves or other people to understand, will become clearer and more concrete."],
        ja: ["「誤解のない会話はありえない」。これが私たちの基本理解です。言語という曖昧な記号を用いて私見や感情を伝達する過程で、一言一句の意味理解が100%同じであることはあり得ません。","会話はそうした理解の異なる言語の積み重ねで構築されていることから、誤解は必ず生まれます。","文化的背景の異なる人同士が、母国語でない言葉で会話するならば尚更です。","その前提に立つならば、一度言っただだけで相手に伝わる（＝行動される）と期待することは愚かです。","「言って、書いて、繰り返して、確認する」。この作業の繰り返しの過程で、伝えたい内容の輪郭が徐々にクリアになっていくイメージです。"],
      },
    },
    {
      // Unchanged content, reordered from the former "10 Today's 20% is much better than tomorrow's 80%"
      title: { en: "12 Today's 20% is much better than tomorrow's 80%", ja: "12. 今日の20％が明日の80％よりもずっと良いです" },
      body: {
        en: ["It is such a miracle that you can accomplish all the tasks you are asked to do in a correct way, by just trying to do the output at once. After being assigned, it is better to take a trial action, and primarily clarify when it is 20% completed.","In most cases, enormous time loss caused by doing it over again just happens when you try to complete the task until 80% before confirming, and the understanding gap with the person who ordered you occurs.","Here, we will understand clearly the expectation or purpose of the one who ordered us and confirm not only at the first time but on halfway also in order to be able to correct the pathway immediately if we step out of that.","If we just spare no effort, everything will follow the expectation and it will lead to a desirable success which can be obtained in time."],
        ja: ["依頼された大小のタスクを完遂させるのに、たった一度のアウトプットで実現できることは奇跡です。請け負ったら一度アクションしてみて、完成度20%版のものを確認してみることが重要です。","時間をかけて80%まで仕上がったと思っても、気づかぬうちに依頼主とのズレが生じてしまい、やり直し=タイムロスが発生することがほとんどです。","依頼主の期待値を、最初だけでなく過程でも随時把握して、迅速に軌道修正を図ります。","その手間を惜しまないことが、結果的に期待値に沿い、期待値を超えるアウトプットを時間内に実現できることに繋がります。"],
      },
    },
  ],
];

export const PHILOSOPHY_TITLE: L = { en: "PHILOSOPHY", ja: "企業理念" };

export const PHILOSOPHY_HEADING: L = { en: "Creating People, Things, And Ideas From Cambodia To Compete In The World", ja: "カンボジアから世界で勝負できるヒト・モノ・コトを創り出す" };

export const PHILOSOPHY_TEXT: { en: string[]; ja: string[] } = {
  en: ["People Say That “The 19th Century Belongs To Europe, The 20th Century To The US, And The 21st Century To Asia.” Cambodia, One Of The Asian Countries That Went Through Several Historical Hardships, Is Now Experiencing Rapid Development Following Other Asian And Southeast Asian Nations. As With Other Developing Countries, Cambodia Still Lacks In Infrastructure And Education Provisions, Of Which Some May Feel A Huge Gap Relative To Those Of Developed Countries.","However, Because It Is Cambodia, We Create The Business. Not From Countries With Already-Productive Capitals, But From The Country With Big Potentials Of A Leap, We Create People, Ideas, And Services That Can Compete In The World. This Is The Mission We Propose, And By Achieving That, We Believe Can Contribute To Cambodia’s Economic Development.","To Achieve Such A Mission, Each Member In S.E.A.T.S Inc. As A Japanese Trading Corporation Strives To Maximize Productivity In Each Of The Following Three Business Domains:"],
  ja: ["“19世紀は欧州の時代”、”20世紀はアメリカの時代”、そして”21世紀はアジアの時代”だと言われます。中でもカンボジアは歴史的な事情も相まって、アジア/東南アジアの国々でも後発で今まさに発展途上にある国です。他の発展途上国と同様に、インフラが整備されていない点や教育が行き届いていない点など、先進国での生活に慣れているひとほど、その違いやギャップを感じることはあると思います。","しかし、だからこそ私たちは、この国で事業をすることに意味があると考えています。環境や資源に恵まれた先進国からではなく、後発であらゆるものが不足している環境からでも、世界で勝負できるヒト・モノ・サービスを創ること。これこそが私たちが取り組むべき大きなミッションであり、その実現を通じて、カンボジアという国の発展に貢献できると考えています。","\"カンボジアの日系商社として、 1.カンボジア国内への輸入・販売 2.カンボジア国内での生産・流通・販促 3.カンボジア国外への輸出・販路拡大 というそれぞれの事業領域にて、相互に連携して最大限に生産性を高めることでミッションを実現します。\""],
};

export const DOMAINS: { title: L; img: string; width: number; height: number }[] = [
  { title: { en: "1) Importing To Cambodia", ja: "1.輸入・販売" }, img: "/media/2025/01/Importing-To-Cambodia.png", width: 600, height: 400 },
  { title: { en: "2) Producing And Distributing Within Cambodia", ja: "2.生産・流通・販促" }, img: "/media/2025/01/Producing-And-Distributing.png", width: 600, height: 400 },
  { title: { en: "3) Exporting Outside Cambodia", ja: "3.輸出・販路拡大" }, img: "/media/2025/01/World-e1715837665524.png", width: 493, height: 306 },
];

export const PHILOSOPHY_CLOSING: L = { en: "We place values in always letting Cambodian members be proactive to create business enterprises from the ultimate base. During such a process, we also incorporate Japanese values in the pursuit of the greatest output. We clarify the mission in each business domain, share the S.E.A.T.S Inc.’s action policy to all stakeholders as a common value, and by that, we aim to bring about our responsibilities.", ja: "\"カンボジアメンバーが常に主体です。その中で、日系企業および日本人としての バリューを模索しながら、組織が一体となってアウトプットを高めていけるよう日々チャレンジしています。\"各事業におけるそれぞれのビジョンを明確に据え、行動指針をS.E.A.T.S Inc.の共通の価値としてステークホルダー全員に還元し、果たすべき役割の実現を目指します。" };

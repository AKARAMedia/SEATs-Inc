// Philosophy & Our Value — exact live copy (EN + JA via TranslatePress).
import type { L } from "@/content/site";

export type ValueItem = { title: L; body: { en: string[]; ja: string[] } };

export const VALUES_TITLE: L = { en: "OUR VALUES", ja: "行動指針" };

export const VALUES_INTRO: L = { en: "We Uphold 12 Action Guidelines As Core Values That All Members Of S.E.A.T.S Inc. Recognize In Common. In Order To Produce Solid Output In An Environment Where Members Of Multiple Nationalities Cooperate, We Clarify Decisions And Behavioral Standards That Are Considered Appropriate. We Believe That Each Member Realizing These Action Guidelines With Higher Standards Will Be The Driving Force In Increasing The Corporation’s Productivity As A Whole.", ja: "S.E.A.T.S Inc.のメンバーが共通して保有する重要な価値観として、12の行動指針を掲げています。複数の国籍のメンバーが協同する環境では、判断基準や正しさの価値観が大切です。一人ひとりがより高い基準でこれらの行動指針を実現することで、組織としての生産性を高めています。" };

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
      title: { en: "3 Collect information and Connect information", ja: "3. 情報収集と情報連結" },
      body: {
        en: ["When we started this business, something called “Value” did not exist at all. Creating this “Value” from the middle of nowhere, we started by collecting information.","Even in this age when almost all information could be found through the internet, the value of the information directly collected from the actual visit of clients would never diminish.","Therefore, connecting all these kinds of information to create a “Value” for stakeholders is what we are aiming at."],
        ja: ["私たちが事業を開始したとき、バリューと呼べるものは何もありませんでした。何もないところから価値を創るために「情報収集」から始めたのです。","ネットであらゆる情報に触れられるようになった時代にも、ネットに掲載されない足で稼いだ（collect）一次情報の価値は普遍です。","それらの一次情報を繋ぎ合わせて（connect）、ステークホルダーにとっての価値を生みだしていくことが私たちの事業の本質です。"],
      },
    },
    {
      title: { en: "4 Changes for the better", ja: "4. より良い変化" },
      body: {
        en: ["If you wish to obtain a better result, you must always make a change by yourself. It is very easy to keep following the familiar routine or habit which you get used to, however this kind of comfort situation will lead to an unexpected outcome where people and society are left behind the time and forgotten.","Because of this understanding, our basic stance is to take “Change” itself as a good thing, accept and put this in practise. Not only individuals, but also organizations, they are looking for a better “Change”."],
        ja: ["より良き状態を目指すならば、常に自ら変化していかなければなりません。慣れ親しんだ習慣や状態を維持するのは楽ですが、楽だけではヒトも会社もいずれ時代に取り残され淘汰されます。","その理解があるからこそ、「変化」そのものを良きことと捉え、変えることを当然のこととして受け入れ、実践していくことが基本スタンスです。個人も組織も常に「変化」を求めます。"],
      },
    },
    {
      title: { en: "5 Maximize performance, Minimize cost", ja: "5. パフォーマンスを最大化し、コストを最小限に抑える" },
      body: {
        en: ["Productivity is measured by dividing the outcome (output) by the input resource (input).","According to this, to maximize productivity, inputting the appropriate amount of resources that can pull out the maximum outcome, is required.","To us, we think that it is very important for individuals to objectively understand and manage how to allocate and input their resources (time, budget, and skill) to maximize their productivity."],
        ja: ["生産性は、成果（アウトプット）を投入資源（インプット）で割ることで測られます。","すなわち生産性を最大化するには、最大限の成果を出すための適した量の資源を投入することが必要です。","個々人が自己の生産性を最大化するために、自分のもつ資源（時間、予算、スキル）をどのように配分して投下するかを客観的に把握して管理することが重要だと考えています。"],
      },
    },
    {
      title: { en: "6 Understand, Act, Agree", ja: "6. 理解して行動し、同意する" },
      body: {
        en: ["This is a principle of all activities in an organization or a team. First of all, you have to “Understand” the purpose of what you have been told to do as the next action after it is precisely and sufficiently considered by the one who assigned that.","Then, you can “Act” towards the goal. Expressing the opinions regarding good/bad, right/wrong of the instruction, or how you will “Agree” or not, can be done after you take the action.","Here, a trap that you easily fall into when you think you have enough experience, is a state of being a person who just talks about nothing but the theories without any actions.","Those kinds of instructions conceal many intentions and meanings, and in almost all cases, these could be decoded and initially convinced when you just practice.","After understanding, you can start taking the action immediately to test the hypothesis, and how quickly you can start working on the correct process will directly link to the result.","We hopefully believe that this process will provide people self-development regardless of their ages since they could gain experience to know what they do not know."],
        ja: ["組織、チームにおいての行動原則です。健全で十分な検討の後にネクストアクションとして指示されたことについて、先ずは目的を「理解」する努力をします。","そしてその次にくるのは「行動」です。指示の良し悪しや「同意」の有無を主張するのは常に行動の後です。","経験値が上がるほどハマりやすい落とし穴は、\"頭でっかち\"になり「行動」が後回しになることです。","指示には意図があり、その意図は実践して初めて納得できることも多くあります。","理解の後は即行動して仮説を検証し、その後の修正プロセスにいかに早く着手できるかが成果に直結します。","その過程で自身が知らなかったことを知る経験（＝無知の知）をすることで、ヒトは何歳でも成長し続けられると考えています。"],
      },
    },
  ],
  [
    {
      title: { en: "7 Question, Advise, Information", ja: "7.質問、助言、情報" },
      body: {
        en: ["A main component at the workplace of a company is internal communication. If you take a look closely, 90% of these communications can be divided into “Question”, “Advice” and “ Information”.","Therefore, we consider communication which the purpose is clearly stated before starting, as our basic way to communicate.","This kind of method provides speakers and listeners many advantages. Speakers can certainly recognize their own purpose of the talk while listeners can adjust how to pay attention to the talk according to the purpose.","Moreover, it can reduce mishearing or re-asking, and facilitate communications in the company."],
        ja: ["仕事の構成要素の多くは\"社内コミュニケーション\"です。観察すると社内コミュニケーションの9割が「質問/主張」、「助言/相談」、「共有」に分類されます。","そこで、会話の冒頭に、これから話す内容がどれを目的とするかを宣言してから会話をすることを行動指針としています。","これは、話し手と聞き手の双方に利点があります。話し手は会話の目的を確かに認識できます。聞き手は、目的に合わせて傾聴度合いを調整できます。","聞き逃しや聞き直しが減り、社内コミュニケーションが円滑になります。"],
      },
    },
    {
      title: { en: "8 Imagination before action", ja: "8. 行動の前に想像する" },
      body: {
        en: ["Before taking an action, you need to imagine as much as possible of what is seemingly going to happen.","You also need to pay more attention to predict the possibility of how our team or clients will feel and react to our words and actions.","Even if we cannot accurately do that, we just can try first to roughly imagine that kind of situation. It will improve our imagination, and the quality of our actions will also increase once we can obtain the ability to precisely imagine.","As a result, we can prevent some problems beforehand and inspire someone as we have imagined."],
        ja: ["行動の前に、その行動の先で何が起こるのかをできる限り想像します。","自分の言動をチームや顧客がどのように受け取り、反応するのかの可能性をあらかじめ注意深く想定しておきます。","それができなくとも、先ずは想像しようとすること、そのことで能力は鍛えられていきます。先回りして考える癖をつけることで、行動の質が上がります。","その結果、問題を未然に防ぐことにつながったり、相手を自分の意図する方向に動かしたりすることができるようになります。"],
      },
    },
    {
      title: { en: "9 Telling, Writing, Repeating and Checking", ja: "9. 話す、書く、繰り返し、確認する" },
      body: {
        en: ["“Misunderstanding is unavoidable in most communication”, is our basic understanding. It is impossible that people can totally express themselves or understand one’s opinion or feeling by just using the words in any language.","Communication is a tool that people use to do such things, so misunderstanding certainly occurs.","Especially for people who have different cultural backgrounds and try to communicate in their non-native languages.","Based on this premise, the expectation that people will just understand right away when we are just saying once is so foolish.","However, by just repeating the process of “Telling”, “Writing”, “Repeating”, and “Checking”, the abstract things that we want to express ourselves or other people to understand, will become clearer and more concrete."],
        ja: ["「誤解のない会話はありえない」。これが私たちの基本理解です。言語という曖昧な記号を用いて私見や感情を伝達する過程で、一言一句の意味理解が100%同じであることはあり得ません。","会話はそうした理解の異なる言語の積み重ねで構築されていることから、誤解は必ず生まれます。","文化的背景の異なる人同士が、母国語でない言葉で会話するならば尚更です。","その前提に立つならば、一度言っただだけで相手に伝わる（＝行動される）と期待することは愚かです。","「言って、書いて、繰り返して、確認する」。この作業の繰り返しの過程で、伝えたい内容の輪郭が徐々にクリアになっていくイメージです。"],
      },
    },
    {
      title: { en: "10 Today's 20% is much better than tomorrow's 80%", ja: "10. 今日の20％が明日の80％よりもずっと良いです" },
      body: {
        en: ["It is such a miracle that you can accomplish all the tasks you are asked to do in a correct way, by just trying to do the output at once. After being assigned, it is better to take a trial action, and primarily clarify when it is 20% completed.","In most cases, enormous time loss caused by doing it over again just happens when you try to complete the task until 80% before confirming, and the understanding gap with the person who ordered you occurs.","Here, we will understand clearly the expectation or purpose of the one who ordered us and confirm not only at the first time but on halfway also in order to be able to correct the pathway immediately if we step out of that.","If we just spare no effort, everything will follow the expectation and it will lead to a desirable success which can be obtained in time."],
        ja: ["依頼された大小のタスクを完遂させるのに、たった一度のアウトプットで実現できることは奇跡です。請け負ったら一度アクションしてみて、完成度20%版のものを確認してみることが重要です。","時間をかけて80%まで仕上がったと思っても、気づかぬうちに依頼主とのズレが生じてしまい、やり直し=タイムロスが発生することがほとんどです。","依頼主の期待値を、最初だけでなく過程でも随時把握して、迅速に軌道修正を図ります。","その手間を惜しまないことが、結果的に期待値に沿い、期待値を超えるアウトプットを時間内に実現できることに繋がります。"],
      },
    },
    {
      title: { en: "11 Just google it!", ja: "11. グーグルで調べるだけ" },
      body: {
        en: ["When facing any problems, there are many far better ways other than just to worry and think that “this problem is ours”. Most of the problems we are facing have many answers or solutions which were found and left by great people or companies who faced similar problems.","Hence, when the problem happens, seeking for the same case which has already happened and defining what we do not know is something that should be done at first.","By doing that, we can realize and limit the things we have to do, and apply all our resources to that problem only. No need to take the time of other people with our unnecessary questions as well."],
        ja: ["問題に直面した時、「この問題は自分だけのものだ」と考えて悩みこむのは愚かです。自分の直面している問題の大半は、過去の偉大な人物や企業が既に似たような事例を経験していて、解を残してくれています。","問題に直面したら、先ずすべきはそうした事例に当たることであり、自分の「無知の知」を明らかにすることです。","そうすると、本当に自分が解くべき課題は限定されていると気づくとともに、その課題に自分のリソースを集中させることができます。不必要な質問をして同僚の貴重な時間を奪うこともありません。"],
      },
    },
    {
      title: { en: "12 Bad information first", ja: "12. 最初に悪い情報" },
      body: {
        en: ["Unexpected accidents or problems are inherent to business. As one company, taking action to deal immediately is greatly important when those happen.","It is probably difficult to reveal that it happened because of your mistake or failure, but you must follow this guideline and put the highest priority on reporting that.","Those kinds of things are completely not desirable occurrences, but we believe that a person who can take a quick and proper measure to solve when it happens is the one who should get a warm applause."],
        ja: ["ビジネスに思わぬアクシデントや問題はつきものです。それらが発生したときに、会社として最も重要なことは即座に対策を取ることです。","自身のミスや失敗で起きたことはなかなか言いづらいかもしれませんが、その時こそこの指針に則り最優先に報告するべきです。","発生したこと自体は望ましいことではないものの、大事になる前に、一刻も早く対策を打つために行動できたこと自体は称賛されるべきことだと考えています。"],
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

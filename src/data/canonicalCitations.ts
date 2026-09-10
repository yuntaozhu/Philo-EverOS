export interface GroundedSourceItem {
  id: string;
  type: "everos_consensus" | "canonical_work" | "translation_lineage" | "concept_anchor";
  term: string;
  matchedAliases: string[];
  title: string;
  locator: string;
  author?: string;
  originalQuote: string;
  originalLang?: string;
  standardTranslation?: string;
  translationEdition?: string;
  consensusAffirmation?: string;
  antiDriftWarning?: string;
  academicNotes?: string;
}

export const CANONICAL_CITATIONS: GroundedSourceItem[] = [
  // --- 康德 (Immanuel Kant) ---
  {
    id: "canon-kant-krw-b25",
    type: "canonical_work",
    term: "先验",
    matchedAliases: [
      "先验",
      "Transzendental",
      "Transcendental",
      "先验认识",
      "先验哲学",
      "先验主体性",
      "先验感性论",
      "先验分析论"
    ],
    title: "《纯粹理性批判》(Kritik der reinen Vernunft)",
    locator: "B25 / A11 (导言第七节：先验哲学之理念)",
    author: "伊曼努尔·康德 (Immanuel Kant)",
    originalQuote: "Ich nenne alle Erkenntnis transzendental, die sich nicht sowohl mit Gegenständen, sondern mit unserer Erkenntnisart von Gegenständen, sofern diese a priori möglich sein soll, überhaupt beschäftigt.",
    originalLang: "德文 (Deutsch) 原典",
    standardTranslation: "我把一切不是关涉于对象，而是关涉于我们关于对象、就其应当是先天可能的而言的认识方式的认识，都称为先验的。",
    translationEdition: "邓晓芒 译 / 杨祖陶 校 (人民出版社)",
    antiDriftWarning: "【本体论/认识论防漂移警示】：严禁将先验（Transcendental，使一切经验成为可能的形式条件）与超验（Transcendent，超出一切经验可能界的彼岸事物）混同；严禁将先验误解为心理学先入之见。",
    academicNotes: "奠定批判哲学的哥白尼式革命，由‘对象符合认识’转为‘对象必须符合主体的认识形式’。"
  },
  {
    id: "canon-kant-krw-a51",
    type: "canonical_work",
    term: "直观与概念",
    matchedAliases: [
      "思想无内容则空",
      "直观无概念则盲",
      "直观与概念",
      "感性与知性",
      "Anschauungen ohne Begriffe",
      "Gedanken ohne Inhalt"
    ],
    title: "《纯粹理性批判》(Kritik der reinen Vernunft)",
    locator: "A51 / B75 (先验逻辑导言)",
    author: "伊曼努尔·康德 (Immanuel Kant)",
    originalQuote: "Gedanken ohne Inhalt sind leer, Anschauungen ohne Begriffe sind blind. Daher ist es ebenso notwendig, seine Begriffe sinnlich zu machen, als, seine Anschauungen sich verständlich zu machen.",
    originalLang: "德文 (Deutsch) 原典",
    standardTranslation: "没有内容的思想是空的，没有概念的直观是盲的。因此，把自己的概念感性化（即给它们加上直观中的对象），与把自己的直观理知化（即把它们置于概念之下），乃是同样必要的。",
    translationEdition: "邓晓芒 译 / 杨祖陶 校 (人民出版社)",
    antiDriftWarning: "拒绝莱布尼茨式的唯知性论与洛克式的唯经验论，揭示知性（概念）与感性（直观）不可互相还原之二元统一。",
    academicNotes: "形式认识论推论的核心判据：任何脱离感性直观所与的纯概念推演均无法形成经验知识。"
  },
  {
    id: "canon-kant-krw-b132",
    type: "canonical_work",
    term: "先验统觉",
    matchedAliases: [
      "先验统觉",
      "统觉的综合统一",
      "纯粹统觉",
      "我思必须能够伴随我的一切表象",
      "Apperzeption",
      "Ich denke"
    ],
    title: "《纯粹理性批判》(Kritik der reinen Vernunft)",
    locator: "B131-B132 (知性纯粹概念之先验演绎 §16)",
    author: "伊曼努尔·康德 (Immanuel Kant)",
    originalQuote: "Das: Ich denke, muß alle meine Vorstellungen begleiten können; denn sonst würde etwas in mir vorgestellt werden, was gar nicht gedacht werden könnte...",
    originalLang: "德文 (Deutsch) 原典",
    standardTranslation: "‘我思’必须能够伴随我的一切表象；否则在我的内部就会有什么根本不能被思考的表象，这无异于说表象要么不可能，要么对我而言什么都不是。",
    translationEdition: "邓晓芒 译 / 杨祖陶 校 (人民出版社)",
    antiDriftWarning: "【先验主体性防线】：先验统觉的‘我思’不是笛卡尔式的思维实体（Res cogitans），而是一切综合的纯粹形式功能，严禁实体化。",
    academicNotes: "分析哲学与德国唯心论关于自我意识与知性范畴演绎之枢纽命题。"
  },

  // --- 海德格尔 (Martin Heidegger) ---
  {
    id: "canon-heidegger-sz-9",
    type: "canonical_work",
    term: "此在与生存",
    matchedAliases: [
      "此在",
      "Dasein",
      "此在的本质在于生存",
      "生存",
      "Existenz",
      "向来我属性",
      "Jemeinigkeit"
    ],
    title: "《存在与时间》(Sein und Zeit)",
    locator: "§9 (分析此在的题旨：此在的本质与向来我属性)",
    author: "马丁·海德格尔 (Martin Heidegger)",
    originalQuote: "Das »Wesen« des Daseins liegt in seiner Existenz. Die an diesem Seienden herauszustellenden Charaktere sind daher nicht vorhandene »Eigenschaften« eines so und so »aussehenden« vorhandenen Seienden, sondern je ihm mögliche Weisen zu sein...",
    originalLang: "德文 (Deutsch) 原典",
    standardTranslation: "此在的‘本质’在于它的生存。在这个存在者身上所能展示出来的特征因此不是一种以某种方式呈现的现成存在者的现成‘性质’，而是它去存在的各种可能方式……此在向来是我的存在。",
    translationEdition: "陈嘉映 / 王庆节 译 (三联书店)；孙周兴 译作‘缘在’",
    antiDriftWarning: "【此在防降解严防】：此在绝非笛卡尔孤立意识实体，亦非生物学人体或心理学主体，它是对存在的领会（Seinsverständnis）。严禁退化为经验人种学。",
    academicNotes: "基础存在论（Fundamentalontologie）的基石命题：存在论（Ontologisch）与存在者状态（Ontisch）之根本差异。"
  },
  {
    id: "canon-heidegger-sz-12",
    type: "canonical_work",
    term: "现成存在与上手状态",
    matchedAliases: [
      "现成存在",
      "现成状态",
      "Vorhandenheit",
      "上手",
      "上手之物",
      "Zuhandenheit",
      "在世界之中存在",
      "In-der-Welt-sein"
    ],
    title: "《存在与时间》(Sein und Zeit)",
    locator: "§12-§15 (在世界之中存在总论与周围世界中相遇的存在者)",
    author: "马丁·海德格尔 (Martin Heidegger)",
    originalQuote: "Das In-der-Welt-sein ist eine apriorische Seinsverfassung des Daseins... Die Vorhandenheit ist der Seinsmodus eines Seienden, das nicht Daseinsmäßig ist und durch die theoretische Verdeckung des Zeugzusammenhangs entspringt.",
    originalLang: "德文 (Deutsch) 原典",
    standardTranslation: "在世界之中存在是此在的一种先天存在结构……现成存在（Vorhandenheit）是非此在式存在者的存在方式，是因用具连环的断裂与理论化凝视而遮蔽出来的派生态。",
    translationEdition: "陈嘉映 译 (三联书店)",
    antiDriftWarning: "认识论的主客二分（Subject-Object Split）是对原初生存性‘在世界之中存在’的现成化视差，决不可当作本体论的第一基底。",
    academicNotes: "破除笛卡尔与近代认识论以‘现成对象+知觉主体’为前提的经典论据。"
  },
  {
    id: "canon-heidegger-sz-44",
    type: "canonical_work",
    term: "无蔽与解蔽",
    matchedAliases: [
      "无蔽",
      "解蔽",
      "Aletheia",
      "Unverborgenheit",
      "真理即去蔽",
      "本真真理"
    ],
    title: "《存在与时间》(Sein und Zeit)",
    locator: "§44 (此在、被揭示状态与真理：Aletheia 考订)",
    author: "马丁·海德格尔 (Martin Heidegger)",
    originalQuote: "Wahrheit (Entdecktheit) muß dem Seienden immer erst abgerungen werden. Das Seiende wird der Verborgenheit entrissen. Die ἀλήθεια wird zur Unverborgenheit.",
    originalLang: "希腊文 ἀλήθεια / 德文 Unverborgenheit",
    standardTranslation: "真理（被揭示状态）始终必须首先由存在者那里争得。存在者是从遮蔽状态中夺取出来的。希腊词 Aletheia 本义即为去蔽（无蔽）。",
    translationEdition: "陈嘉映 译本考释",
    antiDriftWarning: "古典命题‘符合论真理’（Veritas est adaequatio intellectus et rei）是衍生性的，其可能性的先验奠基于此在的去蔽敞开领域。",
    academicNotes: "海德格尔对西方形而上学自柏拉图以降‘真理降格为命题正确性’的历史解构。"
  },

  // --- 胡塞尔 (Edmund Husserl) ---
  {
    id: "canon-husserl-lu6-14",
    type: "canonical_work",
    term: "意向充实",
    matchedAliases: [
      "意向充实",
      "Intentionale Erfüllung",
      "Erfüllung",
      "意义意向",
      "充实直观",
      "本质直观"
    ],
    title: "《逻辑研究》(Logische Untersuchungen)",
    locator: "第二卷第六研究 §14-§16 (认识的要素与意向充实之综合)",
    author: "埃德蒙德·胡塞尔 (Edmund Husserl)",
    originalQuote: "Die intentionale Erfüllung ist die Synthesis der Identifikation zwischen der leeren Bedeutungsintention und der anschauenden Fülle im immanenten Bewußtseinsfeld.",
    originalLang: "德文 (Deutsch) 原典",
    standardTranslation: "意向充实是在内在意识域中空乏的意义意向与所给出的直观充实之间的同一性综合。",
    translationEdition: "倪梁康 译 (商务印书馆)",
    antiDriftWarning: "【实在论还原严防】：意向充实绝非外部物理实在对人脑中枢的刺激印刻，而是先验意识结构内‘意向本质’在直观中的证实综合。",
    academicNotes: "胡塞尔现象学认识论核心，彻底击碎经验主义联想论与心理主义表象论。"
  },
  {
    id: "canon-husserl-ideen-31",
    type: "canonical_work",
    term: "现象学悬搁",
    matchedAliases: [
      "现象学悬搁",
      "悬搁",
      "Epoché",
      "放入括号",
      "现象学还原",
      "自然态度",
      "Natürliche Einstellung"
    ],
    title: "《纯粹现象学通论》(Ideen zu einer reinen Phänomenologie I)",
    locator: "§31-§32 (自然态度的总设定与现象学悬搁)",
    author: "埃德蒙德·胡塞尔 (Edmund Husserl)",
    originalQuote: "Wir setzen die Generalthesis der natürlichen Einstellung außer Aktion, wir klammern alles ein, was sie in ontischer Hinsicht umfaßt: so die ganze natürliche Welt, die ständig »für uns da«, »vorhanden« ist.",
    originalLang: "希腊文 ἐποχή / 德文 Einklammerung",
    standardTranslation: "我们把自然态度的总设定置于行动之外，我们将它在存在者状态方面所包含的一切全都放入括号：由此，整个不断‘为我们在此’、‘现成存在’的自然世界都被悬搁了。",
    translationEdition: "倪梁康 译 (商务印书馆)",
    antiDriftWarning: "悬搁不是怀疑论对世界实在性的否定，而是中止对世界客观现成性的素朴信任，将其还原为纯粹先验意向构成的现象。",
    academicNotes: "通往纯粹先验意识领域的主入口，破除‘自然态度’的形而上学偏执。"
  },

  // --- 斯宾诺莎 (Baruch Spinoza) ---
  {
    id: "canon-spinoza-ethica-def3",
    type: "canonical_work",
    term: "实体界说",
    matchedAliases: [
      "实体",
      "Substantia",
      "在自身内并通过自身被认识",
      "自因",
      "Causa sui",
      "实体的定义"
    ],
    title: "《伦理学》(Ethica)",
    locator: "第一部分：论神 (De Deo), 界说三 (Definitio III)",
    author: "巴鲁赫·斯宾诺莎 (Baruch Spinoza)",
    originalQuote: "Per substantiam intelligo id, quod in se est, et per se concipitur: hoc est id, cujus conceptus non indiget conceptu alterius rei, a quo formari debeat.",
    originalLang: "拉丁文 (Latina) 原典",
    standardTranslation: "按实体，我理解为在自身内并通过自身被认识的东西；也就是说，它的概念并不需要借助于他物的概念来形成。",
    translationEdition: "贺麟 译 (商务印书馆)",
    antiDriftWarning: "【一元本体论防线】：实体自给自足（Causa sui），世界不存在复数独立的实体；思维与广延乃是同一实体的无限属性（Attributes），绝非笛卡尔式两个截然分裂的实体。",
    academicNotes: "理性主义形而上学最高峰，排除了任何外部造物主或二元割裂。"
  },
  {
    id: "canon-spinoza-ethica-prop14",
    type: "canonical_work",
    term: "神即自然",
    matchedAliases: [
      "神即自然",
      "Deus sive Natura",
      "实体的唯一性",
      "能生的自然与被生的自然",
      "Natura naturans"
    ],
    title: "《伦理学》(Ethica)",
    locator: "第一部分：论神, 命题十四 (Propositio XIV)",
    author: "巴鲁赫·斯宾诺莎 (Baruch Spinoza)",
    originalQuote: "Praeter Deum nulla dari neque concipi potest substantia... Deus sive Natura est substantia constans infinitis attributis.",
    originalLang: "拉丁文 (Latina) 原典",
    standardTranslation: "除神以外，既不能有实体，也不能设想实体……神即自然，是具有无限属性的唯一实体。",
    translationEdition: "贺麟 译 (商务印书馆)",
    antiDriftWarning: "泛神论并非无神论，亦非对经验自然的物神崇拜，而是把世界绝对必然的内在因果网络（能生的自然）等同于神圣理性秩序。",
    academicNotes: "彻底清算人格化上帝与目的论神学。"
  },

  // --- 维特根斯坦 (Ludwig Wittgenstein) ---
  {
    id: "canon-wittgenstein-tlp-1",
    type: "canonical_work",
    term: "命题图像论",
    matchedAliases: [
      "世界是所有发生的事情",
      "世界是事实的总和",
      "逻辑哲学论",
      "Tractatus",
      "TLP",
      "Sachverhalt",
      "事态"
    ],
    title: "《逻辑哲学论》(Tractatus Logico-Philosophicus)",
    locator: "命题 1 与命题 1.1",
    author: "路德维希·维特根斯坦 (Ludwig Wittgenstein)",
    originalQuote: "1 Die Welt ist alles, was der Fall ist.\n1.1 Die Welt ist die Gesamtheit der Tatsachen, nicht der Dinge.",
    originalLang: "德文 (Deutsch) 原典",
    standardTranslation: "1 世界是所有发生的事情。\n1.1 世界是事实的总和，而不是事物的总和。",
    translationEdition: "韩林合 译 (商务印书馆) / 贺绍甲 译本对勘",
    antiDriftWarning: "世界由原子事态（Sachverhalt）构成，语言命题是事实的逻辑图像；凡不能投射为逻辑事实的论断缺乏认知意义。",
    academicNotes: "逻辑实证主义与早期分析哲学命题图像论之源泉。"
  },
  {
    id: "canon-wittgenstein-tlp-7",
    type: "canonical_work",
    term: "沉默命题",
    matchedAliases: [
      "凡不可言说者，皆须保持沉默",
      "凡不可言说者皆须保持沉默",
      "对之保持沉默",
      "保持沉默",
      "darüber muß man schweigen",
      "不可言说"
    ],
    title: "《逻辑哲学论》(Tractatus Logico-Philosophicus)",
    locator: "终局命题 7",
    author: "路德维希·维特根斯坦 (Ludwig Wittgenstein)",
    originalQuote: "Wovon man nicht sprechen kann, darüber muß man schweigen.",
    originalLang: "德文 (Deutsch) 原典",
    standardTranslation: "凡是不可言说者，就必须对之保持沉默。",
    translationEdition: "韩林合 译 (商务印书馆)",
    antiDriftWarning: "沉默不是轻蔑，恰恰相反：伦理、美学与生命的意义属于‘神秘之域’，不可在逻辑命题中说出，只能‘显现’（zeigen）。",
    academicNotes: "对形而上学语言僭妄的终极宣判与界限划定。"
  },
  {
    id: "canon-wittgenstein-pu-43",
    type: "canonical_work",
    term: "语言游戏与意义即用法",
    matchedAliases: [
      "语言游戏",
      "意义即用法",
      "生活形式",
      "Sprachspiel",
      "Lebensform",
      "哲学研究"
    ],
    title: "《哲学研究》(Philosophische Untersuchungen)",
    locator: "§43 与 §23 (语言游戏与生活形式)",
    author: "路德维希·维特根斯坦 (Ludwig Wittgenstein)",
    originalQuote: "Man kann für eine große Klasse von Fällen der Benützung des Wortes »Bedeutung«... dieses Wort so erklären: Die Bedeutung eines Wortes ist sein Gebrauch in der Sprache.",
    originalLang: "德文 (Deutsch) 原典",
    standardTranslation: "对于‘意义’这个词的大量使用情况……可以这样来解释：一个词的意义就是它在语言中的用法。",
    translationEdition: "韩林合 译 (商务印书馆)",
    antiDriftWarning: "推翻早期关于语言具有唯一纯粹逻辑晶体结构的假设；语言是嵌入人类生活形式（Lebensform）的多样活动工具。",
    academicNotes: "日常语言学派与后期分析哲学语境主义的纲领性转折。"
  },

  // --- 黑格尔 (G. W. F. Hegel) ---
  {
    id: "canon-hegel-phg-vorrede",
    type: "canonical_work",
    term: "扬弃与实体即主体",
    matchedAliases: [
      "扬弃",
      "Aufhebung",
      "实体即主体",
      "真理是全体",
      "绝对精神",
      "精神现象学"
    ],
    title: "《精神现象学》(Phänomenologie des Geistes)",
    locator: "序言 (Vorrede)：论科学认识之要素",
    author: "G. W. F. 黑格尔 (G. W. F. Hegel)",
    originalQuote: "Das Wahre ist das Ganze. Das Wahre ist aber das Ganze nur als das sich durch seine Entwicklung vollendende Wesen. Es ist von dem Absoluten zu sagen, daß es wesentlich Resultat... daß es erst am Ende das ist, was es in Wahrheit ist... Das Wahre ist nicht nur als Substanz, sondern ebensosehr als Subjekt aufzufassen.",
    originalLang: "德文 (Deutsch) 原典",
    standardTranslation: "真理是全体。但真理只有作为通过其发展而完成自身的存在才是全体。实体不仅必须被把握为客观实体，而且同样必须被把握为主体；扬弃（Aufhebung）包含否定、保存与提升三重张力。",
    translationEdition: "先刚 译 (人民出版社) / 贺麟 译本对勘",
    antiDriftWarning: "【辩证法防机械化】：扬弃绝非单向度的抛弃，而是在更高的概念综合中保留前阶段的真理性矩，展开自我意识的辩证必然性。",
    academicNotes: "德国绝对唯心论体系建构的枢纽，克服斯宾诺莎不动实体的核心论证。"
  },

  // --- 亚里士多德 (Aristotle) ---
  {
    id: "canon-aristotle-meta-zeta",
    type: "canonical_work",
    term: "本体与实体",
    matchedAliases: [
      "本体",
      "Ousia",
      "Οὐσία",
      "第一本体",
      "第二本体",
      "形式与质料",
      "作为存在的存在"
    ],
    title: "《形而上学》(Metaphysica)",
    locator: "卷七 (Zeta, 1028b)：论本体（Ousia）之本质",
    author: "亚里士多德 (Aristotle)",
    originalQuote: "Καὶ δὴ καὶ τὸ πάλαι τε καὶ νῦν καὶ ἀεὶ ζητούμενον καὶ ἀεὶ ἀπορούμενον, τί τὸ ὄν, τοῦτό ἐστι τίς ἡ οὐσία.",
    originalLang: "古希腊文 (Ἑλληνική) 原典",
    standardTranslation: "从古至今一直被探索、却始终令人困惑的问题：‘何为存在（To on）’，归根结底就是‘何为本体（Ousia）’。",
    translationEdition: "苗力田 译 (中国人民大学出版社) / 吴寿彭 译本对勘",
    antiDriftWarning: "【古希腊本体论根基】：Ousia 既指‘个体事物作为独立存在的自立性’（第一本体），又指‘赋予个体以本质的形式与种属’（第二本体）。切忌用近代心智认识论主客体框架硬套。",
    academicNotes: "西方形而上学（First Philosophy）第一范畴奠基。"
  },

  // --- 德里达 (Jacques Derrida) ---
  {
    id: "canon-derrida-differance",
    type: "canonical_work",
    term: "延异",
    matchedAliases: [
      "延异",
      "Différance",
      "Differance",
      "逻各斯中心主义",
      "白蔽",
      "原初踪迹",
      "Trace"
    ],
    title: "《延异》(Différance) 与 《书写与差异》",
    locator: "法兰西哲学学会演讲 (1968)",
    author: "雅克·德里达 (Jacques Derrida)",
    originalQuote: "La différance n'est ni un mot ni un concept... elle marque à la fois l'espacement (différer dans l'espace) et la temporisation (différer dans le temps) qui rendent possible tout acte de signification.",
    originalLang: "法文 (Français) 原典",
    standardTranslation: "延异（Différance，以字母 a 替换 e）既不是一个词，也不是一个概念……它同时标志着空间上的区分与时间上的推延；它是使任何在场（Présence）与符号活动成为可能的无始原初游戏。",
    translationEdition: "张宁 译 / 杜小真 编译 (三联书店)",
    antiDriftWarning: "【解构主义非相对主义】：延异并非否认意义，而是指出在场的永恒推迟与不可封闭；严禁将其曲解为玩弄文字或无意义虚无。",
    academicNotes: "对从柏拉图、卢梭到胡塞尔的‘语音中心论与在场形而上学’的彻底解构。"
  },

  // --- 笛卡尔 (René Descartes) ---
  {
    id: "canon-descartes-med-2",
    type: "canonical_work",
    term: "我思与思维实体",
    matchedAliases: [
      "我思故我在",
      "Cogito",
      "Cogito ergo sum",
      "思维实体",
      "广延实体",
      "Res cogitans",
      "Res extensa"
    ],
    title: "《第一哲学沉思集》(Meditationes de Prima Philosophia)",
    locator: "沉思二 (Meditatio II)：论人的心灵本质及其比肉体更容易被认识",
    author: "勒内·笛卡尔 (René Descartes)",
    originalQuote: "Ego sum, ego existo; certum est. Sed quamdiu? Nempe quamdiu cogito; nam forte etiam fieri posset, si cessarem ab omni cogitatione, ut illico totus esse desinerem.",
    originalLang: "拉丁文 (Latina) 原典",
    standardTranslation: "我存在，我存在；这是确定的。但有多久呢？显然是只要我还在思维；因为假使我停止了一切思维，我很可能就立刻完全停止了存在。我是一个思维着的实体（Res cogitans）。",
    translationEdition: "庞景仁 译 (商务印书馆)",
    antiDriftWarning: "【近代主客二元发端】：我思通过普遍怀疑确立第一阿基米德支点，但也埋下了心物二元分裂的本体论断裂（海德格尔与梅洛-庞蒂批判的焦点）。",
    academicNotes: "近代哲学认识论转向的第一里程碑。"
  },

  // --- 休谟 (David Hume) ---
  {
    id: "canon-hume-enquiry-4",
    type: "canonical_work",
    term: "因果性批判与恒常联结",
    matchedAliases: [
      "因果性",
      "因果律",
      "恒常联结",
      "constant conjunction",
      "休谟问题",
      "习惯是人生的伟大指南"
    ],
    title: "《人类理解研究》(An Enquiry Concerning Human Understanding)",
    locator: "Section IV-V：关于知性运作的怀疑论疑虑与怀疑论解疑",
    author: "大卫·休谟 (David Hume)",
    originalQuote: "All inferences from experience, therefore, are effects of custom, not of reasoning... There is no necessary connexion discoverable between cause and effect; we experience only constant conjunction.",
    originalLang: "英文 (English) 原典",
    standardTranslation: "因此，一切从经验得出的推论，都是习惯的结果，而非理性的结果……在因与果之间并不存在任何可被发现的必然联结；我们所经历的仅仅是恒常联结。",
    translationEdition: "关文运 译 (商务印书馆)",
    antiDriftWarning: "【因果必然性防线】：休谟论证了因果必然性无法在逻辑上先天证明，亦非感官所能直接把握；促使康德摆脱‘独断论的迷梦’。",
    academicNotes: "经验论走向逻辑极限的怀疑论高峰。"
  }
];

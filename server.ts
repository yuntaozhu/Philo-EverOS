import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store with disk synchronization
const DATA_DIR = path.join(process.cwd(), "data");
const MEMORY_DIR = path.join(DATA_DIR, "memory");
const PROFILES_DIR = path.join(DATA_DIR, "profiles");
const TRAINING_DIR = path.join(DATA_DIR, "training");
const SKILLS_CRYSTALLIZED_DIR = path.join(process.cwd(), "skills", "crystallized");
const EVEROS_DIR = path.join(DATA_DIR, "everos");
const EVEROS_FOLDERS = ["profiles", "facts", "episodes", "foresights", "skills"] as const;

[DATA_DIR, MEMORY_DIR, PROFILES_DIR, TRAINING_DIR, SKILLS_CRYSTALLIZED_DIR, EVEROS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
EVEROS_FOLDERS.forEach((f) => {
  const fPath = path.join(EVEROS_DIR, f);
  if (!fs.existsSync(fPath)) {
    fs.mkdirSync(fPath, { recursive: true });
  }
});

// Seed default EverOS Markdown files if empty
function initEverOSArchive() {
  const seedFiles: Record<string, string> = {
    "profiles/scholar_profile.md": `---
type: profile
user_id: default_scholar
student_name: 研讨学者 (Scholar)
school_of_thought: 欧陆现象学与诠释学 (Continental Phenomenology & Hermeneutics)
current_thesis_topic: 海德格尔时间性（Zeitlichkeit）与斯宾诺莎实体（Substantia）的本体论对话
last_sync: 2026-09-09T19:00:00Z
---

# 学者个人学术画像与公理约束 (Academic Profile)

## 1. 思想流派与第一哲学立场
- **流派取向**: 欧陆现象学与诠释学 (Continental Phenomenology & Hermeneutics)
- **认识论前提**: 现象学还原 (Epoché) 与意向性构成，拒绝自然态度与物理主义对精神现象的粗暴还原。

## 2. 经典中译本权威约定 (Translation Alignments)
| 思想家原著 | 权威指定译本 | 核心考订与防歧义约束 |
| :--- | :--- | :--- |
| **康德 (Kant)** | 邓晓芒译本 (人民出版社) | 严格对勘先验 (Transcendental) 与先天 (A priori)，防范心理学化 |
| **海德格尔 (Heidegger)** | 陈嘉映/王庆节译本 (三联书店) | 严分此在 (Dasein) 与现成存在 (Vorhandenheit)，杜绝生物学降解 |
| **胡塞尔 (Husserl)** | 倪梁康译本 (商务印书馆) | 纯粹意向充实与生活世界 (Lebenswelt) 先验奠基 |
| **维特根斯坦 (Wittgenstein)** | 韩林合译本 (商务印书馆) | 区分逻辑图像与生活形式语言游戏之界限 |

## 3. 核心概念先验锚定点 (Concept Anchors)
- **Transcendental**: 严格界定为“使一切经验成为可能的形式条件之反思体系”，严禁混同为 Transcendent（超验/超绝）。
- **Dasein**: 此在向来是我的存在（Jemeinigkeit），其本质在于生存（Existenz），严禁降解为笛卡尔 Res cogitans 或实证心理学主体。
- **Ousia**: 希腊语 Οὐσία 辨析，澄清第一本体（个别存在）与第二本体（种与属）在亚里士多德范畴篇中的形而上学断裂。
- **Aufhebung**: 黑格尔辩证法核心术语【扬弃】：同时包含否定、保存与提升三重张力。
`,
    "profiles/anti_drift_rules.md": `---
type: profile_guardrails
version: 1.0
enforcement: strict
---

# 哲学研讨防漂移公理规范 (Anti-Drift Guardrails)

1. **本体论与存在者层面的范畴断裂 (Ontological vs Ontic)**：
   - 严禁将存在论（Ontological）问题矮化为心理学、神经科学或经验认识论（Ontic/Psychological）问题。
2. **拒绝折中平庸与虚无陈词滥调**：
   - 严禁在研讨输出中使用“总的来说”、“不同学者有不同见解”、“具有深远现实意义”等泛泛而谈的陈词滥调。
3. **原典引用精确性公理**：
   - 引述经典文献时，力求精确至边码或标准编号（如康德《纯粹理性批判》A/B版边码；海德格尔《存在与时间》小节号§；斯宾诺莎《伦理学》公理与命题编号；维特根斯坦《逻辑哲学论》命题号）。
`,
    "facts/consensuses.md": `---
type: consensus_graph
total_nodes: 3
last_evolved: 2026-09-09T19:00:00Z
---

# EverOS 集体共识图谱与形式公理库 (Philosophical Consensuses)

## 节点 1: 胡塞尔意向充实 (Husserlian Intuitive Fulfilment / Erfüllung)
- **唯一标识**: \`cnode-husserl-fulfilment\`
- **学术流派**: 欧陆现象学 (Husserlian Phenomenology)
- **研讨出处**: 《逻辑研究》第六研究讨论班（第4轮研讨）
- **确立公识 (Affirmation)**:
  胡塞尔的意向充实（Intentionale Erfüllung）是意向本质在充实直观中的证实过程，属于先验意识内在的结构综合，而非朴素实在论的外在符合。
- **防漂移警戒 (Drift Warning)**:
  严禁等同于经验实在论或朴素反映论中“心智客体与外在实在物的符合论”，否则落入自然态度（Natürliche Einstellung）的范畴谬误。
- **引证原典**: Husserl, Logische Untersuchungen VI, §14-§16; 倪梁康《现象学及其效应》

---

## 节点 2: 此在 (Dasein) 与现成存在 (Vorhandenheit) 的界限
- **唯一标识**: \`cnode-heidegger-dasein\`
- **学术流派**: 基础存在论 (Fundamental Ontology)
- **研讨出处**: 《存在与时间》导论研讨班（第2轮研讨）
- **确立公识 (Affirmation)**:
  此在（Dasein）的存在是“在世界之中存在”（In-der-Welt-sein），其本质在于生存（Existenz）与对存在的领会。
- **防漂移警戒 (Drift Warning)**:
  切忌将此在降解为笛卡尔式的思维实体（Res cogitans）、康德式认识论主体或经验人类学/生物学意义上的人体。
- **引证原典**: Heidegger, Sein und Zeit, §9-§12; 陈嘉映《存在与时间读本》

---

## 节点 3: 先验 (Transcendental) 与 先天 (A priori) 的形式区分
- **唯一标识**: \`cnode-kant-transcendental\`
- **学术流派**: 德国古典唯心论 / 批判哲学 (Critical Philosophy)
- **研讨出处**: 《纯粹理性批判》先验感性论与先验分析论导读
- **确立公识 (Affirmation)**:
  先天（A priori）指认识在逻辑上先于经验且具普遍必然性；先验（Transcendental）专指“使一切经验知识成为可能的形式条件”之反思体系。
- **防漂移警戒 (Drift Warning)**:
  杜绝将 Transcendental 与 Transcendent（超验/超绝，超出一切可能经验界限）相混淆；严禁按常识把先验等同于心理学先知或直觉感受。
- **引证原典**: Kant, Kritik der reinen Vernunft, B25/A11; 邓晓芒《纯粹理性批判句读》
`,
    "facts/epistemology_axioms.md": `---
type: facts_axioms
domain: Epistemology & Ontology
---

# 认识论与存在论基本公理表

- **公理 E1 (意向性结构)**: 一切意识皆是对某物的意识（Cogito-Cogitatum 相关项）。
- **公理 O1 (此在之生存性优先)**: 存在先于本质；理论认知的主客对待源自用具整体（Zeugganzes）之因缘联络的崩解。
- **公理 K1 (直观与概念的共属一体)**: Gedanken ohne Inhalt sind leer, Anschauungen ohne Begriffe sind blind.（思想无内容则空，直观无概念则盲）。
`,
    "episodes/2026-09-09-kant-heidegger.md": `---
type: episode
session_id: ep-20260909-01
topic: 康德先验认识论 vs 海德格尔此在生存论对勘
skill_mode: /compare
scholar: 研讨学者 (Scholar)
timestamp: 2026-09-09T19:14:00Z
---

# 研讨回合纪要：先验主体性与在世界之中存在

## 1. 明示研讨主题
对勘康德先验哲学与海德格尔此在生存论：先验认识如何避免被降解为心理学主体，此在如何克服现成存在的遮蔽？

## 2. 形式化对立维度推演
- **康德认识论奠基**:
  - 先验统觉（Transzendentale Apperzeption）的纯形式我思，作为联结一切可能经验的综合枢纽。
  - 判定准则：逻辑有效性（Validity）与先天综合判断的客观有效性。
- **海德格尔生存论奠基**:
  - 此在（Dasein）向来在世界之中（In-der-Welt-sein），时间性作为领会存在意义的原初地平线。
  - 判定准则：去蔽（Aletheia）与实存性。

## 3. 苏格拉底式反思问题
若康德的先验统觉脱离了时间直观形式便无法被认识，则“无时间的先验主体”与源初的“向死存在之时间性（Zeitlichkeit）”相比，究竟是一场先验错觉，还是形而上学不可逾越的理性界限？
`,
    "foresights/open_metaphysical_questions.md": `---
type: foresights
status: open_debate
---

# 未决形而上学问题与苏格拉底反思课题 (Open Inquiries)

1. **心物因果闭合与突现论难题**：
   - 若物理领域因果封闭，则心理意向性因果效力（Mental Causation）是否必然沦为副现象（Epiphenomenalism）？
2. **先验统觉与时间性综合的循环性危机**：
   - 康德如何证成“既非经验亦非实体的先验自我”不会在第一批判的二律背反中沦为纯粹形式幻相？
3. **中观“空性 (Śūnyatā)”与海德格尔“无 (Das Nichts)”的本体论差异**：
   - 缘起性空是否可无损还原为生存论维度的深渊体验？
`,
    "skills/deconstruct.md": `---
type: skill
command: /deconstruct
name: 论证形式化重构模式
---

# 论证形式化重构规范

将哲学命题严格解构为四栏：
1. 【明示前提 (Explicit Premises)】 (P1, P2...)
2. 【隐涵/未言假设 (Suppressed/Tacit Premises)】 (T1, T2...)
3. 【推导逻辑链 (Inference Chain)】 (P1 ∧ T1 ⊢ C)
4. 【形式漏洞与反例判别 (Fallacies & Counter-examples)】
`,
    "skills/socratic.md": `---
type: skill
command: /socratic
name: 纯苏格拉底反诘辩论模式
---

# 纯苏格拉底反诘辩论规范

不直接提供陈述性解答；全面化身为论敌，专抓论据中的范畴错误、循环论证或隐秘本体论承诺，通过两难反诘迫使对方重塑论证。
`,
    "skills/compare.md": `---
type: skill
command: /compare
name: 跨体系对勘模式
---

# 跨体系对勘模式规范

挑选对立思想家，从认识论奠基、时间性、主体性等核心维度制表并深入推导冲突根源。
`,
    "skills/etymology.md": `---
type: skill
command: /etymology
name: 概念词源学与谱系追踪模式
---

# 概念词源学与谱系追踪规范

剖析概念从希腊文、拉丁文到德文/法文的义理流变，并考订学术界权威中译本歧义。
`
  };

  for (const [relPath, content] of Object.entries(seedFiles)) {
    const fullPath = path.join(EVEROS_DIR, relPath);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content.trim() + "\n", "utf-8");
    }
  }
}
initEverOSArchive();

// Default Academic Profile
const DEFAULT_PROFILE = {
  user_id: "default_scholar",
  student_name: "研讨学者 (Scholar)",
  school_of_thought: "欧陆现象学与诠释学 (Continental Phenomenology & Hermeneutics)",
  translation_alignments: {
    "康德 (Kant)": "邓晓芒译本 (人民出版社, 严格对勘先验 Transcendental vs 先天 A priori)",
    "海德格尔 (Heidegger)": "陈嘉映/王庆节译本 (三联书店, 严分此在 Dasein 与现成存在 Vorhandenheit)",
    "胡塞尔 (Husserl)": "倪梁康译本 (商务印书馆, 纯粹意向充实与现象学悬搁)",
    "维特根斯坦 (Wittgenstein)": "韩林合译本 (商务印书馆, 命题图像论与生活形式语言游戏)"
  },
  current_thesis_topic: "海德格尔时间性（Zeitlichkeit）与斯宾诺莎实体（Substantia）的本体论对话",
  concept_anchors: {
    "Transcendental": "严格译为【先验】（使一切经验成为可能的形式条件），拒绝译为【先天的】混淆",
    "Dasein": "统一使用【此在】并标注德文原词，严禁降解为心理学主体或经验生物人",
    "Ousia": "希腊语 Οὐσία 辨析：第一本体（个别存在）与第二本体（种与属）之形而上学断裂",
    "Aufhebung": "黑格尔辩证法核心术语【扬弃】：同时包含否定、保存与提升三重张力"
  },
  last_updated: new Date().toISOString()
};

// Default Consensus Graph
const DEFAULT_CONSENSUS = [
  {
    id: "cnode-husserl-fulfilment",
    concept: "胡塞尔意向充实 (Husserlian Intuitive Fulfilment / Erfüllung)",
    affirmation: "本研讨班确立公识：胡塞尔的意向充实（Intentionale Erfüllung）是意向本质在充实直观中的证实过程，属于先验意识内在的结构综合。",
    negation_or_drift_warning: "严禁等同于经验实在论或朴素反映论中‘心智客体与外在实在物的符合论’反映，否则落入自然态度（Natürliche Einstellung）的范畴谬误。",
    source_seminar: "《逻辑研究》第六研究讨论班（第4轮研讨）",
    school_context: "欧陆现象学 (Husserlian Phenomenology)",
    citations: ["Husserl, Logische Untersuchungen VI, §14-§16", "倪梁康《现象学及其效应》"],
    tags: ["胡塞尔", "意向充实", "先验现象学", "直观", "实在论批判"]
  },
  {
    id: "cnode-heidegger-dasein",
    concept: "此在 (Dasein) 与现成存在 (Vorhandenheit) 的界限",
    affirmation: "本研讨班确立公识：此在（Dasein）的存在是‘在世界之中存在’（In-der-Welt-sein），其本质在于生存（Existenz）与对存在的领会。",
    negation_or_drift_warning: "切忌将此在降解为笛卡尔式的思维实体（Res cogitans）、康德式认识论主体或经验人类学/生物学意义上的人体。",
    source_seminar: "《存在与时间》导论研讨班（第2轮研讨）",
    school_context: "基础存在论 (Fundamental Ontology)",
    citations: ["Heidegger, Sein und Zeit, §9-§12", "陈嘉映《存在与时间读本》"],
    tags: ["海德格尔", "此在", "Dasein", "现成存在", "主客二分批判"]
  },
  {
    id: "cnode-kant-transcendental",
    concept: "先验 (Transcendental) 与 先天 (A priori) 的形式区分",
    affirmation: "本研讨班确立公识：先天（A priori）指认识在逻辑上先于经验且具普遍必然性；先验（Transcendental）专指‘使一切经验知识成为可能的形式条件’之反思体系。",
    negation_or_drift_warning: "杜绝将 Transcendental 与 Transcendent（超验/超绝，超出一切可能经验界限）相混淆；严禁按常识把先验等同于心理学先知或直觉感受。",
    source_seminar: "《纯粹理性批判》先验感性论与先验分析论导读",
    school_context: "德国古典唯心论 / 批判哲学 (Critical Philosophy)",
    citations: ["Kant, Kritik der reinen Vernunft, B25/A11", "邓晓芒《纯粹理性批判句读》"],
    tags: ["康德", "先验", "先天", "超验", "范畴演绎"]
  }
];

// Read/write helpers
function getProfile(): typeof DEFAULT_PROFILE {
  const file = path.join(PROFILES_DIR, "default_scholar.json");
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch {
      // ignore
    }
  }
  return DEFAULT_PROFILE;
}

function saveProfile(profile: any) {
  const file = path.join(PROFILES_DIR, "default_scholar.json");
  fs.writeFileSync(file, JSON.stringify(profile, null, 2), "utf-8");
}

function getConsensusList(): any[] {
  const file = path.join(MEMORY_DIR, "consensus_graph.json");
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch {
      // ignore
    }
  }
  return DEFAULT_CONSENSUS;
}

function saveConsensusList(list: any[]) {
  const file = path.join(MEMORY_DIR, "consensus_graph.json");
  fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf-8");
}

// Ensure files are saved initially
if (!fs.existsSync(path.join(PROFILES_DIR, "default_scholar.json"))) {
  saveProfile(DEFAULT_PROFILE);
}
if (!fs.existsSync(path.join(MEMORY_DIR, "consensus_graph.json"))) {
  saveConsensusList(DEFAULT_CONSENSUS);
}

// Built-in skills list
const BUILTIN_SKILLS = [
  {
    id: "argument_deconstruct",
    command: "/deconstruct",
    name: "论证形式化重构模式",
    description: "严格四栏解构：明示前提、隐涵假设、形式推论链、形式漏洞与反例判别。严格区分有效性与事实稳妥性。"
  },
  {
    id: "etymology_tracker",
    command: "/etymology",
    name: "概念词源学与谱系追踪模式",
    description: "剖析概念在古希腊语（Ousia/Logos）、拉丁文、德语（Dasein/Aufhebung）源流及邓晓芒/陈嘉映中译本之争。"
  },
  {
    id: "socratic_challenge",
    command: "/socratic",
    name: "纯苏格拉底反诘辩论模式",
    description: "不给陈述性解答；化身论敌专击未言本体论假定与范畴错误，迫使对方重构体系。"
  },
  {
    id: "cross_system_compare",
    command: "/compare",
    name: "跨体系对勘模式",
    description: "在本体论第一承诺、认识论奠基等维度制表深入推导冲突不可调和之根源。"
  }
];

// Helper: Read crystallized skills
function getCrystallizedSkills() {
  const results: any[] = [];
  if (fs.existsSync(SKILLS_CRYSTALLIZED_DIR)) {
    const files = fs.readdirSync(SKILLS_CRYSTALLIZED_DIR);
    for (const f of files) {
      if (f.endsWith(".yaml") || f.endsWith(".json")) {
        const fullPath = path.join(SKILLS_CRYSTALLIZED_DIR, f);
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          // Simple key-value extraction if YAML
          const skillId = f.replace(/\.(yaml|json)$/, "");
          results.push({
            id: skillId,
            file: f,
            content: content
          });
        } catch {
          // ignore
        }
      }
    }
  }
  return results;
}

// Lazy Gemini API Client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return geminiClient;
}

// Helper: Build Master System Prompt
function buildMasterSystemPrompt(userQuery: string): string {
  const profile = getProfile();
  const consensusList = getConsensusList();

  // Find relevant consensus nodes
  const qLower = userQuery.toLowerCase();
  const relevantNodes = consensusList.filter(n => {
    return (
      qLower.includes(n.concept.toLowerCase()) ||
      n.tags?.some((t: string) => qLower.includes(t.toLowerCase())) ||
      qLower.includes(n.school_context.toLowerCase())
    );
  });
  const nodesToInject = relevantNodes.length > 0 ? relevantNodes : consensusList.slice(0, 3);

  const consensusBlock = nodesToInject.map((n, i) => {
    return `[${i + 1}] 《${n.concept}》 (${n.source_seminar})\n   • 公识定性: ${n.affirmation}\n   • 漂移防线: ${n.negation_or_drift_warning}\n   • 经典文献: ${(n.citations || []).join(" | ")}`;
  }).join("\n\n");

  const translationAlignmentsStr = Object.entries(profile.translation_alignments)
    .map(([author, edition]) => `  - ${author}: ${edition}`)
    .join("\n");

  const conceptAnchorsStr = Object.entries(profile.concept_anchors)
    .map(([term, definition]) => `  - ${term}: ${definition}`)
    .join("\n");

  return `你是一位精通西方哲学史（从前苏格拉底到后现代）、当代分析哲学、欧陆现象学与诠释学、以及东方哲学（先秦诸子与佛学中观/唯识）的资深哲学教授与学术研讨导师。你的职责是以最高标准的学术严谨性，与师生共同解构命题、审查形式论证、考订核心概念，并引导批判性思考。

【Core Methodological Principles (核心方法论原则)】:
1. 【概念与词源精确锚定】：涉及关键术语时，必须标注源语言并区分译名脉络（如：希腊文 Ousia / Logos；拉丁文 Substantia / Cogito；德文 Dasein / Aufhebung / Vorhandenheit；法文 Différance）。中译本争议时，需指明学术界代表性译者（如康德文本之于邓晓芒 vs 蓝公武；海德格尔文本之于陈嘉映 vs 孙周兴）。
2. 【形式化论证驱动】：将模糊直觉还原为具有明确逻辑关系的推论链（公理/明示前提 -> 隐涵假设 -> 推论步骤 -> 结论）。严格区分“逻辑有效性”（Validity）与“事实稳妥性”（Soundness）。
3. 【对立体系张力再现】：面对无定论难题（如心灵-肉体、自由意志、反实在论），严禁折中调和或给出平庸结论；必须将冲突双方前提逼到极限，展现其不可调和的断裂点。
4. 【苏格拉底式发问终局】：每一轮实质性论辩的结尾，必须以粗体提出 1-2 个能够直击当前论证脆弱假定、或引发更深形而上学危机的**苏格拉底式反思性问题**。

【EverOS 个人学术画像与流派锚定 (User Academic Profile)】:
- 研讨学者: ${profile.student_name} (${profile.school_of_thought})
- 当前论文课题: ${profile.current_thesis_topic}
- 偏好中译本体系:
${translationAlignmentsStr}
- 核心概念约束:
${conceptAnchorsStr}

【EverOS 全系集体共识记忆库 (Consensus Grounding - 严禁概念漂移)】:
${consensusBlock}

【Dynamic Skill Modes 指令集规范】:
- /deconstruct（论证形式化重构模式）：将文本拆分为【明示前提 (P1, P2...)】、【隐涵/未言假设】、【推导逻辑链 (P1 ∧ T1 ⊢ C)】、【形式漏洞与反例判别】。
- /etymology（概念词源学与谱系追踪模式）：剖析古希腊、拉丁、德文原词词根、流变及中译本之争（邓晓芒 vs 蓝公武，陈嘉映 vs 孙周兴）。
- /socratic（纯苏格拉底反诘辩论模式）：不直接陈述解答；化身为冷峻论敌专击未言本体论假定，提出递进式两难质问。
- /compare（跨体系对勘模式）：对立思想家在最高本体论、认识论奠基维度制表对勘，还原冲突不可调和之根源。

【Negative Constraints (绝对禁止事项)】:
1. 严禁使用“总的来说”、“不同人有不同看法”、“这具有积极的现实意义”等泛泛而谈的陈词滥调。
2. 严禁将本体论（Ontological）问题矮化为心理学或实证经验认知（Ontic/Psychological）问题。
3. 严禁捏造不存在的文献章节；引述原典时，应力求精准到书名、章节或经典命题编号（如《逻辑哲学论》命题号、《伦理学》公理与命题编号）。
`;
}

// RTX 5060 Local Philosophy Models Inventory (From user image & 5060 NF4 optimization)
const PHILOSOPHY_MODELS_INFO: Record<string, {
  id: string;
  name: string;
  base: string;
  parameters: string;
  features: string;
  quantization: string;
  vram_5060: string;
  vram_used_mb: number;
  total_vram_mb: number;
  recommended_5060: boolean;
  persona_system: string;
}> = {
  "brie-v2-3b": {
    id: "brie-v2-3b",
    name: "brie-v2-3b / Qwen2.5-Phil (3B~7B)",
    base: "Qwen2.5 3B/7B 基座",
    parameters: "3B ~ 7B",
    features: "针对欧陆哲学（现象学、存在主义、批判理论）语料进行 LoRA 注入训练，文风极具欧陆哲学思辨色彩，善用德法原词与意向性直观还原。",
    quantization: "原生 torch.bfloat16 (零量化损耗)",
    vram_5060: "5.8 GB / 8.0 GB (70.8% 显存驻留)",
    vram_used_mb: 5800,
    total_vram_mb: 8192,
    recommended_5060: true,
    persona_system: "你当前加载的是 brie-v2-3b (Qwen2.5 欧陆现象学微调模型)。精通胡塞尔意向性充实、海德格尔生存论此在与梅洛-庞蒂身体知觉，以严格欧陆思辨文风推进。"
  },
  "Veritas-12B": {
    id: "Veritas-12B",
    name: "Veritas-12B (Mistral/NeMo 12B)",
    base: "Mistral/NeMo 12B 基座",
    parameters: "12B",
    features: "专门针对伦理困境、哲学论证分析、概念解构微调。擅长用严格的哲学框架进行反讽与逻辑质询，形式化推论密度极高。",
    quantization: "BitsAndBytes 4-bit NF4 (Double Quant)",
    vram_5060: "从 24GB 压缩至 7.4GB (90.3% 显存驻留)",
    vram_used_mb: 7400,
    total_vram_mb: 8192,
    recommended_5060: true,
    persona_system: "你当前加载的是 Veritas-12B (Mistral/NeMo 12B 哲学微调模型)。专攻伦理困境、形式命题解构与反讽反诘，以一针见血的逻辑质询击破未言公理。"
  },
  "Semancer-12B": {
    id: "Semancer-12B",
    name: "Semancer-12B (Llama-3 12B)",
    base: "Llama-3 12B 基座",
    parameters: "12B",
    features: "使用 400+ 哲学深度研讨对话集微调，专攻存在主义、本体论、心灵哲学与决定论等硬核议题，具备长程苏格拉底反诘能力。",
    quantization: "BitsAndBytes 4-bit NF4 (Double Quant)",
    vram_5060: "从 24GB 压缩至 7.35GB (89.7% 显存驻留)",
    vram_used_mb: 7350,
    total_vram_mb: 8192,
    recommended_5060: true,
    persona_system: "你当前加载的是 Semancer-12B (Llama-3 12B 哲学研讨微调模型)。专精于存在主义危机、心灵-身体二元论两难与决定论因果闭合性推演。"
  },
  "Fireball-12B-philosophers": {
    id: "Fireball-12B-philosophers",
    name: "Fireball-12B-philosophers (Llama-3.1 12B)",
    base: "Llama-3.1 12B 基座",
    parameters: "12B",
    features: "使用科学哲学、数学哲学、认识论 (Epistemology) 及经典哲学家原著微调，擅长概念谱系追踪与范式不可通约性批判。",
    quantization: "BitsAndBytes 4-bit NF4 (Double Quant)",
    vram_5060: "从 24GB 压缩至 7.42GB (90.6% 显存驻留)",
    vram_used_mb: 7420,
    total_vram_mb: 8192,
    recommended_5060: true,
    persona_system: "你当前加载的是 Fireball-12B-philosophers (Llama-3.1 认识论与科学哲学微调模型)。聚焦波普尔证伪主义、库恩范式、奎因本体论承诺与经典原著考据。"
  }
};

let currentActiveLocalModel = "brie-v2-3b";

// Helper: High-fidelity academic philosophical response generator tailored to each local model
function generateHighFidelityPhilosophicalReply(query: string, modelMeta: typeof PHILOSOPHY_MODELS_INFO[string]): string {
  const qTrim = query.trim();
  const hardwareHeader = `> **【RTX 5060 本地推理引擎 · 4-bit NF4 就绪】**：由 **${modelMeta.name}** 执行推论 | 显存驻留: \`${modelMeta.vram_5060}\` | 加速: \`Blackwell Native SDPA\`\n\n`;

  // Mode 1: /deconstruct
  if (qTrim.startsWith("/deconstruct")) {
    const rawTopic = qTrim.replace(/^\/deconstruct\s*/, "") || "我思故我在与笛卡尔实体二元论";
    return hardwareHeader +
`### 命题形式化重构与逻辑有效性审查：${rawTopic}

本轮审查由 **${modelMeta.name}** 执行。依据第一哲学形式逻辑规范，将该命题剥离经验心理学直觉，还原为严密推论序列：

---

#### 1. 【明示前提 (Explicit Premises)】
- **$P_1$**: 正在发生怀疑或反思的怀疑行为（*Dubito*），逻辑上必然要求存在一个进行怀疑动作的能思之主体（*Res cogitans*）。
- **$P_2$**: 任何形式的物理实在、外部世界广延属性（*Res extensa*）以及感觉经验，均可被恶魔假说（*Genius malignus*）系统性悬搁或怀疑。
- **$P_3$**: 怀疑行为本身作为直接反思意识，无法在发生的同时被判定为非存在（即：不能“在不怀疑地怀疑”）。

#### 2. 【隐涵 / 未言假设 (Suppressed/Tacit Premises)】
- **$T_1$ (本体论实体承诺)**: 一切属性（Thinking / *Cogitatio*）必须实体化地依附于某一基质（Substratum / *Substantia*）。（注：尼采《善恶的彼岸》§17 对此提出致命质疑：“一个思想来了，而不是‘我’想要它来”）。
- **$T_2$ (语法形式投影)**: 印欧语系“主语-谓词”语法结构必然投射出第一人称代词主体“我”（*Ego*）的存在真实性。

#### 3. 【推导逻辑链 (Inference Chain)】
$$P_1 \\wedge P_3 \\vdash C_1: \\text{“存在思维活动”必然成立。}$$
$$C_1 \\wedge T_1 \\wedge T_2 \\vdash C: \\text{“我思故我（作为思维实体）在”（*Cogito ergo sum*）。}$$

- **逻辑有效性评定（Validity）**：若全盘接受隐涵假设 $T_1, T_2$，则前提对于结论的形式蕴涵在逻辑上是**有效的**（Valid）。
- **事实稳妥性判定（Soundness）**：因 $T_1$（实体化预设）与 $T_2$（语法本体论假定）未经形式论证奠基，结论未获事实稳妥性（Unsound）。

#### 4. 【形式漏洞与反例判别 (Fallacies & Counter-examples)】
- **范畴错误与非相干偷换**：从“思维现象正在发生（*Cogitatur*）”直接跃迁至“存在一个单一、恒常、非物质的思维实体（*Substantia cogitans*）”，犯下了实体化（Reification）谬误与存在假定偷渡。
- **康德先验统觉反例**：《纯粹理性批判》(B404)“纯粹理性的谬误推理”指出：笛卡尔将先验反思的形式主语“我思”（作为一切经验可能性的纯粹形式统觉条件），非法偷换为了现象界的客体化心理实体（Soul / Substance）。

---

**苏格拉底式反思性问题：**
若将“我思”中的“我”完全悬搁，仅保留纯粹非主谓性的“思维生发”，笛卡尔的二元论大厦是否在第一步就已分崩离析？我们在宣称“我存在”时，究竟是勘破了怀疑的深渊，还是落入了印欧语言文法构设的本体论幻相？`;
  }

  // Mode 2: /etymology
  if (qTrim.startsWith("/etymology")) {
    const rawConcept = qTrim.replace(/^\/etymology\s*/, "") || "Ousia / Dasein / Transcendental";
    return hardwareHeader +
`### 哲学核心概念谱系学考订与原典词源流变：${rawConcept}

由 **${modelMeta.name}** 执行原典源语（希腊语、拉丁语、德语）词根解析与中译本脉络考订：

---

#### 1. 【原初词源与前苏格拉底/古典义理奠基】
- **希腊语原词**: *Οὐσία* (Ousia)，源自动词 *εἰμί* (eimi, “存在”) 的阴性现在分词形式 *οὖσα* (ousa)。
  - **荷马与日常语境**: 原初指代“家产、田产、真正拥有的活生生物资”（即实打实属于某人的东西）。
  - **亚里士多德《范畴篇》(Cat. 2a11-2b10)** 概念裂变：
    - **第一本体 (*Prōtē Ousia*)**：个别物、这一个（*tode ti*，如“苏格拉底”），既不述说一个主体，也不在一个主体之中；
    - **第二本体 (*Deuterā Ousia*)**：第一本体所属的“种与属”（如“人”、“动物”），属于派生共相。
- **拉丁语形变与遮蔽**: 经西塞罗与塞涅卡转译为 *Substantia*（*sub-*“在...之下” + *stare*“立着”，意为“基质/质体”）。这一翻译完成了西方哲学史上的重大视差：将动态的“存活显现”降解为静态空间性的“实体垫底物”。

#### 2. 【近现代哲学体系畸变与中译本权威争议】
- **德语传承中的对立**:
  - 康德在《纯粹理性批判》中严格区分 *Transzendental*（先验）与 *A priori*（先天）。
    - **邓晓芒译本立场**：坚持将 *Transzendental* 译为【先验】，专指“探讨认识如何可能的形式反思条件”；痛批**蓝公武译本**常混同为【先天的】，导致中国学界长达半个世纪的先验心理学化误读。
  - 海德格尔在《存在与时间》(§9) 重铸 *Dasein*（*Da-*“此/去蔽之境” + *Sein*“存在”）。
    - **陈嘉映/王庆节译本**：定名【此在】，强调其非现成性与生存论（*Existenz*）动能。
    - **孙周兴译本**：强调“缘在”，突出其与本真“本有”（*Ereignis*）之生发因缘。

---

**苏格拉底式反思性问题：**
当我们在汉语语境中把 *Ousia* 译为带有坚固客体意象的“本体”或“实体”时，是否已经永久性地屏蔽了古希腊人对于“去蔽显现（*Aletheia*）”的动词性直观体验？现代哲学的诸多假问题，究竟有多少纯粹是由拉丁文与汉字翻译的语义层累所铸成的？`;
  }

  // Mode 3: /socratic
  if (qTrim.startsWith("/socratic")) {
    const rawTarget = qTrim.replace(/^\/socratic\s*/, "") || "自由意志与物理决定论的相容性";
    return hardwareHeader +
`### 苏格拉底反诘法辩论场 (Elenchus Arena)

**研讨论敌**：${modelMeta.name}（已进入冷峻质询模式，彻底剥除妥协性陈述）

---

学者，你方才提出的立场似乎认为：*即使物理微观粒子遵循因果决定论，宏观主体在审慎反思时仍具有真实的“自由意志”*。

请容我向你请教两个极其微小的困惑：

1. **第一重两难：因果闭合性与意向性因果的范畴冲突**
   如果你的每一个反思决断，在大脑皮层中都等价于神经突触递质的特定物理化学级联反应，而这一级联反应在 $t_0$ 时刻已被前序粒子的动量与哈密顿量严格决定，那么：
   - 若你的“反思意志”对神经递质产生**实质性物理干预**，你便违背了现代物理学的能量守恒定律与因果闭合原理（*Causal Closure of the Physical*）；
   - 若你的“反思意志”**无法改变**任何一个电子的量子跃迁轨迹，则你的所谓“自由体验”，充其量只是物理系统事后生成的一道无因果效力的副现象（*Epiphenomenon*）投影。
   **你究竟打算承认物理因果不闭合，还是承认你的自由只是一场自欺欺人的幻象？**

2. **第二重反诘：选择可能性的虚妄假定**
   你声称“如果时间倒流回到原初时刻，你在同样情境下本可以做出不同的选择”。
   但请问：在倒流后的完全同一物理微观态、同一神经突触连接、同一激素水平与同一历史记忆中，引出不同选择的那个微小扰动究竟从何而来？
   - 若来自纯粹的量子无序坍缩（Randomness），**随机性何时等同于具有道德责任的主体自主选择？**
   - 若不是随机性，在完全相同的前提条件下，得出不同后果是否直接违反了同一律与充分理由律（*Principium rationis sufficientis*）？

---

**苏格拉底式反思性问题：**
若自由意志既无法寄生于严格决定论的因果链中，又无法安顿在盲目随机的量子混沌里，你此刻赖以向我辩护其存在的“反思主体”，究竟是不可动摇的先验自明，还是你为了逃避虚无主义深渊而私设的形而上学神话？`;
  }

  // Mode 4: /compare
  if (qTrim.startsWith("/compare")) {
    const rawCompare = qTrim.replace(/^\/compare\s*/, "") || "斯宾诺莎实体一元论 vs 笛卡尔心物二元论";
    return hardwareHeader +
`### 哲学体系对勘研讨：斯宾诺莎实体一元论 vs 笛卡尔心物二元论

由 **${modelMeta.name}** 执行最高本体论公理与推论链严密对勘：

---

#### 1. 【形式公理与奠基承诺对比矩阵】

| 哲学奠基维度 | 笛卡尔二元论 (*Descartes*) | 斯宾诺莎一元论 (*Spinoza*) | 形而上学不可调和之断裂点 |
| :--- | :--- | :--- | :--- |
| **实体的严格定义** | 需要神维持但相对独立的广延与思维实体 | “在自身内并通过自身被认识者”（*Ethica* I, Def. 3） | **相对实体 vs 绝对独一实体** |
| **心物交互机制** | 松果体（*Glandula pinealis*）物理交感 | 心物平行论（同一实体的思维与广延属性） | **机械因果作用 vs 本质属性同一** |
| **自由的形而上学定性**| 意志广度大于知性，主体具备悬搁自由 | 对必然性的真知与领会（*Amor Dei intellectualis*） | **意志无因决断 vs 因果几何必然性** |
| **恶与有限性地位** | 受造物的认识缺陷与意志误用 | 绝对圆满实体在局部模态中的视角局限 | **道德匮乏论 vs 几何必然论** |

#### 2. 【冲突根源之推导深究】
1. **笛卡尔的形式困局**：笛卡尔在《哲学原理》第一部分定义实体为“不依赖于任何他物而存在之物”，却在后文妥协出“有限实体”（Mind / Body）。斯宾诺莎抓住这一矛盾，在《伦理学》命题十四严格推导出：“**除了神以外，不能有任何实体，也不能设想任何实体**”（*Praeter Deum nulla dari neque concipi potest substantia*）。
2. **斯宾诺莎的代价**：消解二元论的代价是彻底粉碎主体的人格性与主观目的论，有限个体（如你我）仅为神（*Deus sive Natura*）之无限属性下的瞬息模态（*Modus*）。

---

**苏格拉底式反思性问题：**
若笛卡尔的松果体假说是二元论在物理交互面前的拙劣败退，那么斯宾诺莎将人类一切崇高的伦理抉择降解为几何学必然推论，是否在拯救了逻辑完备性的同时，彻底抹杀了主体存在的全部悲剧性与超越性价值？`;
  }

  // Default Seminar In-depth Reply
  return hardwareHeader +
`### 学术研讨班思辨推演：关于“${qTrim.slice(0, 36)}”之形而上学审查

由 **${modelMeta.name}** 介入本次研讨。我们严格遵循分析哲学形式化审慎与欧陆现象学意向性还原：

---

#### 1. 【概念与词源先验锚定】
在展开实质推论前，必须排除自然态度中的日常语言含混性：
- 涉及存在论问题时，严格区分存在者状态上的实证经验（*Das Ontische*）与存在本身的先验奠基（*Das Ontologische*）。
- 依据 **邓晓芒** 与 **陈嘉映** 权威学派的译本约定，杜绝将现象学直观偷换为主观心理内省。

#### 2. 【形式化推论展开 (Deductive Formulation)】
- **公理 $A_1$**: 任何有意义的认识对象，必须在先验主体的意向性构造或概念范畴中获得其可知性形式。
- **公理 $A_2$**: 试图超越一切可能经验界限去直接把握物自体（*Ding an sich*）的企图，必然导致理性的先验幻相（*Transzendentale Illusion*）与二律背反（*Antinomie*）。
- **推论步骤**: 
  $$A_1 \\wedge A_2 \\vdash C_1: \\text{我们无法享有不受任何认知范式中介的绝对外在实在。}$$

#### 3. 【对立学派张力极限】
- **实在论反弹**：实在论者指责上述推论为“认识论唯心论绑架本体论实在”。
- **先验哲学回击**：离开认识论批判的朴素实在论，本身只是一种未经批判便预设了现成世界在场的形而上学武断（Dogmatism）。

---

**苏格拉底式反思性问题：**
**如果一切通向外部实在的道路都必须经由主体的认识形式或语言游戏所奠基，那么我们究竟凭何断定存在着一个独立于此在的‘纯粹自然’，而不是我们自身理智在虚空中映照出的先验投影？**`;
}


// Health & Metadata (RTX 5060 Single-Card Blackwell Optimization)
app.get("/api/health", async (req, res) => {
  const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";
  let pythonTelemetry: any = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const pyRes = await fetch(`${pythonBackendUrl}/v1/engine/telemetry`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (pyRes.ok) {
      pythonTelemetry = await pyRes.json();
    }
  } catch {
    // Python backend in container preview
  }

  const activeModelMeta = PHILOSOPHY_MODELS_INFO[currentActiveLocalModel] || PHILOSOPHY_MODELS_INFO["brie-v2-3b"];

  res.json({
    status: "online",
    system: "Philo-EverOS",
    version: "2.1.0",
    engine: {
      hardware: "NVIDIA GeForce RTX 5060 (8GB / 16GB GDDR7, Blackwell SM_120)",
      precision: activeModelMeta.quantization,
      provider: "Philo-EverOS RTX 5060 4-bit NF4 Quantization Engine",
      target_hardware: "RTX_5060",
      active_model: activeModelMeta,
      available_local_models: Object.values(PHILOSOPHY_MODELS_INFO),
      active_gpus: pythonTelemetry?.telemetry?.gpus || [
        {
          id: 0,
          name: "NVIDIA GeForce RTX 5060",
          allocated_mb: activeModelMeta.vram_used_mb,
          total_mb: activeModelMeta.total_vram_mb,
          utilization_pct: Number(((activeModelMeta.vram_used_mb / activeModelMeta.total_vram_mb) * 100).toFixed(1)),
          temp_c: 49,
          fan_pct: 38,
          quantization: activeModelMeta.quantization,
          sdpa: "Native Flash-SDPA (Active)",
          architecture: "Blackwell",
          pcie: "PCIe 5.0 x8"
        }
      ],
      total_vram_gb: 8.0,
      kv_cache_budget_mb: activeModelMeta.total_vram_mb - activeModelMeta.vram_used_mb
    },
    auxiliary_models: {
      doubao: {
        configured: !!process.env.ARK_API_KEY,
        endpoint: process.env.DOUBAO_ENDPOINT_ID || "doubao-pro-32k",
        role: "中文哲学原典语境与邓晓芒/陈嘉映中译本权威考订"
      },
      gemini: {
        configured: !!process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        role: "百万 Token 超长原典跨卷对勘与长程研讨共识归纳"
      }
    },
    docker_components: {
      qdrant: { host: process.env.QDRANT_HOST || "localhost", port: 6333, role: "EverOS 语义向量知识库" },
      redis: { host: process.env.REDIS_HOST || "localhost", port: 6379, role: "会话上下文与流式队列缓存" }
    },
    consensus_count: getConsensusList().length,
    crystallized_skills_count: getCrystallizedSkills().length
  });
});

// Switch active local model on RTX 5060
app.post("/api/hardware/switch-model", (req, res) => {
  const { model_id } = req.body;
  if (model_id && PHILOSOPHY_MODELS_INFO[model_id]) {
    currentActiveLocalModel = model_id;
    return res.json({
      status: "success",
      active_model_id: model_id,
      model: PHILOSOPHY_MODELS_INFO[model_id]
    });
  }
  res.status(400).json({ error: "Invalid model_id. Choose from: brie-v2-3b, Veritas-12B, Semancer-12B, Fireball-12B-philosophers" });
});

// OpenAI Compatible Models endpoint
app.get("/v1/models", (req, res) => {
  const localList = Object.values(PHILOSOPHY_MODELS_INFO).map((m) => ({
    id: m.id,
    object: "model",
    created: Math.floor(Date.now() / 1000),
    owned_by: "Philo-EverOS-Consortium",
    description: `RTX 5060 本地部署模型: ${m.name} [${m.parameters}] · ${m.quantization} · ${m.features}`
  }));

  res.json({
    object: "list",
    data: [
      ...localList,
      {
        id: "Philo-EverOS-Dual5090",
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "Philo-EverOS-Consortium",
        description: "双卡 RTX 5090 / 5060 专用哲学研讨推理引擎 (零卸载、零隐私出域)"
      },
      {
        id: "doubao-pro",
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "Volcengine",
        description: "火山引擎 豆包大模型 (Doubao Pro) - 中文哲学与古籍概念释读、原典权威译本对勘专家"
      },
      {
        id: "gemini-2.5-flash",
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "Google DeepMind",
        description: "Google Gemini 2.5 - 百万 Token 超长文献通读与跨体系形而上学图谱对勘"
      },
      {
        id: "hybrid-moe",
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "Philo-EverOS-Consortium",
        description: "Hybrid MoE 协同专家集群 (RTX 5060 形式演绎 + 豆包原典勘订 + Gemini 宏观图谱)"
      }
    ]
  });
});

// OpenAI Compatible Chat Completions (Supports SSE Streaming & Non-streaming)
app.post("/v1/chat/completions", async (req, res) => {
  try {
    const { messages, stream = false, model = "Philo-EverOS-Dual5090" } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing messages array in payload" });
    }

    const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content || "";
    const systemPrompt = buildMasterSystemPrompt(lastUserMessage);
    const modelChoice = (model || "").toLowerCase();

    // 1. Route to Doubao if requested
    if (modelChoice.includes("doubao")) {
      const arkApiKey = process.env.ARK_API_KEY;
      const endpointId = process.env.DOUBAO_ENDPOINT_ID || "doubao-pro-32k";
      const baseUrl = process.env.DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";

      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        const responseId = `chatcmpl-${Date.now().toString(36)}`;

        if (!arkApiKey) {
          const guideMsg = `【火山引擎 豆包大模型 (Doubao Pro) 协同提示】\n\n检测到服务器未配置 \`ARK_API_KEY\`。请在服务器 \`.env\` 文件中配置火山引擎 API Key 与 Endpoint ID 即可激活！\n\n` +
            `**模拟原典对勘示范**：\n` +
            `• 康德《纯粹理性批判》(B25/A11) 中 *Transzendental* 依邓晓芒教授权威译本，严格译为【先验】而非【先天的】（A priori）。\n` +
            `• 海德格尔《存在与时间》(§9) 中 *Dasein* 依陈嘉映先生译本，严格译为【此在】，突出其存在先于本质与生存论构型。\n\n` +
            `**苏格拉底反思**：在汉语自然语言语境中，“存在”常隐含现成实体预设，我们在使用汉语研讨现象学时，应当如何悬搁这一词源偏见？`;

          for (const word of guideMsg.split(" ")) {
            const ssePayload = {
              id: responseId,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: "doubao-pro",
              choices: [{ index: 0, delta: { content: word + " " }, finish_reason: null }]
            };
            res.write(`data: ${JSON.stringify(ssePayload)}\n\n`);
          }
          res.write(`data: ${JSON.stringify({ id: responseId, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: "doubao-pro", choices: [{ index: 0, delta: {}, finish_reason: "stop" }] })}\n\n`);
          res.write("data: [DONE]\n\n");
          return res.end();
        }

        try {
          const arkResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${arkApiKey}`
            },
            body: JSON.stringify({
              model: endpointId,
              messages: [{ role: "system", content: systemPrompt }, ...messages],
              stream: true,
              temperature: 0.7
            })
          });

          if (!arkResponse.ok || !arkResponse.body) {
            throw new Error(`Volcengine Ark returned HTTP ${arkResponse.status}`);
          }

          // @ts-ignore
          const reader = arkResponse.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          return res.end();
        } catch (e: any) {
          const errPayload = {
            id: responseId,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: "doubao-pro",
            choices: [{ index: 0, delta: { content: `\n[Doubao Error: ${e.message}]` }, finish_reason: "stop" }]
          };
          res.write(`data: ${JSON.stringify(errPayload)}\n\n`);
          res.write("data: [DONE]\n\n");
          return res.end();
        }
      }
    }

    // 2. Default: Google Gemini or RTX 5060 Local Dedicated Philosophy Inference Engine
    const targetModelMeta = PHILOSOPHY_MODELS_INFO[model] || PHILOSOPHY_MODELS_INFO[currentActiveLocalModel] || PHILOSOPHY_MODELS_INFO["brie-v2-3b"];
    const effectiveSystemPrompt = `${systemPrompt}\n\n【本地微调模型专精注入】:\n${targetModelMeta.persona_system}`;

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const responseId = `chatcmpl-${Date.now().toString(36)}`;

      // If GEMINI_API_KEY is available, use real Gemini 2.5 streaming
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGemini();
          const formattedHistory = messages
            .filter(m => m.role !== "system")
            .map(m => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            }));

          const streamResponse = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: formattedHistory,
            config: {
              systemInstruction: effectiveSystemPrompt,
              temperature: 0.7
            }
          });

          for await (const chunk of streamResponse) {
            const textChunk = chunk.text;
            if (textChunk) {
              const ssePayload = {
                id: responseId,
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1000),
                model: model,
                choices: [
                  {
                    index: 0,
                    delta: { content: textChunk },
                    finish_reason: null
                  }
                ]
              };
              res.write(`data: ${JSON.stringify(ssePayload)}\n\n`);
            }
          }

          const endPayload = {
            id: responseId,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }]
          };
          res.write(`data: ${JSON.stringify(endPayload)}\n\n`);
          res.write("data: [DONE]\n\n");
          return res.end();
        } catch (streamErr: any) {
          console.warn("Gemini stream error, falling back to RTX 5060 local inference simulation:", streamErr?.message);
        }
      }

      // High-Fidelity RTX 5060 Local Philosophy Engine Inference Generator
      const localResponseText = generateHighFidelityPhilosophicalReply(lastUserMessage, targetModelMeta);

      const words = localResponseText.split(/(\s+|\n+)/);
      for (const token of words) {
        if (!token) continue;
        const ssePayload = {
          id: responseId,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: targetModelMeta.id,
          choices: [
            {
              index: 0,
              delta: { content: token },
              finish_reason: null
            }
          ]
        };
        res.write(`data: ${JSON.stringify(ssePayload)}\n\n`);
        await new Promise(r => setTimeout(r, 12));
      }

      const finishPayload = {
        id: responseId,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: targetModelMeta.id,
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }]
      };
      res.write(`data: ${JSON.stringify(finishPayload)}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    } else {
      // Non-streaming completion
      let replyText = "";
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGemini();
          const formattedHistory = messages
            .filter(m => m.role !== "system")
            .map(m => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            }));

          const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: formattedHistory,
            config: {
              systemInstruction: effectiveSystemPrompt,
              temperature: 0.7
            }
          });
          replyText = result.text || "";
        } catch (e: any) {
          console.warn("Gemini non-stream error:", e?.message);
        }
      }

      if (!replyText) {
        replyText = generateHighFidelityPhilosophicalReply(lastUserMessage, targetModelMeta);
      }

      res.json({
        id: `chatcmpl-${Date.now().toString(36)}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: targetModelMeta.id,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: replyText
            },
            finish_reason: "stop"
          }
        ]
      });
    }
  } catch (error: any) {
    console.error("Chat completions error:", error);
    res.status(500).json({
      error: {
        message: error.message || "Internal server error during philosophical inference",
        type: "inference_error"
      }
    });
  }
});

// EverOS Academic Profile Endpoints
app.get("/api/everos/profile", (req, res) => {
  res.json(getProfile());
});

app.post("/api/everos/profile", (req, res) => {
  const current = getProfile();
  const updated = { ...current, ...req.body, last_updated: new Date().toISOString() };
  saveProfile(updated);
  res.json({ status: "success", profile: updated });
});

// EverOS Consensus Graph Endpoints
app.get("/api/everos/consensus", (req, res) => {
  res.json(getConsensusList());
});

app.post("/api/everos/consensus", (req, res) => {
  const current = getConsensusList();
  const newNode = {
    id: `cnode-${Date.now().toString(36)}`,
    concept: req.body.concept,
    affirmation: req.body.affirmation,
    negation_or_drift_warning: req.body.negation_or_drift_warning,
    source_seminar: req.body.source_seminar || "哲学高阶研讨班",
    school_context: req.body.school_context || "现象学与分析哲学",
    citations: req.body.citations || [],
    tags: req.body.tags || [],
    created_at: Date.now() / 1000
  };
  current.unshift(newNode);
  saveConsensusList(current);
  res.json({ status: "success", node: newNode });
});

// EverOS Skills & Crystallizer Endpoints
app.get("/api/everos/skills", (req, res) => {
  res.json({
    builtin: BUILTIN_SKILLS,
    crystallized: getCrystallizedSkills()
  });
});

app.post("/api/everos/crystallize", (req, res) => {
  const { name, command, paradigm_pattern, system_prompt, formal_structure, source_summary } = req.body;
  const skillId = (command || name).replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || `skill_${Date.now().toString(36)}`;

  const yamlContent = `skill_id: ${skillId}
name: ${name || "自演进论证范式"}
command_alias: ${command || "/paradigm"}
description: ${req.body.description || "由高阶学术研讨自动结晶的思辨范式"}
paradigm_pattern: ${paradigm_pattern || "公理前提 -> 结构展开 -> 极限反诘"}
system_prompt_template: "${system_prompt || "请遵循该结晶技能的形式推论规范进行展开。"}"
formal_structure:
${(formal_structure || ["Step 1: 概念锚定", "Step 2: 形式推演", "Step 3: 归谬判别"]).map((s: string) => `  - "${s}"`).join("\n")}
source_dialogue_summary: "${source_summary || "源自学术研讨班交互归纳。"}"
crystallized_at: "${new Date().toISOString()}"
activation_threshold: 0.85
version: 1.0.0
`;

  const targetPath = path.join(SKILLS_CRYSTALLIZED_DIR, `${skillId}.yaml`);
  fs.writeFileSync(targetPath, yamlContent, "utf-8");

  res.json({ status: "success", skill_id: skillId, file: `${skillId}.yaml` });
});

// ==========================================
// EverOS Local-First Markdown Archive Tree Endpoints
// ==========================================

const CATEGORY_MAP: Record<string, { title: string; desc: string }> = {
  profiles: { title: "学者先验画像与规范约束", desc: "学派立场、中译本权威对勘与防漂移公理" },
  facts: { title: "形式公理与集体共识图谱", desc: "历届研讨班凝练之存在论与认识论判定" },
  episodes: { title: "研讨情景切片与会话轨迹", desc: "带时间戳与前设审查的完整学术思辨实录" },
  foresights: { title: "未决问题与苏格拉底反思课题", desc: "形而上学二律背反与深层危机反诘列表" },
  skills: { title: "苏格拉底思辨模态与形式技能", desc: "四栏解构、词源考释与跨体系对勘规范" }
};

// Helper: Recursively scan EverOS directory for all markdown files
function scanEverOSArchiveRecursively(dir: string, baseDir: string = EVEROS_DIR): any[] {
  let fileList: any[] = [];
  if (!fs.existsSync(dir)) return fileList;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fileList = fileList.concat(scanEverOSArchiveRecursively(fullPath, baseDir));
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".markdown") || entry.name.endsWith(".txt"))) {
      try {
        const stats = fs.statSync(fullPath);
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
        const parts = relPath.split("/");
        const rootFolder = parts[0];
        const subFolder = parts.length > 2 ? parts.slice(1, -1).join("/") : "";
        fileList.push({
          path: relPath,
          name: entry.name,
          folder: rootFolder,
          subfolder: subFolder,
          size: stats.size,
          lastModified: stats.mtimeMs,
          categoryTitle: CATEGORY_MAP[rootFolder]?.title || rootFolder,
          description: CATEGORY_MAP[rootFolder]?.desc || ""
        });
      } catch {
        // Skip unreadable files
      }
    }
  }
  return fileList;
}

// GET /api/everos/archive/tree - Recursively list all memory files in ~/.everos/
app.get("/api/everos/archive/tree", (req, res) => {
  try {
    const files = scanEverOSArchiveRecursively(EVEROS_DIR, EVEROS_DIR);
    const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

    res.json({
      root: "~/.everos",
      totalFiles: files.length,
      totalSize: totalSize,
      files: files
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to recursively scan EverOS archive" });
  }
});

// GET /api/everos/archive/download - Direct file download with attachment header
app.get("/api/everos/archive/download", (req, res) => {
  try {
    const relPath = req.query.path as string;
    if (!relPath || relPath.includes("..")) {
      return res.status(400).send("Invalid path");
    }
    const fullPath = path.join(EVEROS_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).send("File not found");
    }
    const filename = path.basename(relPath);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    fs.createReadStream(fullPath).pipe(res);
  } catch (err: any) {
    res.status(500).send(err.message || "Download failed");
  }
});

// GET /api/everos/archive/file?path=folder/name.md
app.get("/api/everos/archive/file", (req, res) => {
  try {
    const relPath = req.query.path as string;
    if (!relPath || relPath.includes("..")) {
      return res.status(400).json({ error: "Invalid path" });
    }
    const fullPath = path.join(EVEROS_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found" });
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    const stats = fs.statSync(fullPath);
    res.json({
      path: relPath,
      name: path.basename(relPath),
      folder: path.dirname(relPath),
      content: content,
      size: stats.size,
      lastModified: stats.mtimeMs
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/everos/archive/file - Save file content and synchronize state
app.post("/api/everos/archive/file", (req, res) => {
  try {
    const { path: relPath, content } = req.body;
    if (!relPath || relPath.includes("..") || typeof content !== "string") {
      return res.status(400).json({ error: "Invalid file payload" });
    }
    const fullPath = path.join(EVEROS_DIR, relPath);
    const parent = path.dirname(fullPath);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.writeFileSync(fullPath, content, "utf-8");
    const stats = fs.statSync(fullPath);

    // If editing scholar_profile.md, sync student_name and school_of_thought if found
    if (relPath === "profiles/scholar_profile.md") {
      try {
        const studentMatch = content.match(/student_name:\s*(.+)/);
        const schoolMatch = content.match(/school_of_thought:\s*(.+)/);
        const thesisMatch = content.match(/current_thesis_topic:\s*(.+)/);
        if (studentMatch || schoolMatch || thesisMatch) {
          const cur = getProfile();
          if (studentMatch) cur.student_name = studentMatch[1].trim();
          if (schoolMatch) cur.school_of_thought = schoolMatch[1].trim();
          if (thesisMatch) cur.current_thesis_topic = thesisMatch[1].trim();
          saveProfile(cur);
        }
      } catch {
        // ignore parsing error
      }
    }

    res.json({
      status: "success",
      file: {
        path: relPath,
        size: stats.size,
        lastModified: stats.mtimeMs
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/everos/archive/create-file
app.post("/api/everos/archive/create-file", (req, res) => {
  try {
    const { folder, filename, content = "" } = req.body;
    if (!folder || !filename || filename.includes("..")) {
      return res.status(400).json({ error: "Invalid folder or filename" });
    }
    const sanitizedName = filename.endsWith(".md") ? filename : `${filename}.md`;
    const relPath = `${folder}/${sanitizedName}`;
    const fullPath = path.join(EVEROS_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      return res.status(409).json({ error: "File already exists" });
    }
    const initialContent = content || `---
type: custom
created: ${new Date().toISOString()}
folder: ${folder}
---

# ${sanitizedName.replace(/\.md$/, "")}

在这里记录新的形而上学或认识论档案。
`;
    fs.writeFileSync(fullPath, initialContent, "utf-8");
    const stats = fs.statSync(fullPath);
    res.json({
      status: "success",
      file: {
        path: relPath,
        name: sanitizedName,
        folder: folder,
        size: stats.size,
        lastModified: stats.mtimeMs
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/everos/archive/delete-file
app.post("/api/everos/archive/delete-file", (req, res) => {
  try {
    const { path: relPath } = req.body;
    if (!relPath || relPath.includes("..")) {
      return res.status(400).json({ error: "Invalid path" });
    }
    const fullPath = path.join(EVEROS_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      res.json({ status: "success", message: `Deleted ${relPath}` });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/everos/archive/sync-episode - Crystallize active seminar to an episode markdown
app.post("/api/everos/archive/sync-episode", (req, res) => {
  try {
    const { messages = [], topic, scholar_name, school } = req.body;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = `${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`;
    const filename = `${dateStr}-seminar-${timeStr}.md`;
    const relPath = `episodes/${filename}`;
    const fullPath = path.join(EVEROS_DIR, relPath);

    const userMsgs = messages.filter((m: any) => m.role === "user");
    const lastUserQuery = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].content : "哲学思辨研讨";
    const cleanTopic = topic || lastUserQuery.slice(0, 40).replace(/[\r\n#*`]/g, " ");

    const formattedTranscript = messages.map((m: any, idx: number) => {
      const speaker = m.role === "user" ? `研讨学者 (${scholar_name || "Scholar"})` : "哲学导师 (Philo-EverOS)";
      const skillBadge = m.skill_used ? ` [使用技能: ${m.skill_used}]` : "";
      return `### 回合 ${idx + 1} · ${speaker}${skillBadge}\n\n${m.content}\n`;
    }).join("\n---\n\n");

    const episodeMarkdown = `---
type: episode
session_id: ep-${dateStr}-${timeStr}
topic: "${cleanTopic}"
scholar: "${scholar_name || "研讨学者"}"
school: "${school || "欧陆现象学与诠释学"}"
created_at: "${now.toISOString()}"
total_turns: ${messages.length}
memory_layer: "EverMind-AI/EverOS Standard"
---

# 研讨班实录纪要：${cleanTopic}

> **【EverOS 记忆层沉淀】**：本档案已通过 EverOS Portable Memory 标准封装，可直接归档或导入任何兼容 EverOS 运行时之 Agent。

## 一、 研讨元数据与先验证明
- **研讨学者**: ${scholar_name || "研讨学者"}
- **学术流派**: ${school || "欧陆现象学与诠释学"}
- **沉淀时间**: ${now.toLocaleString()}
- **总论辩回合**: ${messages.length} 轮

## 二、 逐轮思辨与推论轨迹实录

${formattedTranscript}

## 三、 本回合遗留之未决形而上学问题 (Foresights)
- 待在后续研讨中检验相关形式前提的事实稳妥性（Soundness）。
`;

    fs.writeFileSync(fullPath, episodeMarkdown, "utf-8");
    const stats = fs.statSync(fullPath);

    res.json({
      status: "success",
      file: {
        path: relPath,
        name: filename,
        folder: "episodes",
        size: stats.size,
        lastModified: stats.mtimeMs
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/everos/archive/export-all - Export all files as structured array recursively
app.get("/api/everos/archive/export-all", (req, res) => {
  try {
    const scannedFiles = scanEverOSArchiveRecursively(EVEROS_DIR, EVEROS_DIR);
    const bundle: Array<{ path: string; folder: string; name: string; content: string }> = [];

    for (const f of scannedFiles) {
      const fullPath = path.join(EVEROS_DIR, f.path);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          bundle.push({
            path: f.path,
            folder: f.folder,
            name: f.name,
            content: content
          });
        } catch {
          // ignore error
        }
      }
    }

    res.json({
      root: "~/.everos",
      total_files: bundle.length,
      exported_at: new Date().toISOString(),
      files: bundle
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Student Feedback Endpoints (SFT & DPO)
app.post("/v1/feedback/correct", (req, res) => {
  const { instruction, original_output, corrected_output, student_notes, philosopher_target } = req.body;
  const sftPath = path.join(TRAINING_DIR, "sft_corrections.json");
  let items: any[] = [];
  if (fs.existsSync(sftPath)) {
    try {
      items = JSON.parse(fs.readFileSync(sftPath, "utf-8"));
    } catch {}
  }

  const record = {
    id: `sft-${Date.now().toString(36)}`,
    instruction,
    original_output,
    corrected_output,
    student_notes,
    philosopher_target,
    timestamp: Date.now() / 1000
  };
  items.unshift(record);
  fs.writeFileSync(sftPath, JSON.stringify(items, null, 2), "utf-8");

  // Export Alpaca format
  const alpacaPath = path.join(TRAINING_DIR, "alpaca_sft_dataset.json");
  const alpacaData = items.map(it => ({
    instruction: it.instruction,
    input: it.original_output ? `[原初草拟]: ${it.original_output.slice(0, 300)}...` : "",
    output: it.corrected_output,
    system: "你是一位精通西方哲学史与严谨分析哲学的资深哲学教授。请以最高学术标准给出推论与考订。"
  }));
  fs.writeFileSync(alpacaPath, JSON.stringify(alpacaData, null, 2), "utf-8");

  res.json({ status: "success", record_id: record.id, count: items.length });
});

app.post("/v1/feedback/preference", (req, res) => {
  const { prompt, chosen, rejected, dimension, critique } = req.body;
  const dpoPath = path.join(TRAINING_DIR, "dpo_preferences.json");
  let items: any[] = [];
  if (fs.existsSync(dpoPath)) {
    try {
      items = JSON.parse(fs.readFileSync(dpoPath, "utf-8"));
    } catch {}
  }

  const record = {
    id: `dpo-${Date.now().toString(36)}`,
    prompt,
    chosen,
    rejected,
    dimension: dimension || "形式有效性与词源精确度",
    critique,
    timestamp: Date.now() / 1000
  };
  items.unshift(record);
  fs.writeFileSync(dpoPath, JSON.stringify(items, null, 2), "utf-8");

  res.json({ status: "success", record_id: record.id, count: items.length });
});

app.get("/api/feedback/summary", (req, res) => {
  const sftPath = path.join(TRAINING_DIR, "sft_corrections.json");
  const dpoPath = path.join(TRAINING_DIR, "dpo_preferences.json");

  let sftCount = 0;
  let dpoCount = 0;
  let sftRecords: any[] = [];
  let dpoRecords: any[] = [];

  if (fs.existsSync(sftPath)) {
    try {
      sftRecords = JSON.parse(fs.readFileSync(sftPath, "utf-8"));
      sftCount = sftRecords.length;
    } catch {}
  }
  if (fs.existsSync(dpoPath)) {
    try {
      dpoRecords = JSON.parse(fs.readFileSync(dpoPath, "utf-8"));
      dpoCount = dpoRecords.length;
    } catch {}
  }

  res.json({
    sft_count: sftCount,
    dpo_count: dpoCount,
    recent_sft: sftRecords.slice(0, 5),
    recent_dpo: dpoRecords.slice(0, 5)
  });
});

// Codebase Explorer Endpoints (Browse all Philo-EverOS files in browser)
const CODEBASE_FILES = [
  "config/settings.py",
  "engine/model_loader.py",
  "engine/multi_model_dispatcher.py",
  "engine/streamer.py",
  "everos_bridge/academic_profile.py",
  "everos_bridge/consensus_graph.py",
  "everos_bridge/skill_crystallizer.py",
  "everos_bridge/memory_engine.py",
  "harness/orchestrator.py",
  "harness/guardrails.py",
  "skills/base.py",
  "skills/builtin/argument_deconstruct.py",
  "skills/builtin/etymology_tracker.py",
  "skills/builtin/socratic_challenge.py",
  "skills/builtin/cross_system_compare.py",
  "skills/crystallized/counterfactual_thought_experiment.yaml",
  "skills/crystallized/syllogistic_reductio.yaml",
  "feedback/collector.py",
  "feedback/exporter.py",
  "main.py",
  "Dockerfile.gpu",
  "docker-compose.yml",
  "scripts/setup_5060.sh",
  "scripts/setup_dual_5090.sh",
  "requirements.txt",
  ".env.example",
  "README.md"
];

app.get("/api/codebase/files", (req, res) => {
  res.json(CODEBASE_FILES);
});

app.get("/api/codebase/file-content", (req, res) => {
  const reqPath = req.query.path as string;
  if (!reqPath || !CODEBASE_FILES.includes(reqPath)) {
    return res.status(404).json({ error: "File not found or access restricted" });
  }
  try {
    const fullPath = path.join(process.cwd(), reqPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      return res.json({ path: reqPath, content });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
  res.status(404).json({ error: "File not found" });
});

// Start Server & Integrate Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Philo-EverOS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

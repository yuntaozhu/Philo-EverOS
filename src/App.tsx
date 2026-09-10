import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SeminarTerminal } from "./components/SeminarTerminal";
import { EverOSMemoryView } from "./components/EverOSMemoryView";
import { SkillCrystallizerView } from "./components/SkillCrystallizerView";
import { HardwareEngineView } from "./components/HardwareEngineView";
import { FeedbackAlignmentView } from "./components/FeedbackAlignmentView";
import { CodebaseExplorerView } from "./components/CodebaseExplorerView";
import { SFTModal } from "./components/SFTModal";
import { DPOModal } from "./components/DPOModal";
import { 
  AcademicProfile, 
  ConsensusNode, 
  BuiltinSkill, 
  CrystallizedSkillItem, 
  ChatMessage 
} from "./types";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("seminar");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "demo-usr-1",
      role: "user",
      content: "/compare 请对勘康德先验哲学与海德格尔此在生存论：先验认识如何避免被降解为心理学主体，此在如何克服现成存在的遮蔽？",
      timestamp: Date.now() - 120000,
      skill_used: "/compare"
    },
    {
      id: "demo-ast-1",
      role: "assistant",
      content: `### 康德先验认识论 vs 海德格尔基础存在论之不可调和张力对勘

本轮研讨将严格基于 **EverOS 长期共识图谱** 与 **经典文献原典**，审查两位思想家在“本体论奠基”上的根本断裂：

---

#### 1. 【认识论奠基之断裂：先验主体性 vs 在世界之中存在】
- **康德的先验反思体系**：
  在《纯粹理性批判》(B25/A11) 中，康德严格界定了 **先验**（*Transzendental*）：“我把一切不是关涉于对象，而是关涉于我们关于对象的认识方式的认识，都称为先验的。”
  在知性纯粹概念的先验演绎 (§16, B132) 中，**先验统觉**（*Transzendentale Apperzeption*）的“我思”（*Ich denke*）构成了统摄一切表象的形式条件。按照 **邓晓芒译本** 的严格学术勘订，先验绝非心理学主观内省，而是使客体经验得以可能的纯形式公理。
- **海德格尔的此在生存论解构**：
  海德格尔在《存在与时间》(§9) 斩钉截铁地指出：“**此在**（*Dasein*）的‘本质’在于它的生存（*Existenz*）。”此在向来是我的存在（*Jemeinigkeit*），绝非笛卡尔的思维实体（*Res cogitans*），亦非康德高悬于经验之上的孤立知性先验主体。按照 **陈嘉映译本** 考订，此在的原初存在形态是 **在世界之中存在**（*In-der-Welt-sein*）。

---

#### 2. 【对立体系张力与概念漂移防线 (Anti-Drift Guardrails)】
| 比较维度 | 康德批判唯心论 (Kant) | 海德格尔基础存在论 (Heidegger) | 形而上学不可调和断裂点 |
| :--- | :--- | :--- | :--- |
| **第一奠基承诺** | 先验统觉的综合统一（形式认知条件） | 此在对存在的领会与时间性（生存论境域） | **主客二分 vs 存在先行** |
| **世界的存在形态** | 现象界（直观无概念则盲，思想无内容则空） | 周围世界中的 **上手** 与 **现成存在** (*Vorhandenheit*) | **认识论对象化 vs 生存论用具因缘** |
| **现象学检验标准** | 符合先天纯粹范畴与可能经验之界限 | **无蔽** (*Aletheia*) 去蔽争得与纯粹 **意向充实** | **形式合法性 vs 存在实存性** |

> **【EverOS 长期记忆库共识警示】**：
> 研讨学者在推演中务必严守防线：**严禁将此在（Dasein）降解为经验心理学主体或生物人**，亦 **杜绝将现成存在（Vorhandenheit）错置为原初本体论开端**。理论凝视中的客体主客对立，本身即是此在沉沦于世界、遮蔽用具指引链后的派生视差。

---

**苏格拉底式反思性问题：**
若康德的先验统觉纯粹作为逻辑与形式的综合机能，它本身究竟是否具有时间性？若它脱离了时间直观形式便无法被把握，则这一“无时间的先验主体”与海德格尔源初的“向死存在之时间性（Zeitlichkeit）”相比，究竟是一场先验错觉，还是形而上学不可逾越的理性极限？`,
      timestamp: Date.now() - 60000,
      skill_used: "/compare"
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // EverOS State
  const [profile, setProfile] = useState<AcademicProfile>({
    user_id: "default_scholar",
    student_name: "研讨学者 (Scholar)",
    school_of_thought: "欧陆现象学与诠释学",
    translation_alignments: {
      "康德 (Kant)": "邓晓芒译本 (严格对勘先验 Transcendental vs 先天 A priori)",
      "海德格尔 (Heidegger)": "陈嘉映/王庆节译本 (严分此在 Dasein 与现成存在 Vorhandenheit)",
      "胡塞尔 (Husserl)": "倪梁康译本 (纯粹意向充实与现象学悬搁)",
      "维特根斯坦 (Wittgenstein)": "韩林合译本 (命题图像论与生活形式语言游戏)"
    },
    current_thesis_topic: "海德格尔时间性（Zeitlichkeit）与斯宾诺莎实体（Substantia）的本体论对话",
    concept_anchors: {
      "Transcendental": "严格译为【先验】（使一切经验成为可能的形式条件），拒绝译为【先天的】混淆",
      "Dasein": "统一使用【此在】并标注德文原词，严禁降解为心理学主体或经验生物人",
      "Ousia": "希腊语 Οὐσία 辨析：第一本体（个别存在）与第二本体（种与属）之形而上学断裂",
      "Aufhebung": "黑格尔辩证法核心术语【扬弃】：同时包含否定、保存与提升三重张力"
    },
    last_updated: new Date().toISOString()
  });

  const [consensusList, setConsensusList] = useState<ConsensusNode[]>([]);
  const [builtinSkills, setBuiltinSkills] = useState<BuiltinSkill[]>([]);
  const [crystallizedSkills, setCrystallizedSkills] = useState<CrystallizedSkillItem[]>([]);

  // Modals state
  const [sftModalOpen, setSftModalOpen] = useState(false);
  const [sftInstruction, setSftInstruction] = useState("");
  const [sftOutput, setSftOutput] = useState("");

  const [dpoModalOpen, setDpoModalOpen] = useState(false);
  const [dpoPrompt, setDpoPrompt] = useState("");
  const [dpoOutput, setDpoOutput] = useState("");

  // Initial Data Fetch
  useEffect(() => {
    fetchProfile();
    fetchConsensus();
    fetchSkills();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/everos/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConsensus = async () => {
    try {
      const res = await fetch("/api/everos/consensus");
      if (res.ok) {
        const data = await res.json();
        setConsensusList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/everos/skills");
      if (res.ok) {
        const data = await res.json();
        setBuiltinSkills(data.builtin || []);
        setCrystallizedSkills(data.crystallized || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Chat message sending with SSE stream reading
  const handleSendMessage = async (content: string, skillPrefix?: string, model?: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now().toString(36)}`,
      role: "user",
      content: content,
      timestamp: Date.now(),
      skill_used: skillPrefix || undefined
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    const assistantMsgId = `ast-${Date.now().toString(36)}`;
    const placeholderAssistant: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: Date.now()
    };
    setMessages([...newHistory, placeholderAssistant]);

    try {
      const response = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model || "Philo-EverOS-Dual5090",
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response stream body available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              const deltaContent = parsed.choices?.[0]?.delta?.content;
              if (deltaContent) {
                accumulatedText += deltaContent;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
                  )
                );
              }
            } catch {
              // ignore partial json chunk
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Inference request failed:", err);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: `[学术研讨中断]: ${err.message || "请求异常"}` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (updated: Partial<AcademicProfile>) => {
    try {
      const res = await fetch("/api/everos/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddConsensus = async (node: Partial<ConsensusNode>) => {
    try {
      const res = await fetch("/api/everos/consensus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(node)
      });
      if (res.ok) {
        fetchConsensus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCrystallizeNew = async (payload: any) => {
    try {
      const res = await fetch("/api/everos/crystallize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchSkills();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenSFT = (instruction: string, output: string) => {
    setSftInstruction(instruction);
    setSftOutput(output);
    setSftModalOpen(true);
  };

  const handleOpenDPO = (prompt: string, output: string) => {
    setDpoPrompt(prompt);
    setDpoOutput(output);
    setDpoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        consensusCount={consensusList.length}
        crystallizedCount={crystallizedSkills.length}
      />

      <main className="flex-1 p-4 sm:p-6">
        {activeTab === "seminar" && (
          <SeminarTerminal
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onOpenSFT={handleOpenSFT}
            onOpenDPO={handleOpenDPO}
            onAddConsensus={(concept, aff, warn) =>
              handleAddConsensus({
                concept,
                affirmation: aff,
                negation_or_drift_warning: warn,
                source_seminar: "研讨终端交互沉淀",
                school_context: profile.school_of_thought
              })
            }
            consensusList={consensusList}
            profile={profile}
          />
        )}

        {activeTab === "memory" && (
          <EverOSMemoryView
            profile={profile}
            consensusList={consensusList}
            onUpdateProfile={handleUpdateProfile}
            onAddConsensus={handleAddConsensus}
            messages={messages}
            onRefreshConsensus={fetchConsensus}
            onRefreshProfile={fetchProfile}
          />
        )}

        {activeTab === "crystallizer" && (
          <SkillCrystallizerView
            builtinSkills={builtinSkills}
            crystallizedSkills={crystallizedSkills}
            onCrystallizeNew={handleCrystallizeNew}
          />
        )}

        {activeTab === "hardware" && <HardwareEngineView />}

        {activeTab === "feedback" && <FeedbackAlignmentView />}

        {activeTab === "codebase" && <CodebaseExplorerView />}
      </main>

      {/* SFT Correction Modal */}
      <SFTModal
        isOpen={sftModalOpen}
        onClose={() => setSftModalOpen(false)}
        instruction={sftInstruction}
        originalOutput={sftOutput}
        onSuccess={() => {}}
      />

      {/* DPO Preference Modal */}
      <DPOModal
        isOpen={dpoModalOpen}
        onClose={() => setDpoModalOpen(false)}
        prompt={dpoPrompt}
        currentOutput={dpoOutput}
        onSuccess={() => {}}
      />
    </div>
  );
}

export default App;

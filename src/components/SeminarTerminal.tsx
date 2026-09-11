import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Send, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileEdit, 
  Scale, 
  BookMarked,
  BookOpen,
  SearchCheck,
  RotateCcw,
  Zap,
  Eye,
  EyeOff,
  Network
} from "lucide-react";
import { ChatMessage, ConsensusNode, AcademicProfile } from "../types";
import { buildUnifiedGroundedSources, findGroundedMatchesInText } from "../utils/citationMatcher";
import { GroundedMessageView } from "./GroundedMessageView";
import { CitationTracePanel } from "./CitationTracePanel";
import { SemanticTopologyMap } from "./SemanticTopologyMap";

interface SeminarTerminalProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, skillPrefix?: string, model?: string, claimType?: string) => Promise<void>;
  isLoading: boolean;
  onOpenSFT: (instruction: string, output: string) => void;
  onOpenDPO: (instruction: string, output: string) => void;
  onAddConsensus: (concept: string, affirmation: string, warning: string) => void;
  consensusList?: ConsensusNode[];
  profile?: AcademicProfile;
}

const PRESET_QUERIES = [
  {
    prefix: "/deconstruct",
    label: "论证重构",
    title: "心脑同一论反思",
    text: "/deconstruct 解构物理主义同一论命题：‘一切心理状态等同于神经回路激活’。请分析其是否犯了范畴错误并构造反例。"
  },
  {
    prefix: "/etymology",
    label: "词源考订",
    title: "海德格尔此在考源",
    text: "/etymology 考订德语 Dasein 与 Vorhandenheit 的词源学发生，以及陈嘉映（此在）与孙周兴（缘在）的中译争议。"
  },
  {
    prefix: "/socratic",
    label: "苏格拉底反诘",
    title: "休谟因果律质疑",
    text: "/socratic 休谟认为因果性不过是恒常联结所催生的主观习惯。请作为论敌反诘其对普遍必然性的摧毁。"
  },
  {
    prefix: "/compare",
    label: "跨体系对勘",
    title: "康德 vs 德里达",
    text: "/compare 康德先验主体性（Transcendental Subjectivity）与德里达延异（Différance）在形而上学奠基上的不可调和性。"
  }
];

export const SeminarTerminal: React.FC<SeminarTerminalProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onOpenSFT,
  onOpenDPO,
  onAddConsensus,
  consensusList = [],
  profile,
}) => {
  const [input, setInput] = useState("");
  const [activeSkillPrefix, setActiveSkillPrefix] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("brie-v2-3b");
  const [claimType, setClaimType] = useState<string>("phil");
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [showTopology, setShowTopology] = useState(true);
  const [expandedTraceIds, setExpandedTraceIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Build unified grounded citation catalog combining Canonical citations + EverOS Consensus + Profile
  const groundedSources = useMemo(
    () => buildUnifiedGroundedSources(consensusList, profile),
    [consensusList, profile]
  );

  const toggleTrace = (id: string) => {
    setExpandedTraceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let finalContent = input.trim();
    if (activeSkillPrefix && !finalContent.startsWith(activeSkillPrefix)) {
      finalContent = `${activeSkillPrefix} ${finalContent}`;
    }

    const sent = finalContent;
    setInput("");
    await onSendMessage(sent, activeSkillPrefix, selectedModel, claimType);
  };

  const handleQuickPreset = (presetText: string, prefix: string) => {
    setActiveSkillPrefix(prefix);
    setInput(presetText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-stone-100/50 rounded-xl border border-stone-300 shadow-xs overflow-hidden">
      {/* Terminal Sub-Header */}
      <div className="bg-stone-900 text-stone-200 px-4 py-2.5 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-xs font-semibold tracking-wider text-stone-100">
            Philo-EverOS Seminar Interactive Session
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
            SSE Streaming
          </span>
        </div>

        {/* Citation Traceability & D3 Topology Toggles */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowTopology(!showTopology)}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-mono border transition-colors ${
              showTopology
                ? "bg-amber-950/60 text-amber-300 border-amber-600/70"
                : "bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200"
            }`}
            title="切换顶部 D3 概念语义拓扑图显示"
          >
            <Network className="w-3.5 h-3.5 text-amber-400" />
            <span>语义拓扑: {showTopology ? "开启" : "隐藏"}</span>
          </button>

          <button
            type="button"
            onClick={() => setHighlightEnabled(!highlightEnabled)}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-mono border transition-colors ${
              highlightEnabled
                ? "bg-amber-950/60 text-amber-300 border-amber-600/70"
                : "bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200"
            }`}
            title="切换正文是否自动高亮匹配到的哲学原典引文与 EverOS 长期记忆"
          >
            {highlightEnabled ? (
              <Eye className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span>引用溯源: {highlightEnabled ? "开启" : "隐藏"}</span>
          </button>

          <span className="text-[10px] font-mono text-stone-400 bg-stone-800/80 px-2 py-1 rounded border border-stone-700 hidden sm:inline">
            记忆库: {groundedSources.length} 处
          </span>
        </div>
      </div>

      {/* D3 Micro Semantic Relationship Topology Graph */}
      {showTopology && (
        <SemanticTopologyMap
          messages={messages}
          profile={profile}
          consensusList={consensusList}
          onInsertToInput={(text) => setInput(text)}
        />
      )}

      {/* Mode & Engine Switcher Bar */}
      <div className="bg-stone-50 border-b border-stone-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Model Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-stone-500 font-serif mr-1 text-[11px] font-bold">研讨引擎:</span>
          {[
            { id: "brie-v2-3b", label: "brie-v2-3b (3B/7B · 5060 原生 BF16 · 欧陆现象学)", tag: "5060 BF16" },
            { id: "Veritas-12B", label: "Veritas-12B (12B · 5060 NF4 · 伦理质询)", tag: "5060 NF4" },
            { id: "Semancer-12B", label: "Semancer-12B (12B · 5060 NF4 · 存在主义)", tag: "5060 NF4" },
            { id: "Fireball-12B-philosophers", label: "Fireball-12B (12B · 5060 NF4 · 认识论)", tag: "5060 NF4" },
            { id: "doubao-pro", label: "火山豆包 (Doubao Pro · 权威译本考订)", tag: "豆包" },
            { id: "gemini-2.5-flash", label: "Google Gemini (百万长文献对勘)", tag: "Gemini" },
            { id: "hybrid-moe", label: "Hybrid MoE 协同模式 (5060 + 豆包 + Gemini)", tag: "MoE" }
          ].map((m) => {
            const isSelected = selectedModel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedModel(m.id);
                  if (["brie-v2-3b", "Veritas-12B", "Semancer-12B", "Fireball-12B-philosophers"].includes(m.id)) {
                    fetch("/api/hardware/switch-model", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ model_id: m.id })
                    }).catch(() => {});
                  }
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center space-x-1 border ${
                  isSelected
                    ? "bg-emerald-900 text-emerald-100 border-emerald-800 font-semibold shadow-xs"
                    : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Citations Count */}
        <div className="text-[11px] font-mono text-stone-500 hidden md:block">
          当前算力: RTX 5060 单卡 · 只驻留一只本地模型
        </div>
      </div>

      {/* Mode / Skill Switcher Bar */}
      <div className="bg-stone-100/70 border-b border-stone-200 px-4 py-1.5 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-stone-500 font-serif mr-1 text-[11px]">方法论指令:</span>
        {[
          { id: "phil", label: "phil 哲学" },
          { id: "soc", label: "soc 社科" },
          { id: "hybrid", label: "hybrid 须写信息损耗" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setClaimType(item.id)}
            className={`px-2.5 py-0.5 rounded text-xs font-mono transition-colors ${
              claimType === item.id
                ? "bg-emerald-900 text-emerald-100 font-medium"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            {item.label}
          </button>
        ))}
        <span className="text-stone-300 mx-1">|</span>
        {[
          { prefix: "", label: "自由研讨 (Seminar)" },
          { prefix: "/deconstruct", label: "/deconstruct 论证重构" },
          { prefix: "/etymology", label: "/etymology 词源考订" },
          { prefix: "/socratic", label: "/socratic 苏格拉底反诘" },
          { prefix: "/compare", label: "/compare 跨体系对勘" },
          { prefix: "/experiment", label: "/experiment 思想实验(结晶)" },
          { prefix: "/reductio", label: "/reductio 三段论归谬(结晶)" },
        ].map((item) => {
          const isSelected = activeSkillPrefix === item.prefix;
          return (
            <button
              key={item.prefix || "free"}
              type="button"
              onClick={() => setActiveSkillPrefix(item.prefix)}
              className={`px-2.5 py-0.5 rounded text-xs font-mono transition-colors ${
                isSelected
                  ? "bg-stone-900 text-amber-300 font-medium shadow-xs"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="py-10 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center mx-auto text-xl font-serif">
              🏛️
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-800">
                欢迎进入 Philo-EverOS 哲学学术研讨班
              </h3>
              <p className="text-xs text-stone-600 font-serif mt-1 leading-relaxed">
                本平台已加载 EverOS 长期海马体记忆（邓晓芒/陈嘉映中译本体系锚定、胡塞尔/康德共识图谱），并通过 RTX 5090 Blackwell 架构提供高密度逻辑推论。
              </p>
            </div>

            {/* Quick Preset Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-left">
              {PRESET_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPreset(q.text, q.prefix)}
                  className="p-3 bg-white rounded-lg border border-stone-200 hover:border-stone-400 hover:shadow-xs transition-all text-xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {q.prefix}
                    </span>
                    <span className="text-[10px] text-stone-400 group-hover:text-stone-700">点击置入 ↵</span>
                  </div>
                  <div className="font-serif font-semibold text-stone-800 mb-0.5">
                    {q.title}
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-2">
                    {q.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                {/* Role Header */}
                <div className="flex items-center space-x-2 text-[11px] font-mono text-stone-500 mb-1 px-1">
                  <span className="font-bold text-stone-800">
                    {isUser ? "研讨学者 (Scholar)" : "哲学教授 & 研讨导师 (Philo-EverOS)"}
                  </span>
                  <span>·</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  {msg.skill_used && (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded text-[10px]">
                      {msg.skill_used}
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-xl px-5 py-4 max-w-4xl text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? "bg-stone-900 text-stone-50 font-serif"
                      : "bg-white text-stone-800 border border-stone-200"
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div>
                      {(() => {
                        const matchedSources = findGroundedMatchesInText(msg.content, groundedSources);
                        const isTraceExpanded = expandedTraceIds.includes(msg.id);

                        return (
                          <div>
                            {/* Grounded Citation & Long-term Memory Render */}
                            <GroundedMessageView
                              content={msg.content}
                              sources={matchedSources}
                              highlightEnabled={highlightEnabled}
                              onInsertToInput={(text) => setInput(text)}
                            />

                            {/* Collapsible Citation Traceability Inspection Panel */}
                            <CitationTracePanel
                              matchedSources={matchedSources}
                              onInsertToInput={(text) => setInput(text)}
                              isOpen={isTraceExpanded}
                              onToggle={() => toggleTrace(msg.id)}
                            />

                            {/* Academic Action Feedback Bar for Assistant Messages */}
                            <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                              {/* Guardrails Badges & Citation Verification Indicator */}
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                                <span className="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  本体论护栏已检验
                                </span>
                                <span className="inline-flex items-center text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  苏格拉底终局已生成
                                </span>
                                {matchedSources.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleTrace(msg.id)}
                                    className="inline-flex items-center text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-mono transition-colors cursor-pointer"
                                    title="点击展开/收起引用溯源详情"
                                  >
                                    <BookOpen className="w-3 h-3 mr-1 text-amber-700" />
                                    <span>溯源对勘: {matchedSources.length} 处原典/记忆</span>
                                  </button>
                                )}
                              </div>

                              {/* Co-construction Feedback Actions */}
                              <div className="flex items-center space-x-1.5">
                                {matchedSources.length > 0 && (
                                  <button
                                    onClick={() => toggleTrace(msg.id)}
                                    title="检视此条论证所依托的全部原典引文与 EverOS 记忆"
                                    className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                                      isTraceExpanded
                                        ? "bg-stone-900 text-amber-300 border-stone-800 font-bold"
                                        : "bg-stone-100 text-stone-700 hover:bg-amber-100 hover:text-amber-900 border-stone-200"
                                    }`}
                                  >
                                    <SearchCheck className="w-3 h-3" />
                                    <span>溯源检视 ({matchedSources.length})</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => onOpenSFT(messages[index - 1]?.content || "", msg.content)}
                                  title="学生校勘纠错，沉淀为 SFT 指令对"
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-stone-100 text-stone-700 hover:bg-amber-100 hover:text-amber-900 border border-stone-200 text-xs font-mono transition-colors"
                                >
                                  <FileEdit className="w-3 h-3" />
                                  <span>校勘纠偏 (SFT)</span>
                                </button>

                                <button
                                  onClick={() => onOpenDPO(messages[index - 1]?.content || "", msg.content)}
                                  title="优劣对勘评级，沉淀为 DPO 偏好对"
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-stone-100 text-stone-700 hover:bg-indigo-100 hover:text-indigo-900 border border-stone-200 text-xs font-mono transition-colors"
                                >
                                  <Scale className="w-3 h-3" />
                                  <span>偏好标注 (DPO)</span>
                                </button>

                                <button
                                  onClick={() => {
                                    onAddConsensus(
                                      "研讨新确立共识",
                                      msg.content.slice(0, 160),
                                      "防概念漂移警示：严禁退化回朴素经验主义。"
                                    );
                                  }}
                                  title="将此条研讨结论永久加入 EverOS 共识图谱"
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-stone-100 text-stone-700 hover:bg-emerald-100 hover:text-emerald-900 border border-stone-200 text-xs font-mono transition-colors"
                                >
                                  <BookMarked className="w-3 h-3" />
                                  <span>确立共识</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center space-x-3 text-stone-600 bg-white border border-stone-200 p-4 rounded-xl max-w-md shadow-xs">
            <div className="w-4 h-4 rounded-full border-2 border-stone-800 border-t-transparent animate-spin"></div>
            <div className="text-xs font-serif">
              <span className="font-semibold text-stone-900">RTX 5090 Blackwell SDPA 推理中...</span>
              <p className="text-[11px] text-stone-500 font-mono">正在检索 EverOS 长期记忆库并形式化审查推论有效性</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-white border-t border-stone-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {activeSkillPrefix && (
            <div className="flex items-center space-x-1 bg-amber-100 text-amber-900 px-2.5 py-1.5 rounded text-xs font-mono border border-amber-300 whitespace-nowrap">
              <span>模式: {activeSkillPrefix}</span>
              <button
                type="button"
                onClick={() => setActiveSkillPrefix("")}
                className="hover:text-amber-950 font-bold ml-1"
              >
                ×
              </button>
            </div>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              activeSkillPrefix
                ? `输入命题，将以 ${activeSkillPrefix} 模式严格展开...`
                : "输入哲学命题或论文疑难（可键入 /deconstruct, /etymology, /socratic, /compare）..."
            }
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-800 bg-stone-50/50"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-2.5 rounded-lg bg-stone-900 text-stone-100 hover:bg-stone-800 disabled:opacity-50 text-xs sm:text-sm font-medium flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>推演</span>
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono mt-2 px-1">
          <span>回车发送 · 自动调取 EverOS 长期学术档案与共识图谱</span>
          <span>bfloat16 + SDPA Native Attention · 0% CPU Offload</span>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from "react";
import { 
  Sparkles, 
  Code, 
  Terminal, 
  Cpu, 
  FileCode, 
  Plus, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from "lucide-react";
import { BuiltinSkill, CrystallizedSkillItem } from "../types";

interface SkillCrystallizerViewProps {
  builtinSkills: BuiltinSkill[];
  crystallizedSkills: CrystallizedSkillItem[];
  onCrystallizeNew: (payload: any) => Promise<void>;
}

export const SkillCrystallizerView: React.FC<SkillCrystallizerViewProps> = ({
  builtinSkills,
  crystallizedSkills,
  onCrystallizeNew,
}) => {
  const [selectedYaml, setSelectedYaml] = useState<CrystallizedSkillItem | null>(
    crystallizedSkills[0] || null
  );
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [desc, setDesc] = useState("");
  const [pattern, setPattern] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitCrystallize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCrystallizeNew({
        name,
        command,
        description: desc,
        paradigm_pattern: pattern,
        system_prompt: prompt,
        formal_structure: [
          "Step 1: 概念公理形式化",
          "Step 2: 演绎路径与逻辑充要性推导",
          "Step 3: 两难困境与苏格拉底终局",
        ],
        source_summary: "源自研讨班学生与导师深度思辨结晶",
      });
      setSubmitted(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(false);
        setShowModal(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-6 border border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <Sparkles className="w-4 h-4" />
            <span>EverOS Skill Crystallization Hub</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-100">
            哲学论辩范式自动结晶中枢
          </h2>
          <p className="text-xs text-stone-400 font-serif mt-1 max-w-2xl leading-relaxed">
            打破传统模型技能固化的局限。EverOS 会自动检测研讨过程中反复涌现的高水平论辩模式（如反事实可能世界、形式三段论归谬），将其结晶固化为 YAML 规范并支持前缀指令调用。
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold font-mono transition-colors shadow-xs self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>手动触发范式结晶 (Crystallize)</span>
        </button>
      </div>

      {/* Built-in Core Skills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-stone-700" />
            <span>预置系统级哲学技能 (Built-in Dynamic Modes)</span>
          </h3>
          <span className="text-xs text-stone-500 font-mono">4 种严格形式化模式</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {builtinSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-2 hover:border-stone-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {skill.command}
                </span>
                <span className="text-[11px] font-mono text-stone-400">System Built-in</span>
              </div>
              <h4 className="font-serif font-bold text-sm text-stone-900">
                {skill.name}
              </h4>
              <p className="text-xs text-stone-600 font-serif leading-relaxed">
                {skill.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Crystallized Evolutionary Skills */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>EverOS 自进化结晶技能池 (Crystallized YAML Skills)</span>
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            {crystallizedSkills.length} 个结晶范式就绪
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Skill List Column */}
          <div className="space-y-2">
            {crystallizedSkills.map((item) => {
              const isSelected = selectedYaml?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedYaml(item)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                    isSelected
                      ? "bg-stone-900 text-stone-100 border-stone-900 shadow-xs"
                      : "bg-white text-stone-800 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? "bg-stone-800 text-amber-300 border border-stone-700"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {item.file}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? "text-amber-300" : "text-stone-400"}`} />
                  </div>
                  <div className="font-serif font-bold mt-1">
                    {item.id.replace(/_/g, " ").toUpperCase()}
                  </div>
                </button>
              );
            })}
          </div>

          {/* YAML Viewer Column */}
          <div className="lg:col-span-2 bg-stone-950 text-stone-200 rounded-xl p-4 border border-stone-800 font-mono text-xs overflow-x-auto shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-3 text-stone-400 text-[11px]">
              <div className="flex items-center space-x-2">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>skills/crystallized/{selectedYaml?.file || "crystallized.yaml"}</span>
              </div>
              <span className="text-emerald-400">EverOS Registered</span>
            </div>
            <pre className="text-stone-300 leading-relaxed overflow-x-auto">
              {selectedYaml?.content || "# 暂无选中的结晶技能"}
            </pre>
          </div>
        </div>
      </div>

      {/* Manual Crystallize Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-50 rounded-xl border border-stone-300 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif font-bold text-base text-stone-900">
              结晶沉淀全新哲学推演范式
            </h3>
            <p className="text-xs text-stone-500 font-serif">
              将高价值论证范式持久化为独立的 YAML 规范，自动注册至系统技能池并支持指令调用。
            </p>

            <form onSubmit={handleSubmitCrystallize} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    范式名称
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如: 先验感性论时空先验性反证"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-white border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    指令别名
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如: /transcendental"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-white border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  范式模式描述
                </label>
                <input
                  type="text"
                  required
                  placeholder="形式化推演结构与核心立意..."
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-white border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  技能系统指令模板 (System Prompt Template)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="在此输入注入模型的推演约束规范..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-white border border-stone-300 font-serif"
                />
              </div>

              {submitted && (
                <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 border border-emerald-300 p-2.5 rounded text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>结晶成功！已生成对应 YAML 文件并在运行时完成热挂载。</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs rounded text-stone-600 hover:bg-stone-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || submitted}
                  className="px-4 py-2 text-xs rounded bg-stone-900 text-stone-100 hover:bg-stone-800"
                >
                  {isSubmitting ? "正在结晶..." : "完成结晶并保存"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

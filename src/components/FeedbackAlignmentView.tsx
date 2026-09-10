import React, { useState, useEffect } from "react";
import { 
  SlidersHorizontal, 
  FileEdit, 
  Scale, 
  Download, 
  CheckCircle2, 
  FileText,
  Copy,
  Check
} from "lucide-react";

export const FeedbackAlignmentView: React.FC = () => {
  const [summary, setSummary] = useState<{
    sft_count: number;
    dpo_count: number;
    recent_sft: any[];
    recent_dpo: any[];
  }>({
    sft_count: 0,
    dpo_count: 0,
    recent_sft: [],
    recent_dpo: [],
  });

  const [activeTab, setActiveTab] = useState<"sft" | "dpo">("sft");
  const [copied, setCopied] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/feedback/summary");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleCopyJson = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-6 border border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Philo-EverOS Feedback & Alignment Engine</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-100">
            学术校勘纠错与 DPO 偏好对齐库
          </h2>
          <p className="text-xs text-stone-400 font-serif mt-1 max-w-2xl leading-relaxed">
            研讨班师生在日常思辨中指出的每一个形式逻辑漏洞或词源偏差，均会在此实时沉淀为 SFT 指令微调样本与 DPO 优劣偏好对，用于底层模型的自进化周期微调。
          </p>
        </div>

        {/* Counters */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="bg-stone-800 px-3 py-2 rounded-lg border border-stone-700">
            <span className="text-stone-400 block text-[10px]">SFT CORRECTIONS</span>
            <span className="text-amber-400 font-bold text-base">{summary.sft_count}</span>
          </div>
          <div className="bg-stone-800 px-3 py-2 rounded-lg border border-stone-700">
            <span className="text-stone-400 block text-[10px]">DPO PAIRS</span>
            <span className="text-indigo-400 font-bold text-base">{summary.dpo_count}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab("sft")}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "sft"
              ? "bg-stone-900 text-stone-100"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>SFT 纠偏指令集 (Alpaca Dataset)</span>
        </button>
        <button
          onClick={() => setActiveTab("dpo")}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "dpo"
              ? "bg-stone-900 text-stone-100"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>DPO 偏好对集 (Preference Pairs)</span>
        </button>
      </div>

      {/* Tab 1: SFT */}
      {activeTab === "sft" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 font-serif">
            <span>存储路径: data/training/alpaca_sft_dataset.json</span>
            <button
              onClick={() => handleCopyJson(summary.recent_sft)}
              className="flex items-center space-x-1 text-stone-700 hover:text-stone-900 font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制 JSON" : "复制当前数据 JSON"}</span>
            </button>
          </div>

          {summary.recent_sft.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500 text-xs font-serif">
              暂无 SFT 纠错记录。在研讨终端中点击任意回复下方的【校勘纠偏 (SFT)】即可创建首条样本。
            </div>
          ) : (
            <div className="space-y-3">
              {summary.recent_sft.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-stone-400">ID: {item.id}</span>
                    <span className="font-serif text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      目标: {item.philosopher_target || "哲学概念考订"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-stone-400 block mb-0.5">INSTRUCTION (Prompt)</span>
                    <p className="text-xs font-serif font-bold text-stone-900">{item.instruction}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-serif">
                    <div className="bg-stone-50 p-3 rounded border border-stone-200">
                      <span className="text-[10px] font-mono text-rose-700 block mb-1">ORIGINAL OUTPUT (原初输出)</span>
                      <p className="text-stone-600 line-clamp-4">{item.original_output}</p>
                    </div>
                    <div className="bg-emerald-50/50 p-3 rounded border border-emerald-200">
                      <span className="text-[10px] font-mono text-emerald-800 block mb-1">CORRECTED (标准修正)</span>
                      <p className="text-stone-800 font-medium">{item.corrected_output}</p>
                    </div>
                  </div>

                  {item.student_notes && (
                    <div className="text-[11px] font-serif text-stone-500 italic">
                      校勘理由: {item.student_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: DPO */}
      {activeTab === "dpo" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 font-serif">
            <span>存储路径: data/training/dpo_preference_dataset.json</span>
            <button
              onClick={() => handleCopyJson(summary.recent_dpo)}
              className="flex items-center space-x-1 text-stone-700 hover:text-stone-900 font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制 JSON" : "复制当前数据 JSON"}</span>
            </button>
          </div>

          {summary.recent_dpo.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500 text-xs font-serif">
              暂无 DPO 偏好记录。在研讨终端中点击任意回复下方的【偏好标注 (DPO)】即可录入。
            </div>
          ) : (
            <div className="space-y-3">
              {summary.recent_dpo.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-stone-400">ID: {item.id}</span>
                    <span className="font-serif text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      维度: {item.dimension}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-stone-400 block mb-0.5">PROMPT</span>
                    <p className="text-xs font-serif font-bold text-stone-900">{item.prompt}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-serif">
                    <div className="bg-emerald-50/50 p-3 rounded border border-emerald-200">
                      <span className="text-[10px] font-mono text-emerald-800 block mb-1">CHOSEN (严密推演)</span>
                      <p className="text-stone-800">{item.chosen}</p>
                    </div>
                    <div className="bg-rose-50/50 p-3 rounded border border-rose-200">
                      <span className="text-[10px] font-mono text-rose-800 block mb-1">REJECTED (平庸套话/矮化)</span>
                      <p className="text-stone-600 line-through decoration-rose-400">{item.rejected}</p>
                    </div>
                  </div>

                  {item.critique && (
                    <div className="text-[11px] font-serif text-stone-600 bg-stone-50 p-2 rounded">
                      <span className="font-bold">判别理由:</span> {item.critique}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

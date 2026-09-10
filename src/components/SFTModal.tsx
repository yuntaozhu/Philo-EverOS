import React, { useState } from "react";
import { X, CheckCircle2, BookOpen } from "lucide-react";

interface SFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalOutput: string;
  instruction: string;
  onSuccess: () => void;
}

export const SFTModal: React.FC<SFTModalProps> = ({
  isOpen,
  onClose,
  originalOutput,
  instruction,
  onSuccess,
}) => {
  const [correctedOutput, setCorrectedOutput] = useState(originalOutput);
  const [philosopherTarget, setPhilosopherTarget] = useState("康德 / 海德格尔 / 邓晓芒中译校准");
  const [studentNotes, setStudentNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/v1/feedback/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction,
          original_output: originalOutput,
          corrected_output: correctedOutput,
          philosopher_target: philosopherTarget,
          student_notes: studentNotes,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsSubmitting(false);
          setSubmitted(false);
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-stone-50 rounded-xl border border-stone-300 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-100/70">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-800" />
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                学生学术校勘纠错 (SFT 指令对采集)
              </h3>
              <p className="text-xs text-stone-500 font-serif">
                修订模型在词源考订、逻辑推导或中译本概念上的偏差，沉淀为增量微调数据集。
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              研讨命题 / 指令 Prompt
            </label>
            <div className="bg-stone-100 p-2.5 rounded text-xs font-mono text-stone-800 border border-stone-200">
              {instruction || "当前学术提问"}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                关涉思想家 / 译本目标
              </label>
              <input
                type="text"
                value={philosopherTarget}
                onChange={(e) => setPhilosopherTarget(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded bg-white border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-800"
                placeholder="例如: 康德邓晓芒版 / 海德格尔陈嘉映版"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                校勘说明 / 纠偏理由
              </label>
              <input
                type="text"
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded bg-white border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-800"
                placeholder="例如: 修正了对先验与先天的混淆"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              学术标准纠正文本 (SFT Corrected Ground Truth)
            </label>
            <textarea
              rows={8}
              value={correctedOutput}
              onChange={(e) => setCorrectedOutput(e.target.value)}
              className="w-full text-xs font-serif leading-relaxed p-3 rounded bg-white border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-800"
              placeholder="在此输入经过严密考据与逻辑梳理后的标准回答..."
              required
            />
          </div>

          {submitted && (
            <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 border border-emerald-300 p-3 rounded text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>已成功记录！已自动导出为 `data/training/alpaca_sft_dataset.json`。</span>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded text-stone-600 hover:bg-stone-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || submitted}
              className="px-4 py-2 text-xs font-medium rounded bg-stone-900 text-stone-100 hover:bg-stone-800 disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>{isSubmitting ? "正在归档 SFT..." : "提交校勘并沉淀"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

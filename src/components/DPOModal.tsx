import React, { useState } from "react";
import { X, CheckCircle2, Award } from "lucide-react";

interface DPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  currentOutput: string;
  onSuccess: () => void;
}

export const DPOModal: React.FC<DPOModalProps> = ({
  isOpen,
  onClose,
  prompt,
  currentOutput,
  onSuccess,
}) => {
  const [chosen, setChosen] = useState(currentOutput);
  const [rejected, setRejected] = useState(
    "总的来说，不同哲学家有不同的看法。海德格尔认为人在世界上生活要积极面对人生，而斯宾诺莎认为上帝就是大自然，两者在现代心理学中都有积极的现实指导意义。"
  );
  const [dimension, setDimension] = useState("形式有效性与本体论严谨度 (Validity & Anti-Reduction)");
  const [critique, setCritique] = useState(
    "Rejected 项犯了严重的心理学主义矮化与泛泛而谈的陈词滥调（总的来说、积极现实意义），且捏造了主客符合论。"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/v1/feedback/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          chosen,
          rejected,
          dimension,
          critique,
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
      <div className="bg-stone-50 rounded-xl border border-stone-300 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-100/70">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-700" />
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                论证优劣对比偏好标注 (DPO 偏好对采集)
              </h3>
              <p className="text-xs text-stone-500 font-serif">
                对比两组论述：强化严密形式推导与原语言考订（Chosen），惩罚平庸套话与经验心理学矮化（Rejected）。
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              研讨议题 (Prompt)
            </label>
            <div className="bg-stone-100 p-2.5 rounded text-xs font-mono text-stone-800 border border-stone-200">
              {prompt || "研讨命题"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chosen */}
            <div className="border border-emerald-300 rounded-lg p-3 bg-emerald-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>优胜学术论证 (Chosen)</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-mono">严格形式推导与概念精确</span>
              </div>
              <textarea
                rows={6}
                value={chosen}
                onChange={(e) => setChosen(e.target.value)}
                className="w-full text-xs font-serif leading-relaxed p-2.5 rounded bg-white border border-emerald-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>

            {/* Rejected */}
            <div className="border border-rose-300 rounded-lg p-3 bg-rose-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-rose-800 flex items-center space-x-1">
                  <X className="w-3.5 h-3.5" />
                  <span>劣质/违规论证 (Rejected)</span>
                </span>
                <span className="text-[10px] text-rose-700 font-mono">套话/逻辑偷换/心理学降解</span>
              </div>
              <textarea
                rows={6}
                value={rejected}
                onChange={(e) => setRejected(e.target.value)}
                className="w-full text-xs font-serif leading-relaxed p-2.5 rounded bg-white border border-rose-200 focus:outline-hidden focus:ring-1 focus:ring-rose-700"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                评判评价维度 (Evaluation Dimension)
              </label>
              <input
                type="text"
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded bg-white border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                学术评语 / 归因批判 (Critique)
              </label>
              <input
                type="text"
                value={critique}
                onChange={(e) => setCritique(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded bg-white border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-800"
              />
            </div>
          </div>

          {submitted && (
            <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 border border-emerald-300 p-3 rounded text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>DPO 对比数据已写入，并导出至 `data/training/dpo_preference_dataset.json`！</span>
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
              <span>{isSubmitting ? "正在保存 DPO 偏好..." : "确立偏好并沉淀"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { 
  BookOpen, 
  Bookmark, 
  Quote, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  SearchCheck,
  Filter
} from "lucide-react";
import { GroundedSourceItem } from "../data/canonicalCitations";

interface CitationTracePanelProps {
  matchedSources: GroundedSourceItem[];
  onInsertToInput?: (text: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const CitationTracePanel: React.FC<CitationTracePanelProps> = ({
  matchedSources,
  onInsertToInput,
  isOpen,
  onToggle
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");

  if (matchedSources.length === 0) {
    return null;
  }

  const handleCopy = (source: GroundedSourceItem) => {
    const textToCopy = `${source.author ? source.author + " " : ""}${source.title} (${source.locator})\n引文: “${source.originalQuote}”\n${source.standardTranslation ? "译文: " + source.standardTranslation : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(source.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSources = selectedType === "all" 
    ? matchedSources 
    : matchedSources.filter(s => s.type === selectedType);

  const canonCount = matchedSources.filter(s => s.type === "canonical_work").length;
  const consensusCount = matchedSources.filter(s => s.type === "everos_consensus").length;
  const profileCount = matchedSources.filter(s => s.type === "translation_lineage" || s.type === "concept_anchor").length;

  return (
    <div className="mt-3 border border-stone-200 rounded-xl bg-stone-50/70 overflow-hidden text-xs">
      {/* Trigger Bar */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-3.5 py-2 flex items-center justify-between bg-stone-100/90 hover:bg-stone-200/80 transition-colors text-left font-serif"
      >
        <div className="flex items-center space-x-2">
          <SearchCheck className="w-4 h-4 text-amber-700" />
          <span className="font-semibold text-stone-800">
            论证引用溯源检视单
          </span>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            对勘到 {matchedSources.length} 处原典与记忆
          </span>
          <div className="hidden sm:flex items-center space-x-1.5 text-[10px] font-mono text-stone-500">
            {canonCount > 0 && <span className="bg-white px-1.5 py-0.2 rounded border border-stone-200">原典: {canonCount}</span>}
            {consensusCount > 0 && <span className="bg-white px-1.5 py-0.2 rounded border border-stone-200">共识: {consensusCount}</span>}
            {profileCount > 0 && <span className="bg-white px-1.5 py-0.2 rounded border border-stone-200">译本/概念: {profileCount}</span>}
          </div>
        </div>

        <div className="flex items-center space-x-1 text-stone-500 font-mono text-[11px]">
          <span>{isOpen ? "收起溯源详情" : "展开全文考释与原典"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Body */}
      {isOpen && (
        <div className="p-3.5 space-y-3 bg-white border-t border-stone-200 animate-in fade-in duration-150">
          {/* Filter Chips */}
          <div className="flex items-center space-x-1.5 pb-1 border-b border-stone-100 text-[11px] font-mono">
            <Filter className="w-3 h-3 text-stone-400 mr-1" />
            <span className="text-stone-400">分类筛选:</span>
            {[
              { key: "all", label: `全部 (${matchedSources.length})` },
              { key: "canonical_work", label: `经典原典 (${canonCount})` },
              { key: "everos_consensus", label: `EverOS 共识 (${consensusCount})` },
              { key: "translation_lineage", label: `中译谱系 (${profileCount})` }
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setSelectedType(f.key)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedType === f.key
                    ? "bg-stone-900 text-stone-100 font-medium"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Source List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSources.map((s) => {
              const isCopied = copiedId === s.id;
              return (
                <div
                  key={s.id}
                  className="rounded-lg border border-stone-200 p-3 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300 transition-all flex flex-col justify-between space-y-2"
                >
                  <div className="space-y-1.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border mb-1 ${
                          s.type === "canonical_work"
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : s.type === "everos_consensus"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                            : "bg-indigo-50 text-indigo-900 border-indigo-300"
                        }`}>
                          {s.type === "canonical_work" ? "原典引文" : s.type === "everos_consensus" ? "研讨共识" : "译本谱系"}
                        </span>
                        <h4 className="font-serif font-bold text-stone-900 text-[13px] leading-snug">
                          {s.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(s)}
                        className="p-1 rounded bg-white hover:bg-stone-200 text-stone-500 hover:text-stone-800 border border-stone-200 transition-colors shrink-0"
                        title="复制引文"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Locator */}
                    <div className="text-[11px] font-mono text-stone-500">
                      {s.author && <span className="font-semibold text-stone-700">{s.author} · </span>}
                      <span>{s.locator}</span>
                    </div>

                    {/* Quote */}
                    <div className="bg-white p-2 rounded border border-stone-200 text-xs font-serif text-stone-800 italic">
                      “{s.originalQuote}”
                    </div>

                    {/* Standard translation if present */}
                    {s.standardTranslation && (
                      <div className="text-[11.5px] font-serif text-stone-600">
                        <span className="text-stone-400 font-mono text-[10px]">考释/译本: </span>
                        {s.standardTranslation}
                      </div>
                    )}

                    {/* Anti drift guardrail */}
                    {s.antiDriftWarning && (
                      <div className="text-[10.5px] font-serif bg-amber-50/70 border border-amber-200/80 p-1.5 rounded text-amber-900 flex items-start space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span>{s.antiDriftWarning}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {onInsertToInput && (
                    <div className="pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-[10.5px] font-mono text-stone-400">
                      <span>研讨联动</span>
                      <button
                        type="button"
                        onClick={() =>
                          onInsertToInput(
                            `/deconstruct 剖析《${s.title}》中【${s.term}】(${s.locator})之论证有效性。`
                          )
                        }
                        className="text-stone-700 hover:text-amber-800 font-medium flex items-center space-x-1"
                      >
                        <span>以此为据发起推演</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

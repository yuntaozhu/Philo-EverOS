import React, { useState } from "react";
import { 
  BookOpen, 
  Quote, 
  Copy, 
  Check, 
  ShieldAlert, 
  Sparkles, 
  ExternalLink, 
  ArrowRight,
  Bookmark
} from "lucide-react";
import { GroundedSourceItem } from "../data/canonicalCitations";

interface CitationHoverCardProps {
  source: GroundedSourceItem;
  matchedText: string;
  onInsertToInput?: (text: string) => void;
  onClose?: () => void;
}

export const CitationHoverCard: React.FC<CitationHoverCardProps> = ({
  source,
  matchedText,
  onInsertToInput,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${source.author ? source.author + " " : ""}${source.title} (${source.locator})\n引文: “${source.originalQuote}”\n${source.standardTranslation ? "译文: " + source.standardTranslation : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine styling based on source type
  const getTypeBadge = () => {
    switch (source.type) {
      case "everos_consensus":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
          icon: Bookmark,
          label: "EverOS 长期共识库"
        };
      case "canonical_work":
        return {
          bg: "bg-amber-50 text-amber-900 border-amber-300",
          icon: BookOpen,
          label: "哲学原典文献引文"
        };
      case "translation_lineage":
        return {
          bg: "bg-indigo-50 text-indigo-900 border-indigo-300",
          icon: Quote,
          label: "学者中译谱系锚定"
        };
      case "concept_anchor":
        return {
          bg: "bg-stone-100 text-stone-800 border-stone-300",
          icon: Sparkles,
          label: "核心概念定义约束"
        };
    }
  };

  const badgeInfo = getTypeBadge();
  const BadgeIcon = badgeInfo.icon;

  return (
    <div 
      className="w-84 sm:w-96 bg-stone-900 text-stone-100 rounded-xl shadow-2xl border border-stone-700 p-4 text-xs font-serif leading-relaxed select-text z-50 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-800 font-sans">
        <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${badgeInfo.bg}`}>
          <BadgeIcon className="w-3 h-3" />
          <span>{badgeInfo.label}</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors text-[11px] font-mono"
            title="复制原典与定位"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "已复制" : "复制出处"}</span>
          </button>
        </div>
      </div>

      {/* Work Title & Locator */}
      <div className="space-y-1 mb-3">
        <div className="text-amber-300 font-bold text-sm tracking-wide font-serif flex items-baseline justify-between">
          <span>{source.title}</span>
        </div>
        <div className="text-[11px] font-mono text-stone-400 flex items-center space-x-2">
          {source.author && <span className="text-stone-300 font-semibold">{source.author}</span>}
          <span>·</span>
          <span className="text-amber-200/90">{source.locator}</span>
        </div>
      </div>

      {/* Matched Token Target */}
      <div className="bg-stone-950/80 rounded-lg p-2.5 border border-stone-800/80 mb-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
          <span className="text-amber-400 font-semibold">【当前匹配关键词: {matchedText}】</span>
          {source.originalLang && <span className="text-stone-400">{source.originalLang}</span>}
        </div>

        {/* Original Quote */}
        <div className="text-stone-200 text-xs italic font-serif bg-stone-900/90 p-2 rounded border border-stone-800">
          “{source.originalQuote}”
        </div>

        {/* Translation / Affirmation */}
        {source.standardTranslation && (
          <div className="text-[11.5px] text-stone-300 font-serif leading-snug">
            <span className="text-stone-400 font-mono text-[10px] block mb-0.5">
              权威译文 / 共识认定 {source.translationEdition ? `(${source.translationEdition})` : ""}:
            </span>
            {source.standardTranslation}
          </div>
        )}
      </div>

      {/* Epistemological & Anti-drift Warning */}
      {source.antiDriftWarning && (
        <div className="mb-3 bg-red-950/30 border border-red-900/50 rounded-lg p-2.5 flex items-start space-x-2 text-[11px] text-red-200">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-mono font-bold text-red-300 block text-[10px] uppercase tracking-wider mb-0.5">
              防概念漂移警示 (Anti-Drift Guardrail)
            </span>
            <div className="font-serif leading-relaxed text-red-200/90">
              {source.antiDriftWarning}
            </div>
          </div>
        </div>
      )}

      {/* Footer seminar action */}
      {onInsertToInput && (
        <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] font-mono">
          <span className="text-stone-400">研讨学者对勘建议:</span>
          <button
            type="button"
            onClick={() => {
              onInsertToInput(`/deconstruct 考订《${source.title}》中关于【${matchedText}】(${source.locator})之本体论前提与中译争议。`);
              if (onClose) onClose();
            }}
            className="flex items-center space-x-1 text-amber-300 hover:text-amber-200 font-medium group"
          >
            <span>置入终端研讨</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

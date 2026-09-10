import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { GroundedSourceItem } from "../data/canonicalCitations";
import { CitationHoverCard } from "./CitationHoverCard";
import { BookMarked, BookOpen, Quote, Sparkles } from "lucide-react";

interface CitationHighlightProps {
  text: string;
  source: GroundedSourceItem;
  onInsertToInput?: (text: string) => void;
}

export const CitationHighlight: React.FC<CitationHighlightProps> = ({
  text,
  source,
  onInsertToInput
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; position: "top" | "bottom" } | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cardWidth = Math.min(384, window.innerWidth - 32);
      const desiredLeft = rect.left + rect.width / 2 - cardWidth / 2;
      const left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, desiredLeft));

      const showBelow = rect.top < 340;
      if (showBelow) {
        setCoords({ top: rect.bottom + 8, left, position: "bottom" });
      } else {
        setCoords({ top: rect.top - 8, left, position: "top" });
      }
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePosition();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Icon depending on source type
  const renderMiniIcon = () => {
    switch (source.type) {
      case "everos_consensus":
        return <BookMarked className="w-2.5 h-2.5 text-emerald-600 inline ml-0.5" />;
      case "canonical_work":
        return <BookOpen className="w-2.5 h-2.5 text-amber-700 inline ml-0.5" />;
      case "translation_lineage":
        return <Quote className="w-2.5 h-2.5 text-indigo-600 inline ml-0.5" />;
      case "concept_anchor":
        return <Sparkles className="w-2.5 h-2.5 text-stone-600 inline ml-0.5" />;
    }
  };

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="relative inline"
    >
      <span
        className={`inline cursor-pointer px-1 py-0.5 rounded transition-all duration-150 border-b-2 ${
          source.type === "canonical_work"
            ? "bg-amber-50/80 hover:bg-amber-100 text-stone-900 border-amber-500 font-serif font-medium"
            : source.type === "everos_consensus"
            ? "bg-emerald-50/80 hover:bg-emerald-100 text-stone-900 border-emerald-500 font-serif font-medium"
            : "bg-stone-100/90 hover:bg-stone-200 text-stone-900 border-stone-400 font-serif font-medium"
        }`}
        title={`点击或悬浮查看引用出处: ${source.title}`}
      >
        <span>{text}</span>
        {renderMiniIcon()}
      </span>

      {/* Floating Hover Card portaled to document.body to prevent any invalid HTML nesting in paragraphs */}
      {isOpen && coords && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed",
            left: `${coords.left}px`,
            top: coords.position === "bottom" ? `${coords.top}px` : undefined,
            bottom: coords.position === "top" ? `${window.innerHeight - coords.top}px` : undefined,
            zIndex: 99999
          }}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <CitationHoverCard
            source={source}
            matchedText={text}
            onInsertToInput={onInsertToInput}
            onClose={() => setIsOpen(false)}
          />
        </div>,
        document.body
      )}
    </span>
  );
};

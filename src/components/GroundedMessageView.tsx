import React from "react";
import Markdown from "react-markdown";
import { GroundedSourceItem } from "../data/canonicalCitations";
import { tokenizeGroundedText } from "../utils/citationMatcher";
import { CitationHighlight } from "./CitationHighlight";

interface GroundedMessageViewProps {
  content: string;
  sources: GroundedSourceItem[];
  highlightEnabled: boolean;
  onInsertToInput?: (text: string) => void;
}

export const GroundedMessageView: React.FC<GroundedMessageViewProps> = ({
  content,
  sources,
  highlightEnabled,
  onInsertToInput
}) => {
  // If highlight is disabled or no sources, standard markdown render
  if (!highlightEnabled || sources.length === 0) {
    return (
      <div className="prose prose-stone max-w-none text-stone-800 text-[13.5px] leading-relaxed font-serif">
        <Markdown>{content}</Markdown>
      </div>
    );
  }

  // Recursive highlighter for react-markdown children elements
  const highlightChild = (child: React.ReactNode, keyPrefix: string): React.ReactNode => {
    if (typeof child === "string") {
      const tokens = tokenizeGroundedText(child, sources);
      if (tokens.length === 1 && tokens[0].type === "text") {
        return child;
      }
      return tokens.map((t, idx) => {
        if (t.type === "grounded" && t.source) {
          return (
            <CitationHighlight
              key={`${keyPrefix}-${idx}`}
              text={t.content}
              source={t.source}
              onInsertToInput={onInsertToInput}
            />
          );
        }
        return <React.Fragment key={`${keyPrefix}-${idx}`}>{t.content}</React.Fragment>;
      });
    }

    if (Array.isArray(child)) {
      return child.map((c, i) => highlightChild(c, `${keyPrefix}-${i}`));
    }

    if (React.isValidElement(child) && (child.props as any)?.children) {
      return React.cloneElement(child as React.ReactElement<any>, {
        children: highlightChild((child.props as any).children, `${keyPrefix}-inner`),
      });
    }

    return child;
  };

  const customComponents = {
    p: ({ node, children, className = "", ...props }: any) => (
      <div {...props} className={`mb-3 leading-relaxed ${className}`}>
        {highlightChild(children, "p")}
      </div>
    ),
    li: ({ node, children, className = "", ...props }: any) => (
      <li {...props} className={`mb-1 leading-relaxed ${className}`}>
        {highlightChild(children, "li")}
      </li>
    ),
    blockquote: ({ node, children, className = "", ...props }: any) => (
      <blockquote {...props} className={`border-l-3 border-amber-600 pl-3 italic text-stone-700 my-2 ${className}`}>
        {highlightChild(children, "bq")}
      </blockquote>
    ),
    strong: ({ node, children, className = "", ...props }: any) => (
      <strong {...props} className={`font-bold text-stone-900 ${className}`}>
        {highlightChild(children, "str")}
      </strong>
    ),
    em: ({ node, children, className = "", ...props }: any) => (
      <em {...props} className={`italic text-stone-800 ${className}`}>
        {highlightChild(children, "em")}
      </em>
    ),
    h1: ({ node, children, className = "", ...props }: any) => (
      <h1 {...props} className={`font-serif font-bold text-lg text-stone-900 mt-4 mb-2 pb-1 border-b border-stone-200 ${className}`}>
        {highlightChild(children, "h1")}
      </h1>
    ),
    h2: ({ node, children, className = "", ...props }: any) => (
      <h2 {...props} className={`font-serif font-bold text-base text-stone-900 mt-3 mb-1.5 pb-0.5 border-b border-stone-200 ${className}`}>
        {highlightChild(children, "h2")}
      </h2>
    ),
    h3: ({ node, children, className = "", ...props }: any) => (
      <h3 {...props} className={`font-serif font-semibold text-sm text-stone-900 mt-2.5 mb-1 ${className}`}>
        {highlightChild(children, "h3")}
      </h3>
    ),
  };

  return (
    <div className="prose prose-stone max-w-none text-stone-800 text-[13.5px] leading-relaxed font-serif">
      <Markdown components={customComponents}>{content}</Markdown>
    </div>
  );
};

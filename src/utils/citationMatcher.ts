import { GroundedSourceItem, CANONICAL_CITATIONS } from "../data/canonicalCitations";
import { ConsensusNode, AcademicProfile } from "../types";

export interface TextSpanMatch {
  start: number;
  end: number;
  matchedText: string;
  source: GroundedSourceItem;
}

export interface GroundedToken {
  type: "text" | "grounded";
  content: string;
  source?: GroundedSourceItem;
}

/**
 * Builds a unified GroundedSourceItem catalog combining:
 * 1. Philosophical Canon Citations (Kant, Heidegger, Husserl, Spinoza, etc.)
 * 2. EverOS Long-term Consensus Graph Nodes
 * 3. Academic Profile Concept Anchors & Translation Lineage
 */
export function buildUnifiedGroundedSources(
  consensusList: ConsensusNode[] = [],
  profile?: AcademicProfile
): GroundedSourceItem[] {
  const result: GroundedSourceItem[] = [...CANONICAL_CITATIONS];

  // Ingest EverOS Consensus Nodes
  if (Array.isArray(consensusList)) {
    for (const node of consensusList) {
      const aliases = [
        node.concept,
        ...(node.tags || []),
        ...node.concept.split(/[\s/()（）]+/).filter((s) => s.length >= 2)
      ];

      result.push({
        id: `consensus-${node.id}`,
        type: "everos_consensus",
        term: node.concept,
        matchedAliases: Array.from(new Set(aliases)),
        title: `EverOS 研讨共识: 《${node.concept}》`,
        locator: node.source_seminar || "哲学研讨班确立公识",
        author: node.school_context || "EverOS 哲学研讨班集体共识",
        originalQuote: node.affirmation,
        standardTranslation: (node.citations || []).join(" | "),
        consensusAffirmation: node.affirmation,
        antiDriftWarning: node.negation_or_drift_warning,
        academicNotes: `研讨会次: ${node.source_seminar} · 引用文献: ${(node.citations || []).join(", ")}`
      });
    }
  }

  // Ingest Profile Concept Anchors
  if (profile?.concept_anchors) {
    for (const [term, def] of Object.entries(profile.concept_anchors)) {
      result.push({
        id: `profile-anchor-${term.toLowerCase()}`,
        type: "concept_anchor",
        term: term,
        matchedAliases: [term, term.toLowerCase(), term.toUpperCase()],
        title: `学者画像核心概念锚定: 【${term}】`,
        locator: `研讨学者 ${profile.student_name} 本人学术规范约束`,
        author: profile.student_name,
        originalQuote: def,
        antiDriftWarning: `【学者本体论约束】：${def}`,
        academicNotes: `流派所属: ${profile.school_of_thought} · 论文课题: ${profile.current_thesis_topic}`
      });
    }
  }

  // Ingest Translation Alignments
  if (profile?.translation_alignments) {
    for (const [phil, trans] of Object.entries(profile.translation_alignments)) {
      const authorPure = phil.split(/[\s(]/)[0];
      result.push({
        id: `trans-align-${authorPure}`,
        type: "translation_lineage",
        term: `${authorPure}译本`,
        matchedAliases: [
          authorPure,
          `${authorPure}译本`,
          phil,
          trans.slice(0, 8)
        ],
        title: `权威中译本谱系锚定: ${phil}`,
        locator: trans,
        author: phil,
        originalQuote: trans,
        standardTranslation: `研讨班对齐译本规范：${trans}`,
        antiDriftWarning: `严禁在未经考证前提下混用异质译本导致概念术语内涵错乱。`,
        academicNotes: `研讨班统一采用此译本作为概念推论之中文权威根据。`
      });
    }
  }

  return result;
}

/**
 * Finds all grounded sources matched in a given text string.
 */
export function findGroundedMatchesInText(
  text: string,
  sources: GroundedSourceItem[]
): GroundedSourceItem[] {
  if (!text) return [];
  const textLower = text.toLowerCase();
  const matched: GroundedSourceItem[] = [];
  const seenIds = new Set<string>();

  for (const source of sources) {
    if (seenIds.has(source.id)) continue;

    // Check primary term or any alias
    const hasMatch = source.matchedAliases.some((alias) => {
      if (!alias || alias.trim().length < 2) return false;
      return textLower.includes(alias.trim().toLowerCase());
    });

    if (hasMatch) {
      matched.push(source);
      seenIds.add(source.id);
    }
  }

  return matched;
}

/**
 * Tokenizes plain text into regular text and grounded highlight spans
 * prioritizing longer matches and avoiding overlapping spans.
 */
export function tokenizeGroundedText(
  text: string,
  sources: GroundedSourceItem[]
): GroundedToken[] {
  if (!text) return [];
  if (!sources || sources.length === 0) {
    return [{ type: "text", content: text }];
  }

  // Find all match occurrences with exact offsets
  const matches: TextSpanMatch[] = [];

  for (const source of sources) {
    for (const alias of source.matchedAliases) {
      const cleanAlias = alias.trim();
      if (cleanAlias.length < 2) continue;

      let pos = 0;
      const aliasLower = cleanAlias.toLowerCase();
      const textLower = text.toLowerCase();

      while ((pos = textLower.indexOf(aliasLower, pos)) !== -1) {
        matches.push({
          start: pos,
          end: pos + cleanAlias.length,
          matchedText: text.slice(pos, pos + cleanAlias.length),
          source
        });
        pos += cleanAlias.length;
      }
    }
  }

  if (matches.length === 0) {
    return [{ type: "text", content: text }];
  }

  // Sort matches by start position, then by descending length
  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  // Filter out overlapping matches
  const nonOverlapping: TextSpanMatch[] = [];
  let lastEnd = 0;

  for (const m of matches) {
    if (m.start >= lastEnd) {
      nonOverlapping.push(m);
      lastEnd = m.end;
    }
  }

  // Build tokens
  const tokens: GroundedToken[] = [];
  let currentIdx = 0;

  for (const m of nonOverlapping) {
    if (m.start > currentIdx) {
      tokens.push({
        type: "text",
        content: text.slice(currentIdx, m.start)
      });
    }

    tokens.push({
      type: "grounded",
      content: text.slice(m.start, m.end),
      source: m.source
    });

    currentIdx = m.end;
  }

  if (currentIdx < text.length) {
    tokens.push({
      type: "text",
      content: text.slice(currentIdx)
    });
  }

  return tokens;
}

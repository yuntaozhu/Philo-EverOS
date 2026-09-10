export interface AcademicProfile {
  user_id: string;
  student_name: string;
  school_of_thought: string;
  translation_alignments: Record<string, string>;
  current_thesis_topic: string;
  concept_anchors: Record<string, string>;
  last_updated: string;
}

export interface ConsensusNode {
  id: string;
  concept: string;
  affirmation: string;
  negation_or_drift_warning: string;
  source_seminar: string;
  school_context: string;
  citations: string[];
  tags: string[];
  created_at: number;
}

export interface BuiltinSkill {
  id: string;
  command: string;
  name: string;
  description: string;
}

export interface CrystallizedSkillItem {
  id: string;
  file: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  skill_used?: string;
  guardrails?: {
    is_valid: boolean;
    issues: string[];
    passed_rules: string[];
  };
}

export interface SFTRecord {
  id: string;
  instruction: string;
  original_output: string;
  corrected_output: string;
  student_notes?: string;
  philosopher_target?: string;
  timestamp: number;
}

export interface DPORecord {
  id: string;
  prompt: string;
  chosen: string;
  rejected: string;
  dimension: string;
  critique?: string;
  timestamp: number;
}

export type EverOSFolderType = "profiles" | "facts" | "episodes" | "foresights" | "skills";

export interface EverOSMemoryFile {
  path: string; // e.g. "profiles/scholar_profile.md" or "episodes/2026/kant.md"
  name: string; // e.g. "scholar_profile.md"
  folder: EverOSFolderType | string;
  subfolder?: string;
  size: number;
  lastModified: number;
  content?: string;
  categoryTitle?: string;
  description?: string;
}

export interface EverOSTreeData {
  root: string;
  totalFiles?: number;
  totalSize?: number;
  files: EverOSMemoryFile[];
}

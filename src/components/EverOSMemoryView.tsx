import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import JSZip from "jszip";
import {
  Brain,
  UserCheck,
  Network,
  Plus,
  Save,
  Check,
  AlertTriangle,
  ShieldCheck,
  Search,
  BookOpen,
  FolderTree,
  FolderOpen,
  Eye,
  Columns,
  Edit3,
  Copy,
  Download,
  Trash2,
  FileCode,
  FileText,
  Zap,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { AcademicProfile, ConsensusNode, ChatMessage, EverOSMemoryFile, EverOSFolderType } from "../types";
import { EverOSSidebarFileTree } from "./EverOSSidebarFileTree";

interface EverOSMemoryViewProps {
  profile: AcademicProfile;
  consensusList: ConsensusNode[];
  onUpdateProfile: (updated: Partial<AcademicProfile>) => Promise<void>;
  onAddConsensus: (node: Partial<ConsensusNode>) => Promise<void>;
  messages?: ChatMessage[];
  onRefreshConsensus?: () => void;
  onRefreshProfile?: () => void;
}

export const EverOSMemoryView: React.FC<EverOSMemoryViewProps> = ({
  profile,
  consensusList,
  onUpdateProfile,
  onAddConsensus,
  messages = [],
  onRefreshConsensus,
  onRefreshProfile,
}) => {
  // Main view navigation: Archive Tree & Editor, Profile Form, Consensus Graph
  const [activeSubTab, setActiveSubTab] = useState<"archive" | "profile" | "consensus">("archive");

  // Sidebar File Manager state
  const [files, setFiles] = useState<EverOSMemoryFile[]>([]);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Active File & Editor state
  const [activeFilePath, setActiveFilePath] = useState<string>("profiles/scholar_profile.md");
  const [activeContent, setActiveContent] = useState<string>("");
  const [isModified, setIsModified] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"preview" | "edit" | "split">("split");

  // New File Modal state
  const [showNewFileModal, setShowNewFileModal] = useState<boolean>(false);
  const [newFileFolder, setNewFileFolder] = useState<EverOSFolderType>("profiles");
  const [newFileName, setNewFileName] = useState<string>("");
  const [isSyncingEpisode, setIsSyncingEpisode] = useState<boolean>(false);

  // Profile Form State
  const [studentName, setStudentName] = useState(profile.student_name);
  const [school, setSchool] = useState(profile.school_of_thought);
  const [thesis, setThesis] = useState(profile.current_thesis_topic);
  const [alignments, setAlignments] = useState(profile.translation_alignments);
  const [anchors, setAnchors] = useState(profile.concept_anchors);
  const [savedProfile, setSavedProfile] = useState(false);

  // Consensus Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newConcept, setNewConcept] = useState("");
  const [newAffirmation, setNewAffirmation] = useState("");
  const [newWarning, setNewWarning] = useState("");
  const [newSeminar, setNewSeminar] = useState("《纯粹理性批判》先验感性论研讨班");
  const [newSchool, setNewSchool] = useState("德国古典唯心论 / 批判哲学");
  const [newCitations, setNewCitations] = useState("Kant, B25/A11; 邓晓芒句读");
  const [newTags, setNewTags] = useState("康德, 先验, 纯粹直观");

  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch file tree recursively from backend
  const fetchTree = async (selectPath?: string) => {
    try {
      setIsLoadingTree(true);
      const res = await fetch("/api/everos/archive/tree");
      if (res.ok) {
        const data = await res.json();
        const fileList: EverOSMemoryFile[] = data.files || [];
        setFiles(fileList);
        setTotalSize(data.totalSize || 0);

        const targetPath = selectPath || activeFilePath;
        const exists = fileList.some((f) => f.path === targetPath);
        if (exists) {
          loadFile(targetPath);
        } else if (fileList.length > 0) {
          loadFile(fileList[0].path);
        }
      }
    } catch (err) {
      console.error("Failed to load EverOS recursive archive tree:", err);
    } finally {
      setIsLoadingTree(false);
    }
  };

  // Load specific file content
  const loadFile = async (relPath: string) => {
    try {
      const res = await fetch(`/api/everos/archive/file?path=${encodeURIComponent(relPath)}`);
      if (res.ok) {
        const data = await res.json();
        setActiveFilePath(data.path);
        setActiveContent(data.content || "");
        setIsModified(false);
      }
    } catch (err) {
      console.error("Failed to load EverOS file:", err);
    }
  };

  // Select file from sidebar
  const handleSelectFile = (relPath: string) => {
    loadFile(relPath);
    // If student was on Profile or Consensus tab, automatically switch to Archive Editor to view it
    if (activeSubTab !== "archive") {
      setActiveSubTab("archive");
    }
  };

  useEffect(() => {
    fetchTree("profiles/scholar_profile.md");
  }, []);

  // Keyboard shortcut for saving (Ctrl+S or Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveFile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFilePath, activeContent]);

  // Save current markdown file
  const handleSaveFile = async () => {
    if (!activeFilePath) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/everos/archive/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: activeFilePath,
          content: activeContent,
        }),
      });

      if (res.ok) {
        setIsModified(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2200);

        // Refresh tree metadata & parent states
        fetchTree(activeFilePath);
        if (activeFilePath.startsWith("profiles/")) {
          onRefreshProfile?.();
        }
        if (activeFilePath.startsWith("facts/")) {
          onRefreshConsensus?.();
        }
      }
    } catch (err) {
      console.error("Failed to save file to EverOS archive:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Create new file
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    try {
      const res = await fetch("/api/everos/archive/create-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: newFileFolder,
          filename: newFileName.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowNewFileModal(false);
        setNewFileName("");
        await fetchTree(data.file.path);
        setActiveSubTab("archive");
      }
    } catch (err) {
      console.error("Failed to create file:", err);
    }
  };

  // Delete current active file
  const handleDeleteFile = async () => {
    if (!activeFilePath) return;
    if (activeFilePath === "profiles/scholar_profile.md" || activeFilePath === "facts/consensuses.md") {
      alert("核心规范文件受 EverOS 系统保护，不可删除。");
      return;
    }
    const confirmed = window.confirm(`确定要从 EverOS 本地记忆库中永久删除 ${activeFilePath} 吗？`);
    if (!confirmed) return;

    try {
      const res = await fetch("/api/everos/archive/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: activeFilePath }),
      });
      if (res.ok) {
        await fetchTree("profiles/scholar_profile.md");
      }
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  // Export current single file
  const handleExportSingle = () => {
    if (!activeFilePath) return;
    const blob = new Blob([activeContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFilePath.split("/").pop() || "everos_memory.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export entire archive as ZIP
  const handleExportAllZip = async () => {
    try {
      const res = await fetch("/api/everos/archive/export-all");
      if (!res.ok) return;
      const data = await res.json();
      const zip = new JSZip();

      const rootFolder = zip.folder(".everos") || zip;

      (data.files || []).forEach((f: any) => {
        rootFolder.file(f.path, f.content);
      });

      rootFolder.file(
        "README.md",
        `# EverOS Portable Memory Archive
Exported from Philo-EverOS at ${new Date().toISOString()}
Compatible with EverMind-AI/EverOS standard agent memory layer.

## Structure
- profiles/: Scholar philosophical profile & anti-drift guardrails
- facts/: Formal axioms & consensus graph
- episodes/: Timestamped seminar dialogues and premise reconstructions
- foresights/: Socratic antinomies & unresolved inquiries
- skills/: Formal argumentation skill specifications
`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `everos-memory-archive-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate ZIP archive:", err);
    }
  };

  // Copy active markdown content
  const handleCopyContent = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Import local markdown file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const defaultFolder: EverOSFolderType = file.name.includes("profile")
        ? "profiles"
        : file.name.includes("episode") || file.name.includes("seminar")
        ? "episodes"
        : "facts";

      try {
        const res = await fetch("/api/everos/archive/create-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: defaultFolder,
            filename: file.name,
            content: content,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          await fetchTree(data.file.path);
          setActiveSubTab("archive");
        }
      } catch (err) {
        console.error("Failed to import file:", err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Sync active seminar to Episode markdown
  const handleSyncEpisode = async () => {
    if (messages.length === 0) {
      alert("当前研讨终端尚无论辩记录，请先在学术研讨终端中开展对话。");
      return;
    }
    try {
      setIsSyncingEpisode(true);
      const res = await fetch("/api/everos/archive/sync-episode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages,
          scholar_name: profile.student_name,
          school: profile.school_of_thought,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchTree(data.file.path);
        setActiveSubTab("archive");
      }
    } catch (err) {
      console.error("Failed to sync episode:", err);
    } finally {
      setIsSyncingEpisode(false);
    }
  };

  // Quick markdown tag helper
  const insertMarkdownTag = (before: string, after: string = "") => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = activeContent.substring(start, end);
    const replacement = `${before}${selected || "内容"}${after}`;
    const newText = activeContent.substring(0, start) + replacement + activeContent.substring(end);
    setActiveContent(newText);
    setIsModified(true);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected || "内容").length);
    }, 50);
  };

  // Save profile form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile({
      student_name: studentName,
      school_of_thought: school,
      current_thesis_topic: thesis,
      translation_alignments: alignments,
      concept_anchors: anchors,
    });
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2000);
    fetchTree();
  };

  // Create consensus node
  const handleCreateConsensus = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddConsensus({
      concept: newConcept,
      affirmation: newAffirmation,
      negation_or_drift_warning: newWarning,
      source_seminar: newSeminar,
      school_context: newSchool,
      citations: newCitations.split(";").map((c) => c.trim()),
      tags: newTags.split(",").map((t) => t.trim()),
    });
    setShowAddModal(false);
    setNewConcept("");
    setNewAffirmation("");
    setNewWarning("");
    fetchTree();
  };

  const filteredConsensus = consensusList.filter(
    (c) =>
      c.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.school_context.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeFileMeta = files.find((f) => f.path === activeFilePath);
  const wordCount = activeContent.trim().length;
  const lineCount = activeContent ? activeContent.split("\n").length : 0;

  return (
    <div id="everos-memory-view" className="max-w-7xl mx-auto space-y-4">
      {/* Top Banner & Mode Navigation */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <Brain className="w-4 h-4" />
            <span>EverOS Hippocampus Memory Subsystem · Portable Markdown</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-100">
            长期学术档案与全系共识知识库
          </h2>
          <p className="text-xs text-stone-400 font-serif mt-1 max-w-2xl leading-relaxed">
            遵循 EverMind-AI/EverOS 标准，将学者学术画像、本体论共识、研讨切片与反思课题完全解构为可追溯、版本化、纯文本存储的 Markdown 规范文件（~/.everos/）。
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-stone-800 p-1 rounded-lg border border-stone-700 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveSubTab("archive")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeSubTab === "archive"
                ? "bg-stone-700 text-amber-300 shadow-xs font-semibold"
                : "text-stone-300 hover:text-white"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-amber-400" />
            <span>记忆档案库与编辑器</span>
          </button>
          <button
            onClick={() => setActiveSubTab("profile")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeSubTab === "profile"
                ? "bg-stone-700 text-amber-300 shadow-xs font-semibold"
                : "text-stone-300 hover:text-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>学者画像 (Profile)</span>
          </button>
          <button
            onClick={() => setActiveSubTab("consensus")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeSubTab === "consensus"
                ? "bg-stone-700 text-amber-300 shadow-xs font-semibold"
                : "text-stone-300 hover:text-white"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>共识图谱 ({consensusList.length})</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout: Left Sidebar File Panel + Right Content Area */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Left: Sidebar File Management Panel */}
        <EverOSSidebarFileTree
          files={files}
          activeFilePath={activeFilePath}
          isModified={isModified}
          isLoading={isLoadingTree}
          totalSize={totalSize}
          onSelectFile={handleSelectFile}
          onRefreshTree={() => fetchTree(activeFilePath)}
          onNewFile={() => setShowNewFileModal(true)}
          onImportFile={handleImportFile}
          onExportAllZip={handleExportAllZip}
          onSyncEpisode={handleSyncEpisode}
          isSyncingEpisode={isSyncingEpisode}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Right: Main Content Area */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* Subtab 1: EverOS Markdown Archive Editor & Viewer */}
          {activeSubTab === "archive" && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col overflow-hidden min-h-[660px]">
              {/* File Header Bar */}
              <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2 min-w-0">
                  <FileCode className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-stone-900 truncate">
                        ~/.everos/{activeFilePath}
                      </span>
                      {isModified && (
                        <span className="text-[10px] bg-amber-500 text-stone-950 font-bold px-1.5 py-0.2 rounded animate-pulse">
                          未保存修改
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-500 font-serif flex items-center space-x-2 mt-0.5">
                      <span>{wordCount} 字符</span>
                      <span>·</span>
                      <span>{lineCount} 行</span>
                      <span>·</span>
                      <span>{activeFileMeta?.categoryTitle || "学术记忆档案"}</span>
                      {activeFileMeta?.size && (
                        <>
                          <span>·</span>
                          <span>{(activeFileMeta.size / 1024).toFixed(1)} KB</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* View Mode Toggle & Actions */}
                <div className="flex items-center space-x-2">
                  {/* View Mode */}
                  <div className="flex bg-stone-200 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setViewMode("preview")}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
                        viewMode === "preview"
                          ? "bg-white text-stone-900 font-semibold shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                      title="纯富文本阅读模式"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">原典预览</span>
                    </button>
                    <button
                      onClick={() => setViewMode("split")}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
                        viewMode === "split"
                          ? "bg-white text-stone-900 font-semibold shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                      title="实时左右对照分栏"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">分栏对勘</span>
                    </button>
                    <button
                      onClick={() => setViewMode("edit")}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
                        viewMode === "edit"
                          ? "bg-white text-stone-900 font-semibold shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                      title="纯源码编辑模式"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">源码编辑</span>
                    </button>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={handleCopyContent}
                    title="复制 Markdown 全文"
                    className="p-1.5 rounded-md hover:bg-stone-200 text-stone-600 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleExportSingle}
                    title="下载导出当前 Markdown 档案 (.md)"
                    className="flex items-center space-x-1 px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">导出.md</span>
                  </button>

                  <button
                    onClick={handleDeleteFile}
                    title="从记忆库删除当前文件"
                    className="p-1.5 rounded-md hover:bg-rose-100 text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSaveFile}
                    disabled={isSaving}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold shadow-xs transition-colors"
                  >
                    {saveSuccess ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSaving ? "保存中..." : saveSuccess ? "已同步至 EverOS" : "保存 (Ctrl+S)"}</span>
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              {(viewMode === "edit" || viewMode === "split") && (
                <div className="px-3.5 py-1.5 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center gap-1 text-xs">
                  <button
                    onClick={() => insertMarkdownTag("## ")}
                    className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 font-mono text-[11px]"
                  >
                    H2
                  </button>
                  <button
                    onClick={() => insertMarkdownTag("### ")}
                    className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 font-mono text-[11px]"
                  >
                    H3
                  </button>
                  <button
                    onClick={() => insertMarkdownTag("**", "**")}
                    className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 font-bold text-[11px]"
                  >
                    B
                  </button>
                  <button
                    onClick={() => insertMarkdownTag("*", "*")}
                    className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 italic text-[11px]"
                  >
                    I
                  </button>
                  <button
                    onClick={() => insertMarkdownTag("> ")}
                    className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 font-serif text-[11px]"
                  >
                    引述
                  </button>
                  <button
                    onClick={() =>
                      insertMarkdownTag(
                        "\n| 范畴维度 | 康德批判哲学 | 海德格尔生存论 |\n| :--- | :--- | :--- |\n| 奠基形式 | 先验统觉 | 此在生存论时间性 |\n"
                      )
                    }
                    className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 text-[11px]"
                  >
                    + 对勘表
                  </button>
                  <button
                    onClick={() =>
                      insertMarkdownTag(
                        "\n**苏格拉底式反思性问题：**\n> "
                      )
                    }
                    className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px]"
                  >
                    + 苏格拉底反诘
                  </button>
                  <button
                    onClick={() =>
                      insertMarkdownTag(
                        "\n1. 【明示前提 (Explicit Premises)】: P1\n2. 【隐涵假设 (Suppressed Premises)】: T1\n3. 【推导逻辑链 (Inference Chain)】: P1 ∧ T1 ⊢ C\n4. 【形式漏洞与反例判别】: 无\n"
                      )
                    }
                    className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 font-mono text-[11px]"
                  >
                    + 四栏解构
                  </button>
                  <div className="ml-auto text-[10px] text-stone-400 font-mono hidden sm:block">
                    按 Ctrl+S 即时同步本地记忆
                  </div>
                </div>
              )}

              {/* Editor / Preview Content Panes */}
              <div className="flex-1 grid grid-cols-1 overflow-hidden" style={{ minHeight: "560px" }}>
                {viewMode === "split" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 h-full">
                    {/* Left: Code Textarea */}
                    <div className="p-3.5 bg-stone-900 text-stone-100 flex flex-col h-full">
                      <textarea
                        ref={editorTextareaRef}
                        value={activeContent}
                        onChange={(e) => {
                          setActiveContent(e.target.value);
                          setIsModified(true);
                        }}
                        placeholder="在此手动编辑 EverOS Markdown 记忆档案..."
                        className="w-full flex-1 bg-transparent text-stone-100 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-amber-600 selection:text-white"
                        spellCheck={false}
                      />
                    </div>

                    {/* Right: Rich Preview */}
                    <div className="p-6 bg-stone-50/70 overflow-y-auto h-full max-h-[620px] text-stone-800">
                      <div className="prose prose-stone prose-sm max-w-none font-serif leading-relaxed">
                        <Markdown>{activeContent || "*暂无内容*"}</Markdown>
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === "edit" && (
                  <div className="p-4 bg-stone-900 text-stone-100 h-full flex flex-col">
                    <textarea
                      ref={editorTextareaRef}
                      value={activeContent}
                      onChange={(e) => {
                        setActiveContent(e.target.value);
                        setIsModified(true);
                      }}
                      placeholder="在此手动编辑 EverOS Markdown 记忆档案..."
                      className="w-full flex-1 min-h-[540px] bg-transparent text-stone-100 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-amber-600 selection:text-white"
                      spellCheck={false}
                    />
                  </div>
                )}

                {viewMode === "preview" && (
                  <div className="p-8 bg-white overflow-y-auto max-h-[640px]">
                    <div className="prose prose-stone max-w-none font-serif leading-relaxed text-stone-900">
                      <Markdown>{activeContent || "*暂无内容*"}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subtab 2: Academic Profile Form */}
          {activeSubTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    学者画像配置与中译本权威约定
                  </h3>
                  <p className="text-xs text-stone-500 font-serif mt-0.5">
                    模型在推导时将强制采用此处的学术流派取向、译者版本与概念锚定原则。对应本地档案: <code className="text-amber-700 bg-amber-50 px-1 rounded">profiles/scholar_profile.md</code>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleSelectFile("profiles/scholar_profile.md")}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>查看底层 Markdown</span>
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-md bg-stone-900 text-stone-100 hover:bg-stone-800 text-xs font-medium transition-colors shadow-xs"
                  >
                    {savedProfile ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                    <span>{savedProfile ? "已同步至 EverOS" : "保存学术画像"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    学者姓名 / 研讨代号
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    主攻哲学流派 (School of Thought)
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  当前毕业论文 / 核心研究课题 (Thesis Topic)
                </label>
                <input
                  type="text"
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-800 font-serif"
                />
              </div>

              {/* Translation Edition Alignments */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    权威中译本与译者脉络对齐 (Authorized Translation Editions)
                  </label>
                  <span className="text-[11px] text-stone-500 font-serif">如邓晓芒 vs 蓝公武、陈嘉映 vs 孙周兴</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(alignments).map(([author, edition]) => (
                    <div key={author} className="flex items-center space-x-2">
                      <span className="w-44 text-xs font-serif font-bold text-stone-800 bg-stone-100 px-2 py-1.5 rounded border border-stone-200">
                        {author}
                      </span>
                      <input
                        type="text"
                        value={edition}
                        onChange={(e) =>
                          setAlignments({ ...alignments, [author]: e.target.value })
                        }
                        className="flex-1 text-xs px-3 py-1.5 rounded bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Strict Terminological Bindings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    核心术语刚性约束 (Concept Anchors - 严禁概念泛化)
                  </label>
                  <span className="text-[11px] text-stone-500 font-serif">防止被日常语言带偏</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(anchors).map(([term, def]) => (
                    <div key={term} className="flex items-center space-x-2">
                      <span className="w-36 text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2 py-1.5 rounded border border-amber-200">
                        {term}
                      </span>
                      <input
                        type="text"
                        value={def}
                        onChange={(e) =>
                          setAnchors({ ...anchors, [term]: e.target.value })
                        }
                        className="flex-1 text-xs px-3 py-1.5 rounded bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Subtab 3: Collective Consensus Graph */}
          {activeSubTab === "consensus" && (
            <div className="space-y-4">
              {/* Action & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="搜索共识概念、哲学家或流派标签..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2 rounded-lg bg-stone-50 border border-stone-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleSelectFile("facts/consensuses.md")}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 transition-colors whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4" />
                    <span>查看 facts/consensuses.md</span>
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-md bg-stone-900 text-stone-100 hover:bg-stone-800 text-xs font-medium transition-colors shadow-xs whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>录入新研讨共识节点</span>
                  </button>
                </div>
              </div>

              {/* Consensus Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConsensus.map((node) => (
                  <div
                    key={node.id}
                    className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3 hover:border-stone-400 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {node.school_context}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-stone-900 mt-1.5">
                          {node.concept}
                        </h4>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    </div>

                    <div className="text-xs font-serif leading-relaxed text-stone-700 bg-stone-50 p-3 rounded border border-stone-200/80">
                      <div className="font-bold text-stone-900 mb-1 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>公认研讨定性 (Affirmation):</span>
                      </div>
                      <p>{node.affirmation}</p>
                    </div>

                    <div className="text-xs font-serif leading-relaxed text-amber-900 bg-amber-50/70 p-3 rounded border border-amber-200/80">
                      <div className="font-bold text-amber-950 mb-1 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>概念漂移防线 (Drift Guard):</span>
                      </div>
                      <p>{node.negation_or_drift_warning}</p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between text-[11px] text-stone-500 font-mono gap-1">
                      <span>研讨来源: {node.source_seminar}</span>
                      <div className="flex space-x-1">
                        {node.tags?.map((t) => (
                          <span key={t} className="bg-stone-100 px-1.5 py-0.5 rounded text-[10px] text-stone-600">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Create New Memory File */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-amber-600" />
                <span>新建 EverOS 记忆档案</span>
              </h3>
              <button
                onClick={() => setShowNewFileModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  所属 EverOS 记忆分类目录
                </label>
                <select
                  value={newFileFolder}
                  onChange={(e) => setNewFileFolder(e.target.value as EverOSFolderType)}
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-md font-mono text-stone-800 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="profiles">profiles/ (学者画像与公理约束)</option>
                  <option value="facts">facts/ (共识图谱与本体论断言)</option>
                  <option value="episodes">episodes/ (研讨纪要与会话切片)</option>
                  <option value="foresights">foresights/ (未决反思课题与二律背反)</option>
                  <option value="skills">skills/ (思辨技能模态)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  档案名称 (如 kant_synthetic_a_priori.md)
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="例如: heidegger_time_consciousness.md"
                  required
                  className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md font-mono text-stone-800 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowNewFileModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-md shadow-xs transition-colors"
                >
                  创建档案
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Consensus Node */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900 border-b border-stone-200 pb-2">
              录入学术研讨确立之共识节点
            </h3>

            <form onSubmit={handleCreateConsensus} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  核心概念名 (含原语言词缀)
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: 康德先验统觉 (Transzendentale Apperzeption)"
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-stone-50 border border-stone-300 focus:bg-white font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  所属哲学流派
                </label>
                <input
                  type="text"
                  required
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-stone-50 border border-stone-300 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1 text-emerald-800">
                  公认研讨定性 (Affirmation - 正向命题公理)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="说明该概念在研讨班中所确立的确定内涵..."
                  value={newAffirmation}
                  onChange={(e) => setNewAffirmation(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-stone-50 border border-stone-300 focus:bg-white font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1 text-amber-800">
                  概念漂移防线 (Drift Guard - 严禁混淆/误用警告)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="说明严禁将此概念与何种日常/通俗心理学概念混淆..."
                  value={newWarning}
                  onChange={(e) => setNewWarning(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-stone-50 border border-stone-300 focus:bg-white font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  经典文献引据 (分号分隔)
                </label>
                <input
                  type="text"
                  value={newCitations}
                  onChange={(e) => setNewCitations(e.target.value)}
                  className="w-full text-xs p-2 rounded bg-white border border-stone-300 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    研讨班来源
                  </label>
                  <input
                    type="text"
                    value={newSeminar}
                    onChange={(e) => setNewSeminar(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-white border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    标签 (逗号分隔)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-white border border-stone-300"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs rounded text-stone-600 hover:bg-stone-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs rounded bg-stone-900 text-stone-100 hover:bg-stone-800"
                >
                  录入共识记忆
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

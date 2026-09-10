import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import JSZip from "jszip";
import {
  Folder,
  FileText,
  Save,
  Download,
  Upload,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Eye,
  Edit3,
  Columns,
  RefreshCw,
  Zap,
  FolderOpen,
  Info,
  Archive,
  ChevronDown,
  ChevronRight,
  FileCode,
  ShieldAlert
} from "lucide-react";
import { EverOSMemoryFile, EverOSFolderType, ChatMessage, AcademicProfile } from "../types";

interface EverOSArchiveTreeViewProps {
  messages: ChatMessage[];
  profile: AcademicProfile;
  onRefreshConsensus?: () => void;
  onRefreshProfile?: () => void;
}

const FOLDER_CONFIG: Record<
  EverOSFolderType,
  { name: string; title: string; desc: string; iconColor: string; defaultExpanded?: boolean }
> = {
  profiles: {
    name: "profiles",
    title: "学者画像与公理 (Profiles)",
    desc: "个人流派、权威中译本与先验防漂移规范",
    iconColor: "text-amber-500",
    defaultExpanded: true
  },
  facts: {
    name: "facts",
    title: "共识图谱与断言 (Facts)",
    desc: "研讨班确立之本体论公识与经典文献引证",
    iconColor: "text-emerald-500",
    defaultExpanded: true
  },
  episodes: {
    name: "episodes",
    title: "研讨纪要与会话 (Episodes)",
    desc: "带时间戳与前设审查的研讨回合实录",
    iconColor: "text-sky-500",
    defaultExpanded: true
  },
  foresights: {
    name: "foresights",
    title: "未决反思课题 (Foresights)",
    desc: "形而上学二律背反与苏格拉底深渊反思",
    iconColor: "text-purple-500",
    defaultExpanded: false
  },
  skills: {
    name: "skills",
    title: "思辨技能与模态 (Skills)",
    desc: "四栏解构、词源考释与对勘形式规范",
    iconColor: "text-rose-500",
    defaultExpanded: false
  }
};

export const EverOSArchiveTreeView: React.FC<EverOSArchiveTreeViewProps> = ({
  messages,
  profile,
  onRefreshConsensus,
  onRefreshProfile
}) => {
  const [files, setFiles] = useState<EverOSMemoryFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>("profiles/scholar_profile.md");
  const [activeContent, setActiveContent] = useState<string>("");
  const [isModified, setIsModified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"preview" | "edit" | "split">("split");

  // Folder collapse state
  const [folderOpen, setFolderOpen] = useState<Record<string, boolean>>({
    profiles: true,
    facts: true,
    episodes: true,
    foresights: true,
    skills: true
  });

  // Modals state
  const [showNewFileModal, setShowNewFileModal] = useState<boolean>(false);
  const [newFileFolder, setNewFileFolder] = useState<EverOSFolderType>("profiles");
  const [newFileName, setNewFileName] = useState<string>("");
  const [isSyncingEpisode, setIsSyncingEpisode] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch file tree
  const fetchTree = async (selectPath?: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/everos/archive/tree");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        const targetPath = selectPath || activeFilePath;
        const exists = (data.files || []).some((f: EverOSMemoryFile) => f.path === targetPath);
        if (exists) {
          loadFile(targetPath);
        } else if ((data.files || []).length > 0) {
          loadFile(data.files[0].path);
        }
      }
    } catch (err) {
      console.error("Failed to load EverOS tree:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load single file content
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
      console.error("Failed to load file content:", err);
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
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFilePath, activeContent]);

  // Save current file
  const handleSave = async () => {
    if (!activeFilePath) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/everos/archive/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: activeFilePath,
          content: activeContent
        })
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
      console.error("Failed to save file:", err);
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
          filename: newFileName.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setShowNewFileModal(false);
        setNewFileName("");
        await fetchTree(data.file.path);
      }
    } catch (err) {
      console.error("Failed to create file:", err);
    }
  };

  // Delete file
  const handleDelete = async () => {
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
        body: JSON.stringify({ path: activeFilePath })
      });
      if (res.ok) {
        await fetchTree("profiles/scholar_profile.md");
      }
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  // Sync active seminar to Episode markdown
  const handleSyncEpisode = async () => {
    if (messages.length === 0) {
      alert("当前终端尚无论辩记录，请先在研讨终端中开展对话。");
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
          school: profile.school_of_thought
        })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchTree(data.file.path);
      }
    } catch (err) {
      console.error("Failed to sync episode:", err);
    } finally {
      setIsSyncingEpisode(false);
    }
  };

  // Copy active markdown
  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export single active file
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

  // Export all as ZIP
  const handleExportAllZip = async () => {
    try {
      const res = await fetch("/api/everos/archive/export-all");
      if (!res.ok) return;
      const data = await res.json();
      const zip = new JSZip();

      // Create ~/.everos root folder inside zip
      const rootFolder = zip.folder(".everos") || zip;

      (data.files || []).forEach((f: any) => {
        rootFolder.file(f.path, f.content);
      });

      // Add a README.md explaining portability
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
            content: content
          })
        });
        if (res.ok) {
          const data = await res.json();
          await fetchTree(data.file.path);
        }
      } catch (err) {
        console.error("Failed to import file:", err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Quick markdown insertion helpers
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

  // Filter files by search query
  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.categoryTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFileMeta = files.find((f) => f.path === activeFilePath);
  const wordCount = activeContent.trim().length;
  const lineCount = activeContent.split("\n").length;

  return (
    <div id="everos-archive-manager" className="max-w-7xl mx-auto space-y-4">
      {/* Top Banner & Quick Actions */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono">
            <Archive className="w-4 h-4" />
            <span>EverMind-AI/EverOS · Markdown-Native Portable Memory Tree</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-100">
            EverOS 本地记忆档案树与双向编辑器
          </h2>
          <p className="text-xs text-stone-400 font-serif max-w-3xl leading-relaxed">
            遵循 EverOS 标准规范，将哲学学者画像、本体论共识、研讨纪要与反思课题完全解构为可追溯、可版本化、纯文本存储的 Markdown 规范文件（~/.everos/）。支持实时双向编辑、共识引擎联动与一键打包离线迁移。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncEpisode}
            disabled={isSyncingEpisode}
            title="将当前研讨终端中的论辩回合沉淀为新的 Episode 档案"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-semibold shadow-xs transition-colors"
          >
            <Zap className={`w-3.5 h-3.5 ${isSyncingEpisode ? "animate-spin" : ""}`} />
            <span>{isSyncingEpisode ? "沉淀中..." : "沉淀当前研讨为 Episode"}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="导入外部 Markdown 记忆文件"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>导入 .md</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".md,.markdown,.txt"
            className="hidden"
          />

          <button
            onClick={handleExportAllZip}
            title="打包导出 ~/.everos 全库为 ZIP 压缩包"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>打包下载全库 (.zip)</span>
          </button>
        </div>
      </div>

      {/* Main Two-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: File Tree Explorer (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col overflow-hidden">
          {/* Tree Header */}
          <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-4 h-4 text-stone-700" />
              <span className="font-mono text-xs font-bold text-stone-800 tracking-tight">~/.everos/</span>
              <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-mono">
                {files.length} files
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowNewFileModal(true)}
                title="新建记忆档案"
                className="p-1 rounded hover:bg-stone-200 text-stone-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchTree(activeFilePath)}
                title="重新加载档案树"
                className="p-1 rounded hover:bg-stone-200 text-stone-700 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Search Filter */}
          <div className="p-2.5 border-b border-stone-100 bg-stone-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索档案名、流派或概念..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800 placeholder-stone-400 font-sans"
              />
            </div>
          </div>

          {/* Folder & File Tree List */}
          <div className="p-2 space-y-1 max-h-[620px] overflow-y-auto">
            {(Object.keys(FOLDER_CONFIG) as EverOSFolderType[]).map((folderKey) => {
              const cfg = FOLDER_CONFIG[folderKey];
              const folderFiles = filteredFiles.filter((f) => f.folder === folderKey);
              const isOpen = folderOpen[folderKey] ?? true;

              if (searchQuery && folderFiles.length === 0) return null;

              return (
                <div key={folderKey} className="rounded-lg overflow-hidden border border-stone-100 bg-stone-50/30">
                  {/* Folder Row */}
                  <button
                    onClick={() => setFolderOpen((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }))}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-stone-100 text-stone-800 transition-colors"
                  >
                    <div className="flex items-center space-x-1.5">
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      )}
                      <Folder className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                      <span className="text-xs font-semibold font-mono">{cfg.name}/</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-stone-400 font-mono">({folderFiles.length})</span>
                    </div>
                  </button>

                  {/* Subtree Files */}
                  {isOpen && (
                    <div className="pl-5 pr-1.5 pb-1 space-y-0.5">
                      {folderFiles.length === 0 ? (
                        <div className="text-[11px] text-stone-400 italic py-1 pl-2">暂无档案</div>
                      ) : (
                        folderFiles.map((file) => {
                          const isActive = file.path === activeFilePath;
                          return (
                            <button
                              key={file.path}
                              onClick={() => loadFile(file.path)}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-all ${
                                isActive
                                  ? "bg-amber-100/70 text-amber-950 font-medium shadow-2xs border border-amber-200"
                                  : "hover:bg-stone-100 text-stone-700"
                              }`}
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                <FileText
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isActive ? "text-amber-700" : "text-stone-400"
                                  }`}
                                />
                                <span className="text-xs font-mono truncate">{file.name}</span>
                              </div>
                              <span className="text-[10px] text-stone-400 font-mono shrink-0">
                                {file.size ? `${(file.size / 1024).toFixed(1)}k` : "0k"}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Specification Note */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 font-serif space-y-1">
            <div className="flex items-center space-x-1 text-stone-700 font-semibold">
              <Info className="w-3 h-3 text-amber-600" />
              <span>EverOS 架构解耦原则</span>
            </div>
            <p className="leading-relaxed">
              记忆档案遵循 User-Side（画像、共识、纪要）与 Agent-Side（技能包）严格隔离，保证学术立场在跨 Agent 迁移时不发生概念漂移。
            </p>
          </div>
        </div>

        {/* Right Column: Markdown Editor & Live Preview (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col overflow-hidden min-h-[680px]">
          {/* Editor Header Bar */}
          <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
            {/* File Path & Meta */}
            <div className="flex items-center space-x-2 min-w-0">
              <FileCode className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-stone-900 truncate">
                    ~/.everos/{activeFilePath}
                  </span>
                  {isModified && (
                    <span className="text-[10px] bg-amber-500 text-stone-950 font-bold px-1.5 py-0.2 rounded">
                      未保存
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-stone-500 font-serif flex items-center space-x-3 mt-0.5">
                  <span>{wordCount} 字符</span>
                  <span>·</span>
                  <span>{lineCount} 行</span>
                  <span>·</span>
                  <span>{activeFileMeta?.categoryTitle || "学术记忆"}</span>
                </div>
              </div>
            </div>

            {/* Mode Toggle & Tools */}
            <div className="flex items-center space-x-2">
              {/* View Mode Switcher */}
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
                  <span className="hidden sm:inline">预览</span>
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
                  <span className="hidden sm:inline">分栏</span>
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
                  <span className="hidden sm:inline">源码</span>
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleCopy}
                title="复制 Markdown 全文"
                className="p-1.5 rounded-md hover:bg-stone-200 text-stone-600 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleExportSingle}
                title="下载当前 Markdown 文件"
                className="p-1.5 rounded-md hover:bg-stone-200 text-stone-600 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleDelete}
                title="删除当前文件"
                className="p-1.5 rounded-md hover:bg-rose-100 text-rose-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleSave}
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

          {/* Quick Format Toolbar (when in edit or split mode) */}
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
                Quote
              </button>
              <button
                onClick={() => insertMarkdownTag("`", "`")}
                className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 font-mono text-[11px]"
              >
                Code
              </button>
              <button
                onClick={() =>
                  insertMarkdownTag(
                    "\n| 范畴维度 | 康德批判体系 | 海德格尔生存论 |\n| :--- | :--- | :--- |\n| 奠基形式 | 先验统觉 | 此在生存 |\n"
                  )
                }
                className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 text-[11px]"
              >
                + 对勘表格
              </button>
              <button
                onClick={() =>
                  insertMarkdownTag(
                    "---\ntype: custom_consensus\nlast_sync: " + new Date().toISOString() + "\n---\n\n"
                  )
                }
                className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 text-amber-800 border border-amber-300 font-mono text-[11px]"
              >
                + Frontmatter
              </button>
              <div className="ml-auto text-[10px] text-stone-400 font-mono hidden sm:block">
                按快捷键 Ctrl+S 保存生效
              </div>
            </div>
          )}

          {/* Main Content Area: Editor / Split / Preview */}
          <div className="flex-1 grid grid-cols-1 overflow-hidden" style={{ minHeight: "540px" }}>
            {viewMode === "split" && (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 h-full">
                {/* Left pane: Textarea editor */}
                <div className="p-3 bg-stone-900 text-stone-100 flex flex-col h-full">
                  <textarea
                    ref={editorTextareaRef}
                    value={activeContent}
                    onChange={(e) => {
                      setActiveContent(e.target.value);
                      setIsModified(true);
                    }}
                    placeholder="在此编辑 EverOS Markdown 内容..."
                    className="w-full flex-1 bg-transparent text-stone-100 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-amber-600 selection:text-white"
                    spellCheck={false}
                  />
                </div>

                {/* Right pane: Rendered Preview */}
                <div className="p-6 bg-stone-50/70 overflow-y-auto h-full max-h-[600px] text-stone-800">
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
                  placeholder="在此编辑 EverOS Markdown 内容..."
                  className="w-full flex-1 min-h-[520px] bg-transparent text-stone-100 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-amber-600 selection:text-white"
                  spellCheck={false}
                />
              </div>
            )}

            {viewMode === "preview" && (
              <div className="p-8 bg-white overflow-y-auto max-h-[620px]">
                <div className="prose prose-stone max-w-none font-serif leading-relaxed text-stone-900">
                  <Markdown>{activeContent || "*暂无内容*"}</Markdown>
                </div>
              </div>
            )}
          </div>
        </div>
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
                  所属 EverOS 分类目录
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
    </div>
  );
};

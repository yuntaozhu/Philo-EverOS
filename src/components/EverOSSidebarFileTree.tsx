import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileText,
  Plus,
  RefreshCw,
  Upload,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  Zap,
  Info,
  ChevronLeft,
  SlidersHorizontal
} from "lucide-react";
import { EverOSMemoryFile, EverOSFolderType } from "../types";

export interface EverOSSidebarFileTreeProps {
  files: EverOSMemoryFile[];
  activeFilePath: string;
  isModified?: boolean;
  isLoading?: boolean;
  totalSize?: number;
  onSelectFile: (path: string) => void;
  onRefreshTree: () => void;
  onNewFile: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportAllZip: () => void;
  onSyncEpisode?: () => void;
  isSyncingEpisode?: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const FOLDER_METADATA: Record<
  string,
  { name: string; title: string; desc: string; iconColor: string; defaultOpen: boolean }
> = {
  profiles: {
    name: "profiles",
    title: "学者画像与公理 (Profiles)",
    desc: "个人流派、权威中译本与先验防漂移规范",
    iconColor: "text-amber-500",
    defaultOpen: true,
  },
  facts: {
    name: "facts",
    title: "共识图谱与断言 (Facts)",
    desc: "研讨班确立之本体论公识与经典文献引证",
    iconColor: "text-emerald-500",
    defaultOpen: true,
  },
  episodes: {
    name: "episodes",
    title: "研讨纪要与会话 (Episodes)",
    desc: "带时间戳与前设审查的研讨回合实录",
    iconColor: "text-sky-500",
    defaultOpen: true,
  },
  foresights: {
    name: "foresights",
    title: "未决反思课题 (Foresights)",
    desc: "形而上学二律背反与苏格拉底深渊反思",
    iconColor: "text-purple-500",
    defaultOpen: true,
  },
  skills: {
    name: "skills",
    title: "思辨技能与模态 (Skills)",
    desc: "四栏解构、词源考释与对勘形式规范",
    iconColor: "text-rose-500",
    defaultOpen: true,
  },
};

export const EverOSSidebarFileTree: React.FC<EverOSSidebarFileTreeProps> = ({
  files,
  activeFilePath,
  isModified = false,
  isLoading = false,
  totalSize = 0,
  onSelectFile,
  onRefreshTree,
  onNewFile,
  onImportFile,
  onExportAllZip,
  onSyncEpisode,
  isSyncingEpisode = false,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [folderOpen, setFolderOpen] = useState<Record<string, boolean>>({
    profiles: true,
    facts: true,
    episodes: true,
    foresights: true,
    skills: true,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Group files by root folder and subfolders
  const filteredFiles = files.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.path.toLowerCase().includes(q) ||
      f.folder.toLowerCase().includes(q) ||
      (f.categoryTitle && f.categoryTitle.toLowerCase().includes(q)) ||
      (f.subfolder && f.subfolder.toLowerCase().includes(q))
    );
  });

  // Collect all unique root folders present in files plus standard ones
  const allFolderKeys = Array.from(
    new Set([...Object.keys(FOLDER_METADATA), ...files.map((f) => f.folder)])
  );

  const toggleFolder = (folderKey: string) => {
    setFolderOpen((prev) => ({
      ...prev,
      [folderKey]: prev[folderKey] === undefined ? false : !prev[folderKey],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    allFolderKeys.forEach((k) => (next[k] = true));
    setFolderOpen(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    allFolderKeys.forEach((k) => (next[k] = false));
    setFolderOpen(next);
  };

  const formattedTotalSize = (totalSize / 1024).toFixed(1);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-stone-900 border border-stone-800 rounded-xl p-2 flex flex-col items-center justify-between shadow-xs transition-all shrink-0">
        <div className="flex flex-col items-center space-y-3 w-full">
          <button
            onClick={onToggleCollapse}
            title="展开记忆档案树侧边栏"
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          <div className="w-6 h-px bg-stone-800" />
          <button
            onClick={onNewFile}
            title="新建记忆档案"
            className="p-1.5 rounded-md hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onRefreshTree}
            title="刷新档案树"
            className="p-1.5 rounded-md hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onExportAllZip}
            title="打包导出全库 (.zip)"
            className="p-1.5 rounded-md hover:bg-stone-800 text-amber-400 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-2 text-[10px] text-stone-400 font-mono">
          <span className="[writing-mode:vertical-lr] tracking-widest text-stone-400">~/.everos</span>
          <span className="bg-stone-800 px-1 py-0.5 rounded text-[9px] text-amber-400">{files.length}</span>
        </div>
      </div>
    );
  }

  return (
    <aside
      id="everos-file-manager-sidebar"
      className="w-full md:w-80 lg:w-88 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col overflow-hidden shrink-0"
    >
      {/* Sidebar Header Bar */}
      <div className="p-3.5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center space-x-2 min-w-0">
          <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-xs font-bold text-stone-100 truncate">
                ~/.everos/
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                {files.length} 篇
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-serif truncate">
              长期记忆库 · {formattedTotalSize} KB 本地存储
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleCollapse}
            title="收起侧边栏"
            className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Toolbar */}
      <div className="p-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-1 text-xs">
        <div className="flex items-center space-x-1">
          <button
            onClick={onNewFile}
            title="新建 Markdown 档案"
            className="flex items-center space-x-1 px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-100 text-[11px] font-medium transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="导入外部 Markdown 记忆文件"
            className="flex items-center space-x-1 px-2 py-1 rounded bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-[11px] font-medium transition-colors"
          >
            <Upload className="w-3 h-3 text-stone-500" />
            <span>导入</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportFile}
            accept=".md,.markdown,.txt"
            className="hidden"
          />

          <button
            onClick={onExportAllZip}
            title="打包下载全库为 .zip 压缩包"
            className="flex items-center space-x-1 px-2 py-1 rounded bg-white hover:bg-stone-100 text-amber-800 border border-amber-200 text-[11px] font-medium transition-colors"
          >
            <Download className="w-3 h-3 text-amber-600" />
            <span>全库.zip</span>
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onRefreshTree}
            title="递归重新扫描档案目录"
            className="p-1 rounded hover:bg-stone-200 text-stone-600 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-2.5 bg-stone-50/70 border-b border-stone-200">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索记忆档案、概念或分类..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800 placeholder-stone-400 font-sans"
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1 px-0.5">
          <span>{searchQuery ? `匹配到 ${filteredFiles.length} 个结果` : "支持递归子目录扫描"}</span>
          <div className="space-x-1.5">
            <button
              onClick={expandAll}
              className="text-stone-500 hover:text-stone-800 underline decoration-dotted"
            >
              展开全部
            </button>
            <span>·</span>
            <button
              onClick={collapseAll}
              className="text-stone-500 hover:text-stone-800 underline decoration-dotted"
            >
              折叠全部
            </button>
          </div>
        </div>
      </div>

      {/* Recursive Folder & File Tree */}
      <div className="flex-1 p-2 space-y-1.5 overflow-y-auto max-h-[580px] bg-stone-50/30">
        {filteredFiles.length === 0 && (
          <div className="text-center py-8 text-xs text-stone-400 font-serif">
            {searchQuery ? "未找到匹配的记忆档案" : "记忆档案库为空"}
          </div>
        )}

        {allFolderKeys.map((folderKey) => {
          const cfg = FOLDER_METADATA[folderKey] || {
            name: folderKey,
            title: `${folderKey}/ (自定义目录)`,
            desc: "自定义形而上学或学术模块档案",
            iconColor: "text-stone-600",
            defaultOpen: true,
          };
          const folderFiles = filteredFiles.filter((f) => f.folder === folderKey);
          const isOpen = folderOpen[folderKey] ?? cfg.defaultOpen;

          if (searchQuery && folderFiles.length === 0) return null;

          return (
            <div
              key={folderKey}
              className="rounded-lg border border-stone-200/80 bg-white overflow-hidden shadow-2xs"
            >
              {/* Folder Row */}
              <button
                onClick={() => toggleFolder(folderKey)}
                className="w-full flex items-center justify-between px-2.5 py-2 text-left hover:bg-stone-50 text-stone-800 transition-colors group"
              >
                <div className="flex items-center space-x-1.5 min-w-0">
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 shrink-0" />
                  )}
                  <Folder className={`w-3.5 h-3.5 ${cfg.iconColor} shrink-0`} />
                  <span className="text-xs font-semibold font-mono text-stone-800 truncate">
                    {cfg.name}/
                  </span>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <span className="text-[10px] text-stone-400 font-mono bg-stone-100 px-1.5 py-0.2 rounded">
                    {folderFiles.length}
                  </span>
                </div>
              </button>

              {/* Folder Content (Nested Subfolder / Files) */}
              {isOpen && (
                <div className="pl-4 pr-1.5 pb-1.5 pt-0.5 space-y-0.5 border-t border-stone-100 bg-stone-50/50">
                  {folderFiles.length === 0 ? (
                    <div className="text-[11px] text-stone-400 italic py-1.5 pl-3">
                      暂无档案
                    </div>
                  ) : (
                    folderFiles.map((file) => {
                      const isActive = file.path === activeFilePath;
                      return (
                        <button
                          key={file.path}
                          onClick={() => onSelectFile(file.path)}
                          title={`${file.path} (${(file.size / 1024).toFixed(1)} KB)`}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-all ${
                            isActive
                              ? "bg-amber-100 text-amber-950 font-medium shadow-2xs border border-amber-300"
                              : "hover:bg-stone-200/60 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <FileText
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive ? "text-amber-700" : "text-stone-400"
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1">
                                {file.subfolder && (
                                  <span className="text-[10px] text-stone-400 font-mono truncate">
                                    {file.subfolder}/
                                  </span>
                                )}
                                <span className="text-xs font-mono truncate">
                                  {file.name}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0 pl-1">
                            {isActive && isModified && (
                              <span
                                className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                                title="有未保存修改"
                              />
                            )}
                            <span className="text-[10px] text-stone-400 font-mono">
                              {(file.size / 1024).toFixed(1)}k
                            </span>
                          </div>
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

      {/* Sync Active Seminar Quick Action */}
      {onSyncEpisode && (
        <div className="p-2.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-stone-700">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-medium font-serif">研讨沉淀</span>
          </div>
          <button
            onClick={onSyncEpisode}
            disabled={isSyncingEpisode}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-100 text-[11px] font-medium transition-colors shadow-2xs disabled:opacity-50"
          >
            <Zap className={`w-3 h-3 ${isSyncingEpisode ? "animate-spin" : ""}`} />
            <span>{isSyncingEpisode ? "沉淀中..." : "沉淀为 Episode"}</span>
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-2.5 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 font-serif flex items-center justify-between">
        <div className="flex items-center space-x-1 text-stone-600">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>EverOS Portable Memory</span>
        </div>
        <span className="text-[10px] text-stone-400 font-mono">
          Markdown Native
        </span>
      </div>
    </aside>
  );
};

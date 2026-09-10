import React, { useState, useEffect } from "react";
import { 
  Code2, 
  FileCode, 
  FolderGit2, 
  Copy, 
  Check, 
  Terminal,
  FileCheck
} from "lucide-react";

export const CodebaseExplorerView: React.FC = () => {
  const [fileList, setFileList] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("engine/model_loader.py");
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/codebase/files")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFileList(data);
          if (data.length > 0) {
            loadFileContent(data[1] || data[0]); // default to model_loader or first
          }
        }
      })
      .catch(console.error);
  }, []);

  const loadFileContent = (path: string) => {
    setSelectedFile(path);
    setLoading(true);
    fetch(`/api/codebase/file-content?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((data) => {
        setFileContent(data.content || "");
        setLoading(false);
      })
      .catch((err) => {
        setFileContent(`# Error loading file: ${err.message}`);
        setLoading(false);
      });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-5 border border-stone-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FolderGit2 className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="font-serif font-bold text-base text-stone-100">
              Philo-EverOS Python 核心架构源码库
            </h2>
            <p className="text-xs text-stone-400 font-mono">
              包含 RTX 5090 显存独占加载器、EverOS 记忆海马体、Prompt 编排中枢与技能自演进引擎
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-stone-400 bg-stone-800 px-3 py-1.5 rounded border border-stone-700">
          共 {fileList.length} 个核心源文件
        </div>
      </div>

      {/* Explorer Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Left Column: File Tree */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-xs space-y-1 max-h-[680px] overflow-y-auto">
          <div className="text-[11px] font-mono text-stone-400 px-2 py-1 uppercase tracking-wider">
            PROJECT SOURCE TREE
          </div>
          {fileList.map((f) => {
            const isSelected = selectedFile === f;
            return (
              <button
                key={f}
                onClick={() => loadFileContent(f)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-2 transition-colors ${
                  isSelected
                    ? "bg-stone-900 text-amber-300 font-bold shadow-xs"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isSelected ? "text-amber-300" : "text-stone-400"}`} />
                <span className="truncate">{f}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Code Viewer */}
        <div className="md:col-span-3 bg-stone-950 text-stone-100 rounded-xl border border-stone-800 shadow-sm flex flex-col overflow-hidden">
          <div className="bg-stone-900/90 border-b border-stone-800 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-stone-300">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{selectedFile}</span>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制" : "复制代码"}</span>
            </button>
          </div>

          <div className="p-4 overflow-x-auto max-h-[630px] font-mono text-xs leading-relaxed">
            {loading ? (
              <div className="py-20 text-center text-stone-500">正在读取源文件...</div>
            ) : (
              <pre className="text-stone-300">{fileContent}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

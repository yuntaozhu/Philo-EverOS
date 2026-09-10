import React from "react";
import { 
  BookOpen, 
  Brain, 
  Sparkles, 
  Cpu, 
  SlidersHorizontal, 
  Code2, 
  Layers
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  consensusCount: number;
  crystallizedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  consensusCount,
  crystallizedCount,
}) => {
  const tabs = [
    { id: "seminar", label: "学术研讨终端", icon: BookOpen },
    { id: "memory", label: `EverOS 长期记忆 (${consensusCount})`, icon: Brain },
    { id: "crystallizer", label: `技能自结晶 (${crystallizedCount})`, icon: Sparkles },
    { id: "hardware", label: "双卡 5090 算力与 Docker", icon: Cpu },
    { id: "feedback", label: "学术反馈与对齐库", icon: SlidersHorizontal },
    { id: "codebase", label: "Python 源码工程", icon: Code2 },
  ];

  return (
    <header className="border-b border-stone-200 bg-stone-50/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-serif font-bold text-xl shadow-sm border border-stone-700">
              Φ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif font-bold text-lg text-stone-900 tracking-tight">
                  Philo-EverOS
                </h1>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-900 border border-emerald-300">
                  双卡 5090 (64GB GDDR7)
                </span>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 border border-amber-300 hidden sm:inline-flex">
                  豆包 & Gemini 协同
                </span>
              </div>
              <p className="text-xs text-stone-500 font-serif italic">
                数字哲学研讨与学术共建平台 · 概念防漂移与范式自动结晶
              </p>
            </div>
          </div>

          {/* Quick Engine Indicator */}
          <div className="hidden lg:flex items-center space-x-3 text-xs font-mono text-stone-600">
            <div className="flex items-center space-x-1.5 bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>bfloat16 + SDPA (Zero-Offload)</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>OpenAI API /v1</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none py-1 border-t border-stone-200/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-stone-900 text-stone-100 shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-stone-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

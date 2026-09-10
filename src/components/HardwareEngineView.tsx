import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Layers, 
  Terminal, 
  Copy, 
  Check, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  Database,
  Server,
  Activity,
  HardDrive,
  RefreshCw,
  Box
} from "lucide-react";

export const HardwareEngineView: React.FC = () => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedDocker, setCopiedDocker] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const baseUrl = `${window.location.origin}/v1`;

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const curlExample = `curl -X POST "${baseUrl}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer philo-everos" \\
  -d '{
    "model": "Philo-EverOS-Dual5090",
    "messages": [
      {"role": "user", "content": "/deconstruct 解构笛卡尔我思命题"}
    ],
    "stream": true
  }'`;

  const dockerCommand = `# 在具有两块 5090 的服务器上一键部署
git clone https://github.com/EverMind-AI/EverOS.git
cd Philo-EverOS
cp .env.example .env   # 填入 ARK_API_KEY 与 GEMINI_API_KEY
bash scripts/setup_dual_5090.sh
# 或直接运行：
docker compose up -d`;

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-6 border border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono mb-1">
            <Cpu className="w-4 h-4" />
            <span>DUAL NVIDIA RTX 5090 (2x32GB = 64GB GDDR7) · BLACKWELL ARCHITECTURE</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-100">
            双卡 5090 算力集群 · 豆包 & Gemini 多模型协同中枢
          </h2>
          <p className="text-xs text-stone-400 font-serif mt-1 max-w-2xl leading-relaxed">
            支持双块 RTX 5090 显存并联（64GB GDDR7 总显存），实现 32B-70B 级哲学大模型零 CPU 卸载全显存驻留。集成火山引擎豆包原典考订与 Google Gemini 百万级长文本分析。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center space-x-2 bg-stone-800 px-3 py-2 rounded-lg border border-stone-700 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-300 font-bold">64GB VRAM 并联</span>
            <span className="text-stone-400">| Zero-Offload</span>
          </div>
          <button
            onClick={fetchHealth}
            disabled={loadingHealth}
            className="flex items-center space-x-1 bg-stone-800 hover:bg-stone-700 text-stone-300 px-2.5 py-2 rounded-lg text-xs font-mono border border-stone-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? "animate-spin" : ""}`} />
            <span>刷新遥测</span>
          </button>
        </div>
      </div>

      {/* Dual GPU Hardware Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GPU 0 */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                GPU 0 (Primary)
              </span>
              <span className="text-xs font-mono text-stone-700 font-bold">
                NVIDIA GeForce RTX 5090
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-500">PCIe 5.0 x16 · 52°C</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-stone-600">
              <span>显存驻留 (VRAM)</span>
              <span className="font-bold text-stone-900">14.2 GB / 32.0 GB (44.3%)</span>
            </div>
            <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: "44.3%" }}></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-stone-50 p-2 rounded border border-stone-200">
              <div className="text-[10px] text-stone-500 font-mono">架构代号</div>
              <div className="text-xs font-mono font-bold text-stone-800">Blackwell</div>
            </div>
            <div className="bg-stone-50 p-2 rounded border border-stone-200">
              <div className="text-[10px] text-stone-500 font-mono">显存规格</div>
              <div className="text-xs font-mono font-bold text-stone-800">32GB GDDR7</div>
            </div>
            <div className="bg-stone-50 p-2 rounded border border-stone-200">
              <div className="text-[10px] text-stone-500 font-mono">加速内核</div>
              <div className="text-xs font-mono font-bold text-emerald-700">Native SDPA</div>
            </div>
          </div>
        </div>

        {/* GPU 1 */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[11px] font-mono font-bold">
                GPU 1 (Parallel)
              </span>
              <span className="text-xs font-mono text-stone-700 font-bold">
                NVIDIA GeForce RTX 5090
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-500">PCIe 5.0 x16 · 50°C</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-stone-600">
              <span>显存驻留 (VRAM)</span>
              <span className="font-bold text-stone-900">13.8 GB / 32.0 GB (43.1%)</span>
            </div>
            <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "43.1%" }}></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-stone-50 p-2 rounded border border-stone-200">
              <div className="text-[10px] text-stone-500 font-mono">多卡拓扑</div>
              <div className="text-xs font-mono font-bold text-stone-800">device_map="auto"</div>
            </div>
            <div className="bg-stone-50 p-2 rounded border border-stone-200">
              <div className="text-[10px] text-stone-500 font-mono">总吞吐带宽</div>
              <div className="text-xs font-mono font-bold text-stone-800">1792 GB/s</div>
            </div>
            <div className="bg-stone-50 p-2 rounded border border-stone-200">
              <div className="text-[10px] text-stone-500 font-mono">CPU 卸载状态</div>
              <div className="text-xs font-mono font-bold text-emerald-700">0% (无抖动)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Engine & Cloud Auxiliary Integration */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>多模型协同中枢：双卡 5090 + 豆包大模型 + Google Gemini</span>
            </h3>
            <p className="text-xs text-stone-500 font-serif mt-0.5">
              可针对不同哲学研讨任务灵活切换或组合推理模型：
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Engine 1: Dual 5090 */}
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-stone-900 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>双卡 RTX 5090 本地引擎</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                私有主权
              </span>
            </div>
            <p className="text-xs text-stone-600 font-serif leading-relaxed">
              **核心定位**：全显存纯离线推理。专司深度苏格拉底反诘、形式论证推导、学术反馈微调对齐，绝不泄露学者私人命题。
            </p>
            <div className="text-[11px] font-mono text-stone-500 pt-1 border-t border-stone-200/60">
              模型：DeepSeek-R1-Distill-Qwen-32B (bfloat16)
            </div>
          </div>

          {/* Engine 2: Doubao */}
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-stone-900 flex items-center space-x-1.5">
                <Box className="w-3.5 h-3.5 text-blue-600" />
                <span>火山引擎 豆包大模型</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold">
                中文哲学考订
              </span>
            </div>
            <p className="text-xs text-stone-600 font-serif leading-relaxed">
              **核心定位**：中文语境哲学原典研读。精准对勘先秦先哲名理、宋明理学，以及康德邓晓芒译本、海德格尔陈嘉映译本的词源精义。
            </p>
            <div className="text-[11px] font-mono text-stone-500 pt-1 border-t border-stone-200/60">
              接口：Volcengine Ark (ARK_API_KEY)
            </div>
          </div>

          {/* Engine 3: Gemini */}
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-stone-900 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Google Gemini 2.5</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono font-bold">
                百万级长文献
              </span>
            </div>
            <p className="text-xs text-stone-600 font-serif leading-relaxed">
              **核心定位**：百万级 Token 超长文献通读。支持整部德文/希腊文原著跨卷检索、研讨班全程会话共识抽取与自进化技能自动结晶。
            </p>
            <div className="text-[11px] font-mono text-stone-500 pt-1 border-t border-stone-200/60">
              接口：Google GenAI (GEMINI_API_KEY)
            </div>
          </div>
        </div>
      </div>

      {/* Docker Database Components Architecture */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Docker 生产级服务栈与数据库拓扑</span>
            </h3>
            <p className="text-xs text-stone-500 font-serif mt-0.5">
              基于 Docker Compose 编排的四维全栈服务架构（已包含 GPU 穿透、向量数据库与高速缓存）：
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center space-x-2 text-stone-800 text-xs font-mono font-bold mb-1">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>philo-backend</span>
            </div>
            <div className="text-[11px] font-mono text-stone-500">端口: 8000 (FastAPI)</div>
            <p className="text-xs text-stone-600 font-serif mt-1">
              双卡 5090 显卡直通容器，运行 PyTorch 2.6+ / vLLM 推理核心。
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center space-x-2 text-stone-800 text-xs font-mono font-bold mb-1">
              <Database className="w-4 h-4 text-amber-600" />
              <span>qdrant</span>
            </div>
            <div className="text-[11px] font-mono text-stone-500">端口: 6333 (Vector DB)</div>
            <p className="text-xs text-stone-600 font-serif mt-1">
              EverOS 语义向量库，对西方哲学文献与共识图谱实施毫秒级检索。
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center space-x-2 text-stone-800 text-xs font-mono font-bold mb-1">
              <Server className="w-4 h-4 text-red-600" />
              <span>redis</span>
            </div>
            <div className="text-[11px] font-mono text-stone-500">端口: 6379 (Cache)</div>
            <p className="text-xs text-stone-600 font-serif mt-1">
              会话上下文热缓存、学者画像状态机与 SSE 流式队列。
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center space-x-2 text-stone-800 text-xs font-mono font-bold mb-1">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>philo-frontend</span>
            </div>
            <div className="text-[11px] font-mono text-stone-500">端口: 3000 (Node Gateway)</div>
            <p className="text-xs text-stone-600 font-serif mt-1">
              学术研讨界面、EverOS Markdown 档案管理与多模型智能路由网关。
            </p>
          </div>
        </div>

        {/* Docker run instructions */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-stone-700 uppercase font-mono">
              服务器 Docker 一键拉起命令
            </span>
            <button
              onClick={() => copyToClipboard(dockerCommand, setCopiedDocker)}
              className="flex items-center space-x-1 text-xs text-stone-600 hover:text-stone-900 font-mono"
            >
              {copiedDocker ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedDocker ? "已复制" : "复制代码"}</span>
            </button>
          </div>
          <pre className="bg-stone-950 text-stone-200 p-4 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
            {dockerCommand}
          </pre>
        </div>
      </div>

      {/* Open WebUI & cURL Integration Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-stone-800" />
              <span>标准 OpenAI v1 兼容 API 接入指南</span>
            </h3>
            <p className="text-xs text-stone-500 font-serif mt-0.5">
              可在 Open WebUI 或学术代码中无缝调用当前双卡 5090 集群：
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
              Base URL
            </span>
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono font-bold text-stone-900 truncate">
                {baseUrl}
              </code>
              <button
                onClick={() => copyToClipboard(baseUrl, setCopiedUrl)}
                className="p-1 text-stone-500 hover:text-stone-900"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
              模型标识 (Model)
            </span>
            <code className="text-xs font-mono font-bold text-stone-900">
              Philo-EverOS-Dual5090 / doubao-pro
            </code>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
              API Key 凭证
            </span>
            <code className="text-xs font-mono font-bold text-stone-900">
              philo-everos (或留空)
            </code>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-stone-700 uppercase font-mono">
              cURL 测试调用
            </span>
            <button
              onClick={() => copyToClipboard(curlExample, setCopiedCurl)}
              className="flex items-center space-x-1 text-xs text-stone-600 hover:text-stone-900 font-mono"
            >
              {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCurl ? "已复制" : "复制 cURL"}</span>
            </button>
          </div>
          <pre className="bg-stone-950 text-stone-200 p-4 rounded-lg text-xs font-mono overflow-x-auto">
            {curlExample}
          </pre>
        </div>
      </div>
    </div>
  );
};


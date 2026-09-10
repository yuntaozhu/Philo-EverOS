# Philo-EverOS: 自进化数字哲学研讨与学术共建平台 (v2.0)

[![Hardware: Dual RTX 5090 64GB](https://img.shields.io/badge/Hardware-Dual_NVIDIA_RTX_5090_64GB_Blackwell-green.svg)](https://www.nvidia.com/)
[![Docker: Full Stack Compose](https://img.shields.io/badge/Docker-GPU_Compose_+_Qdrant_+_Redis-blue.svg)](https://www.docker.com/)
[![Auxiliary: Doubao + Gemini](https://img.shields.io/badge/MultiModel-Doubao_+_Gemini_Auxiliary-orange.svg)](https://www.volcengine.com/)
[![Protocol: OpenAI Compatible](https://img.shields.io/badge/Protocol-OpenAI_API_v1-purple.svg)](https://platform.openai.com/)
[![Engine: EverOS Memory & Crystallizer](https://img.shields.io/badge/Engine-EverOS_Evolutionary-red.svg)](https://github.com/)

---

## 1. 核心设计愿景
传统通用大模型在哲学学术研讨中存在两大致命痛点：
1. **“上下文失忆与概念漂移”**：哲学思辨依赖高度连续的概念共识（如胡塞尔意向充实与实在论客体反映的严格界线）。常规对话每次清空或滑动窗口都会遗忘前置定性，导致概念倒退。
2. **“技能固化与缺乏自进化”**：无法从高水平师生的学术论辩中自动汲取推演范式。

**`Philo-EverOS`** 依托 **EverOS** 自进化框架（海马体长期记忆、学术画像锚定、共识图谱防漂移、论证范式自动结晶），在 **双卡 NVIDIA RTX 5090 (2x32GB = 64GB GDDR7, Blackwell 架构)** 算力集群上实现 32B-70B 级哲学大模型零 CPU 卸载全显存驻留，并协同 **火山引擎豆包大模型 (Doubao)** 与 **Google Gemini**，构建起数字哲学专属学术工作站。

---

## 2. 硬件架构与双卡 5090 并联规范 (Blackwell Architecture)
- **显卡配置**：双卡 NVIDIA GeForce RTX 5090 (2 × 32GB = 64GB GDDR7，总带宽 3584 GB/s)。
- **全显存驻留 (Zero CPU Offload)**：
  - 采用 `device_map="auto"` 并联切分，每卡设置 `max_memory={0: "30GiB", 1: "30GiB"}` 留足 KV-cache 余裕；
  - 强制采用 `torch.bfloat16` 原生精度，规避量化对形而上学微言大义的逻辑精度损害；
  - 强制启用 `attn_implementation="sdpa"`（Blackwell 原生硬件缩放点积注意力），吞吐超 60+ tokens/s；
  - 严禁计算层被卸载至 CPU，杜绝计算抖动。
- **线程安全非阻塞流式生成 (ThreadSafeStreamer)**：
  - 采用独立的后台子线程 `threading.Thread` 配合非阻塞队列异步出流；
  - 完美兼容 Open WebUI 前端 SSE 流式接收，杜绝 500 Network Error 与长推论连接假死。

---

## 3. 多模型协同中枢 (Multi-Model AI Dispatcher)
针对哲学研讨不同子任务的天然分工，系统内置多模型智能调度：
1. 🚀 **双卡 RTX 5090 本地思辨核心 (`Philo-EverOS-Dual5090`)**：
   - 纯本地推理、零出域、零隐私泄露；
   - 专司严密论证重构、形式逻辑推导、苏格拉底反诘与学术反馈微调对齐。
2. 豆 **火山引擎 豆包大模型 (`doubao-pro` / `doubao-lite`)**：
   - 接入火山方舟 Ark API (`ARK_API_KEY`)；
   - 专司中文哲学原典语境释读、先秦名理、宋明理学，以及邓晓芒康德译本、陈嘉映海德格尔译本权威对勘。
3. 💎 **Google Gemini (`gemini-2.5-flash` / `gemini-2.5-pro`)**：
   - 接入 Google GenAI SDK (`GEMINI_API_KEY`)；
   - 专司百万 Token 级别整卷哲学全集跨文献检索与研讨长程共识自动归纳。
4. ⚡ **Hybrid MoE 协同模式 (`hybrid-moe`)**：
   - 汇聚双卡 5090 形式推导 + 豆包原典对勘 + Gemini 宏观图谱的联合推理。

---

## 4. Docker 容器化全栈数据库组件
系统编排了生产级 Docker Compose 拓扑：
- **`philo-backend`**: 双卡 5090 穿透 (NVIDIA GPU Passthrough) + FastAPI + PyTorch 2.6+，端口 `8000`。
- **`qdrant`**: 官方 Qdrant 向量数据库，存储哲学原典向量嵌入与 EverOS 长期语义索引，端口 `6333`。
- **`redis`**: 官方 Redis 7 高速缓存，管理学者画像热状态、共识图谱索引与 SSE 流式队列，端口 `6379`。
- **`philo-frontend`**: Node.js Express 网页网关 + Vite 学术终端，端口 `3000`。

### 🚀 服务器一键部署指南
在具有双卡 5090 的服务器上执行：
```bash
# 1. 克隆代码库
git clone https://github.com/EverMind-AI/EverOS.git
cd Philo-EverOS

# 2. 配置环境变量模板
cp .env.example .env
# 编辑 .env，填入火山引擎与 Gemini 凭证（可选）：
# ARK_API_KEY=your_volcengine_ark_key
# DOUBAO_ENDPOINT_ID=doubao-pro-32k
# GEMINI_API_KEY=your_google_gemini_key

# 3. 运行自动化部署脚本
bash scripts/setup_dual_5090.sh

# 或直接通过 Docker Compose 拉起整个集群
docker compose up -d
```

服务就绪后：
- 学术研讨交互终端：`http://localhost:3000`
- 双卡 5090 推理 API：`http://localhost:8000/v1/chat/completions` (兼容 OpenAI v1)
- Qdrant 向量数据库管理台：`http://localhost:6333/dashboard`

---

## 3. 系统架构与模块

```text
Philo-EverOS/
├── config/settings.py          # 5090 显存配置、上下文窗口与路径管理
├── engine/
│   ├── model_loader.py         # 5090 专属加速推理单例（bfloat16, SDPA, Mistral补丁）
│   └── streamer.py             # 线程安全非阻塞 SSE 生成器
├── everos_bridge/
│   ├── memory_engine.py        # EverOS 统领协调中枢
│   ├── academic_profile.py     # 学术画像追踪（流派、邓晓芒/陈嘉映中译本对齐）
│   ├── consensus_graph.py      # 全系共识图谱（防止概念漂移）
│   └── skill_crystallizer.py   # 从高质研讨中自动结晶 Skill
├── harness/
│   ├── orchestrator.py         # 请求路由与学术 Prompt 编译
│   └── guardrails.py           # 学术护栏（引文校验、本体论降解拦截、苏格拉底终局）
├── skills/
│   ├── base.py                 # Skill 抽象基类
│   ├── builtin/                # 预置核心技能 (/deconstruct, /etymology, /socratic, /compare)
│   └── crystallized/           # EverOS 自动生成的技能池 (*.yaml, *.md)
├── feedback/
│   ├── collector.py            # 学生纠错 (SFT) 与偏好标注 (DPO) 入库
│   └── exporter.py             # Alpaca / DPO 训练集导出
├── main.py                     # FastAPI 标准 OpenAI API 服务
└── requirements.txt
```

---

## 4. 专属指令集与技能模式
| 技能前缀 | 模式名称 | 核心学术功能 |
| :--- | :--- | :--- |
| `/deconstruct` | 论证形式化重构模式 | 将输入拆分为【明示前提】、【隐涵假设】、【推导逻辑链】、【形式漏洞与反例判别】，区分有效性与事实稳妥性 |
| `/etymology` | 概念词源学与谱系追踪 | 考订希腊文（Ousia/Logos）、拉丁文、德文（Dasein/Aufhebung）源流及邓晓芒/陈嘉映中译本之争 |
| `/socratic` | 纯苏格拉底反诘辩论 | 不给陈述性解答；化身论敌锁定最薄弱本体论假定，连续追问逼至两难困境 |
| `/compare` | 跨体系对勘模式 | 对立思想家（如康德 vs 休谟）在最高本体论、认识论奠基维度制表对勘，深挖不可调和断裂点 |
| `/experiment` *(结晶技能)* | 反事实思想实验解构 | 设定可能世界 W* 与扰动变量，打破物理-意识同一性假定 |
| `/reductio` *(结晶技能)* | 形式三段论归谬法 | 暂设论敌命题 P 为真，推导演绎直到 (P ∧ ¬P) 矛盾爆发 |

---

## 5. 本地启动指南 (Windows 11 / RTX 5090)

### 5.1 环境安装
```bash
# 创建虚拟环境
conda create -n philo-everos python=3.11 -y
conda activate philo-everos

# 安装 Blackwell 适配版 PyTorch
pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu130

# 安装核心依赖
pip install -r requirements.txt
```

### 5.2 启动 FastAPI 服务
```bash
python main.py
# 服务将在 http://0.0.0.0:8000 启动
```

### 5.3 接入 Open WebUI
在 Open WebUI 设置中添加自定义 OpenAI 连接：
- **API URL**: `http://127.0.0.1:8000/v1`
- **API Key**: `philo-everos` (或任意非空字符串)
- **Model Name**: `Philo-EverOS-5090`

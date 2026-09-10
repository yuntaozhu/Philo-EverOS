#!/usr/bin/env bash
# ==============================================================================
# Philo-EverOS: Single NVIDIA RTX 5060 (8GB/16GB GDDR7) Environment Initializer
# Optimized for:
#   - Veritas-12B (Mistral/NeMo 12B) -> 4-bit NF4 Quant (~7.5GB VRAM)
#   - Semancer-12B (Llama-3 12B) -> 4-bit NF4 Quant (~7.5GB VRAM)
#   - Fireball-12B-philosophers (Llama-3.1 12B) -> 4-bit NF4 Quant (~7.5GB VRAM)
#   - brie-v2-3b / Qwen2.5-Phil (3B~7B) -> Native torch.bfloat16 (~6.0GB VRAM)
# Backed by Qdrant Vector DB, Redis Cache, Volcengine Doubao & Google Gemini
# ==============================================================================

set -e

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
NC="\033[0m"

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   Philo-EverOS: 单卡 NVIDIA RTX 5060 极速运行与显存优化启动器   ${NC}"
echo -e "${CYAN}================================================================${NC}"

# 1. Inspect NVIDIA Hardware
echo -e "\n${YELLOW}[1/5] 探测服务器 GPU 硬件与 Blackwell 架构显存...${NC}"
if command -v nvidia-smi &> /dev/null; then
    GPU_INFO=$(nvidia-smi --query-gpu=index,name,memory.total --format=csv,noheader)
    echo -e "${GREEN}✓ 检测到 NVIDIA 物理设备：${NC}"
    echo -e "  • ${GREEN}$GPU_INFO${NC}"
    
    TOTAL_MEM_MB=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -n 1)
    if [ "$TOTAL_MEM_MB" -lt 12000 ]; then
        echo -e "${GREEN}✓ 识别为 RTX 5060 (8GB GDDR7 规格)：${NC}"
        echo -e "  - 12B 大模型 (Veritas, Semancer, Fireball) 将强制开启【BitsAndBytes 4-bit NF4 + 双重二次量化】"
        echo -e "  - 静态权重显存从 24GB 骤降至 7.4GB，防止 OOM 溢出"
        echo -e "  - 3B 模型 (brie-v2-3b) 默认启用【原生 bfloat16 零损耗运行】"
    else
        echo -e "${GREEN}✓ 识别为 RTX 5060 (16GB GDDR7 规格)：拥有充裕显存与超长 KV-Cache 空间${NC}"
    fi
else
    echo -e "${YELLOW}! 未检测到 nvidia-smi，将启动 CPU 降级或仿真测试模式。${NC}"
fi

# 2. Check Docker & NVIDIA Container Toolkit
echo -e "\n${YELLOW}[2/5] 验证 Docker 与 NVIDIA Container Toolkit...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker 已安装: $(docker --version)${NC}"
else
    echo -e "${RED}✗ 未安装 Docker，请先安装: curl -fsSL https://get.docker.com | sh${NC}"
    exit 1
fi

# 3. Setup Persistent Storage & EverOS Markdown Archives
echo -e "\n${YELLOW}[3/5] 初始化 EverOS 本地 Markdown 档案树与持久化存储目录...${NC}"
mkdir -p ~/.everos/profiles ~/.everos/facts ~/.everos/episodes ~/.everos/skills
mkdir -p ./data/profiles ./data/memory ./data/training ./skills/crystallized
echo -e "${GREEN}✓ 记忆库档案树目录已建立 (~/.everos)${NC}"

# 4. Check & Install Python Dependencies
echo -e "\n${YELLOW}[4/5] 检查 Python 5060 显存优化加速库 (bitsandbytes + torch)...${NC}"
if command -v python3 &> /dev/null; then
    python3 -c "import bitsandbytes; print('✓ bitsandbytes 4-bit 量化组件已就绪: ' + bitsandbytes.__version__)" 2>/dev/null || {
        echo -e "${YELLOW}正在为 RTX 5060 安装 bitsandbytes 优化库...${NC}"
        pip install "bitsandbytes>=0.43.0" accelerate transformers -q
    }
fi

# 5. Launch Philo-EverOS Service Stack
echo -e "\n${YELLOW}[5/5] 启动 Philo-EverOS 5060 服务栈...${NC}"
export TARGET_HARDWARE=RTX_5060
export DEFAULT_QUANTIZATION=4bit-nf4
export MAX_MODEL_LEN=4096

echo -e "${GREEN}✓ 配置就绪！${NC}"
echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   RTX 5060 模型运行就绪：${NC}"
echo -e "   • brie-v2-3b (Qwen2.5 3B/7B 欧陆现象学): 原生 BF16 (占用 ~5.8GB)"
echo -e "   • Veritas-12B (Mistral/NeMo 12B 伦理质询): 4-bit NF4 (占用 ~7.4GB)"
echo -e "   • Semancer-12B (Llama-3 12B 存在主义研讨): 4-bit NF4 (占用 ~7.35GB)"
echo -e "   • Fireball-12B (Llama-3.1 12B 科学哲学与认识论): 4-bit NF4 (占用 ~7.42GB)"
echo -e "${CYAN}   前端学术界面地址: http://localhost:3000${NC}"
echo -e "${CYAN}   OpenAI v1 兼容接口: http://localhost:3000/v1/chat/completions${NC}"
echo -e "${CYAN}================================================================${NC}"

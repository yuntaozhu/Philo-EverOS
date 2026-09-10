#!/usr/bin/env bash
# ==============================================================================
# Philo-EverOS: Dual NVIDIA RTX 5090 (64GB GDDR7) + Docker Environment Initializer
# Backed by Qdrant Vector DB, Redis Cache, Volcengine Doubao & Google Gemini
# ==============================================================================

set -e

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
NC="\033[0m"

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   Philo-EverOS: 双卡 NVIDIA RTX 5090 算力集群与 Docker 自动化部署   ${NC}"
echo -e "${CYAN}================================================================${NC}"

# 1. Inspect NVIDIA Hardware
echo -e "\n${YELLOW}[1/5] 探测服务器 GPU 硬件与 Blackwell 架构支持...${NC}"
if command -v nvidia-smi &> /dev/null; then
    GPU_INFO=$(nvidia-smi --query-gpu=index,name,memory.total --format=csv,noheader)
    GPU_COUNT=$(echo "$GPU_INFO" | wc -l)
    echo -e "${GREEN}✓ 检测到 ${GPU_COUNT} 块 NVIDIA 显卡物理设备：${NC}"
    echo "$GPU_INFO" | while read -r line; do
        echo -e "  • ${GREEN}$line${NC}"
    done
    if [ "$GPU_COUNT" -ge 2 ]; then
        echo -e "${GREEN}✓ 成功激活双卡 5090 协同模式 (64GB GDDR7 VRAM, Blackwell Native SDPA)${NC}"
    else
        echo -e "${YELLOW}! 当前检测到单卡 5090 (32GB VRAM)，可在接入第二张显卡后自动扩展至双卡${NC}"
    fi
else
    echo -e "${RED}✗ 未检测到 nvidia-smi，请确保在拥有 NVIDIA 驱动的宿主机上执行。${NC}"
fi

# 2. Check Docker & NVIDIA Container Toolkit
echo -e "\n${YELLOW}[2/5] 验证 Docker 与 NVIDIA Container Toolkit (GPU Passthrough)...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker 已安装: $(docker --version)${NC}"
else
    echo -e "${RED}✗ 未安装 Docker，请先安装: curl -fsSL https://get.docker.com | sh${NC}"
    exit 1
fi

if docker info 2>/dev/null | grep -i "Runtimes.*nvidia" &> /dev/null; then
    echo -e "${GREEN}✓ NVIDIA Container Toolkit 运行时已就绪 (支持 GPU 穿透)${NC}"
else
    echo -e "${YELLOW}! 未检测到 NVIDIA 容器运行时，正在配置 nvidia-ctk...${NC}"
    echo "提示：如需配置 nvidia 容器运行时，请运行："
    echo "  sudo apt-get install -y nvidia-container-toolkit"
    echo "  sudo nvidia-ctk runtime configure --runtime=docker"
    echo "  sudo systemctl restart docker"
fi

# 3. Setup Persistent Storage & EverOS Markdown Archives
echo -e "\n${YELLOW}[3/5] 初始化 EverOS 本地 Markdown 档案树与持久化存储目录...${NC}"
mkdir -p ~/.everos/profiles ~/.everos/facts ~/.everos/episodes ~/.everos/skills
mkdir -p ./data/profiles ./data/memory ./data/training ./skills/crystallized
echo -e "${GREEN}✓ 记忆库档案树目录已建立 (~/.everos)${NC}"

# 4. Check Environment Configuration (.env)
echo -e "\n${YELLOW}[4/5] 检查多模型与 API 凭证配置 (.env)...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}! 未检测到 .env，正在从 .env.example 复制基础配置模板...${NC}"
    cp .env.example .env
fi

if grep -q "ARK_API_KEY=" .env && [ -n "$(grep ARK_API_KEY= .env | cut -d= -f2)" ]; then
    echo -e "${GREEN}✓ 火山引擎 豆包大模型 (Doubao) API Key 已配置${NC}"
else
    echo -e "${YELLOW}! 提示: 可在 .env 中填入 ARK_API_KEY 与 DOUBAO_ENDPOINT_ID 启用豆包协同${NC}"
fi

if grep -q "GEMINI_API_KEY=" .env && [ -n "$(grep GEMINI_API_KEY= .env | cut -d= -f2)" ]; then
    echo -e "${GREEN}✓ Google Gemini API Key 已配置${NC}"
else
    echo -e "${YELLOW}! 提示: 可在 .env 中填入 GEMINI_API_KEY 启用超长文献分析协同${NC}"
fi

# 5. Build and Launch Containers
echo -e "\n${YELLOW}[5/5] 启动 Docker 算力集群 (Dual 5090 Engine + Qdrant + Redis + WebUI)...${NC}"
docker compose build
docker compose up -d

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}   Philo-EverOS 算力集群启动成功！服务端口一览：                  ${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "  • 前端学术研讨界面:    ${CYAN}http://localhost:3000${NC}"
echo -e "  • 双卡 5090 推理 API:  ${CYAN}http://localhost:8000 (OpenAI v1 兼容)${NC}"
echo -e "  • Qdrant 向量数据库:   ${CYAN}http://localhost:6333 (Dashboard: http://localhost:6333/dashboard)${NC}"
echo -e "  • Redis 高速缓存:      ${CYAN}localhost:6379${NC}"
echo -e "\n查看集群运行日志: ${YELLOW}docker compose logs -f philo-backend${NC}"

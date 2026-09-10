import os
from pathlib import Path
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
SKILLS_DIR = BASE_DIR / "skills"

class PhiloSettings(BaseModel):
    # ==========================================
    # GPU Hardware Configuration (Supports RTX 5060 8G/16G & RTX 5090)
    # ==========================================
    target_hardware: str = Field(
        default=os.getenv("TARGET_HARDWARE", "RTX_5060"),
        description="Target GPU profile: 'RTX_5060' (8GB/16GB VRAM) or 'RTX_5090' (32GB/64GB)"
    )
    model_name_or_path: str = Field(
        default=os.getenv("MODEL_PATH", "brie-v2-3b/Qwen2.5-Phil"),
        description="Path or HuggingFace ID for philosophical LLM"
    )
    # Supported Philosophical Models from User's Deployment Inventory:
    # 1. 'Veritas-12B': Mistral/NeMo 12B - 伦理困境、哲学论证分析、概念解构微调 (5060: 4-bit NF4)
    # 2. 'Semancer-12B': Llama-3 12B - 400+哲学深度研讨对话微调，存在主义、本体论、心灵哲学 (5060: 4-bit NF4)
    # 3. 'Fireball-12B-philosophers': Llama-3.1 12B - 科学哲学、数学哲学、认识论与经典原著微调 (5060: 4-bit NF4)
    # 4. 'brie-v2-3b' / 'Qwen2.5-Phil': 3B~7B Qwen2.5 - 欧陆哲学(现象学/存在主义/批判理论) (5060: 原生 BF16 全精度)
    active_philosophy_model: str = Field(
        default=os.getenv("PHILOSOPHY_MODEL", "brie-v2-3b"),
        description="Active model identifier from the philosophical inventory"
    )
    gpu_count: int = Field(
        default=int(os.getenv("GPU_COUNT", "1")),
        description="Number of GPUs on the server (1 for single RTX 5060)"
    )
    gpu_devices: str = Field(
        default=os.getenv("GPU_DEVICES", "0"),
        description="CUDA visible devices (e.g. '0' for single 5060)"
    )
    device: str = Field(default="cuda:0", description="Primary GPU device")
    device_map: str = Field(
        default=os.getenv("DEVICE_MAP", "auto"),
        description="HuggingFace / Accelerate device distribution ('auto' or 'cuda:0')"
    )
    dtype: str = Field(default="bfloat16", description="Inference precision (torch.bfloat16)")
    quantization: str = Field(
        default=os.getenv("QUANTIZATION", "auto"),
        description="Quantization mode: '4bit' (NF4 for 12B on 5060), '8bit', 'none', or 'auto'"
    )
    attn_implementation: str = Field(default="sdpa", description="Scaled Dot-Product Attention for Blackwell")
    max_model_len: int = Field(
        default=int(os.getenv("MAX_MODEL_LEN", "4096")),
        description="Max sequence length (optimized to 4096/8192 for RTX 5060 VRAM constraints)"
    )
    gpu_memory_utilization: float = Field(
        default=float(os.getenv("GPU_MEMORY_UTILIZATION", "0.88")),
        description="Per-card VRAM allocation ratio (~7.0GB for 8GB 5060, ~14.0GB for 16GB 5060)"
    )
    tensor_parallel: bool = Field(default=False, description="Enable multi-GPU tensor parallelism")

    # ==========================================
    # Auxiliary Model 1: 火山引擎 豆包大模型 (Volcengine Doubao)
    # ==========================================
    doubao_api_key: Optional[str] = Field(
        default=os.getenv("ARK_API_KEY", os.getenv("DOUBAO_API_KEY", None)),
        description="Volcengine Ark API key for Doubao LLM"
    )
    doubao_endpoint_id: str = Field(
        default=os.getenv("DOUBAO_ENDPOINT_ID", os.getenv("DOUBAO_MODEL", "doubao-pro-32k")),
        description="Doubao model endpoint ID (e.g., ep-xxxx or doubao-pro-32k)"
    )
    doubao_base_url: str = Field(
        default=os.getenv("DOUBAO_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3"),
        description="Volcengine Ark base URL"
    )

    # ==========================================
    # Auxiliary Model 2: Google Gemini (Gemini 2.5 Flash / Pro)
    # ==========================================
    gemini_api_key: Optional[str] = Field(
        default=os.getenv("GEMINI_API_KEY", None),
        description="Google Gemini API key for long-context cross-system analysis"
    )
    gemini_model: str = Field(
        default=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        description="Default Gemini model variant"
    )

    # ==========================================
    # Vector Database & Cache (Docker Services: Qdrant & Redis)
    # ==========================================
    qdrant_host: str = Field(default=os.getenv("QDRANT_HOST", "localhost"), description="Qdrant vector DB host")
    qdrant_port: int = Field(default=int(os.getenv("QDRANT_PORT", "6333")), description="Qdrant vector DB port")
    qdrant_collection: str = Field(default="philo_everos_memory", description="Qdrant collection for EverOS embeddings")
    
    redis_host: str = Field(default=os.getenv("REDIS_HOST", "localhost"), description="Redis cache host")
    redis_port: int = Field(default=int(os.getenv("REDIS_PORT", "6379")), description="Redis cache port")

    # ==========================================
    # EverOS Memory Paths
    # ==========================================
    data_dir: Path = DATA_DIR
    profiles_dir: Path = DATA_DIR / "profiles"
    consensus_file: Path = DATA_DIR / "memory" / "consensus_graph.json"
    training_data_dir: Path = DATA_DIR / "training"
    crystallized_skills_dir: Path = SKILLS_DIR / "crystallized"

    # Server Settings
    host: str = Field(default="0.0.0.0", description="FastAPI host binding")
    port: int = Field(default=8000, description="FastAPI port")
    api_key_auth_enabled: bool = Field(default=False, description="Open WebUI API key check")

settings = PhiloSettings()

# Ensure runtime directories exist
for folder in [
    settings.profiles_dir,
    settings.consensus_file.parent,
    settings.training_data_dir,
    settings.crystallized_skills_dir,
]:
    folder.mkdir(parents=True, exist_ok=True)


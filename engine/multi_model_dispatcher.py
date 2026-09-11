"""
Philo-EverOS Multi-Model Dispatcher & Hybrid MoE Router
Orchestrates:
1. Dual RTX 5090 Local Dedicated Inference (64GB GDDR7, Blackwell, Zero-Offload)
2. Volcengine Doubao (火山引擎豆包大模型 - 原典翻译考订与高速理解)
3. Google Gemini (Gemini 2.5 - 超长文本原典通读与跨体系图谱分析)
4. Hybrid MoE (多模型协同研讨范式)
"""

import json
import logging
from typing import List, Dict, Any, Optional, AsyncGenerator, Generator
from config.settings import settings

logger = logging.getLogger("philo_everos.engine.multi_model_dispatcher")

class MultiModelDispatcher:
    """
    Unified multi-model dispatcher managing Dual 5090, Doubao, Gemini, and Hybrid MoE.
    """

    def __init__(self, model_loader=None):
        self.model_loader = model_loader
        self.doubao_api_key = settings.doubao_api_key
        self.doubao_endpoint_id = settings.doubao_endpoint_id
        self.doubao_base_url = settings.doubao_base_url
        self.gemini_api_key = settings.gemini_api_key
        self.gemini_model = settings.gemini_model

    def get_available_engines(self) -> List[Dict[str, Any]]:
        """Returns the list of available model engines and their operational status on RTX 5060."""
        engines: List[Dict[str, Any]] = []
        if settings.local_llm_base_url:
            engines.append({
                "id": settings.local_llm_model,
                "name": f"Remote local engine ({settings.local_llm_model})",
                "hardware": settings.local_llm_base_url,
                "base": "llama.cpp / Ollama / vLLM",
                "precision": "remote-openai",
                "role": "5060-first path: FastAPI does not load HF weights",
                "status": "active",
                "is_local": True,
                "recommended_5060": True,
            })
        engines.extend([
            {
                "id": "brie-v2-3b",
                "name": "brie-v2-3b / Qwen2.5-Phil (3B~7B)",
                "hardware": "RTX 5060 (Native BF16 原生零量化)",
                "base": "Qwen2.5 基座",
                "vram_5060": "约 6.0 ~ 7.2 GB",
                "precision": "torch.bfloat16 + SDPA",
                "role": "欧陆哲学（现象学、存在主义、批判理论）LoRA 注入，5060 原生高帧率首选",
                "status": "active",
                "is_local": True,
                "recommended_5060": True
            },
            {
                "id": "Veritas-12B",
                "name": "Veritas-12B (Gemma 3 12B)",
                "hardware": "RTX 5060 (BitsAndBytes 4-bit NF4)",
                "base": "Gemma 3 12B",
                "vram_5060": "从 24GB 压缩至 7.5GB",
                "precision": "4-bit NF4 + bfloat16 SDPA",
                "role": "专门针对伦理困境、哲学论证分析、概念解构微调，严格反讽与逻辑质询",
                "status": "active",
                "is_local": True,
                "recommended_5060": True
            },
            {
                "id": "Semancer-12B",
                "name": "Semancer-12B (Gemma 4 12B)",
                "hardware": "RTX 5060 (BitsAndBytes 4-bit NF4)",
                "base": "Gemma 4 12B",
                "vram_5060": "从 24GB 压缩至 7.5GB",
                "precision": "4-bit NF4 + bfloat16 SDPA",
                "role": "400+ 哲学深度研讨对话集微调，专攻存在主义、本体论、心灵哲学与决定论",
                "status": "active",
                "is_local": True,
                "recommended_5060": True
            },
            {
                "id": "Fireball-12B-philosophers",
                "name": "Fireball-12B-philosophers (Mistral-Nemo 12B)",
                "hardware": "RTX 5060 (BitsAndBytes 4-bit NF4)",
                "base": "Mistral-Nemo 12B",
                "vram_5060": "从 24GB 压缩至 7.5GB",
                "precision": "4-bit NF4 + bfloat16 SDPA",
                "role": "科学哲学、数学哲学、认识论 (Epistemology) 及经典哲学家著作微调",
                "status": "active",
                "is_local": True,
                "recommended_5060": True
            },
            {
                "id": "doubao-pro",
                "name": "火山引擎 豆包大模型 (Doubao Pro)",
                "provider": "Volcengine Ark",
                "role": "中文哲学原典语境、邓晓芒/陈嘉映中译本权威对勘、古籍名理释读",
                "status": "configured" if self.doubao_api_key else "needs_key",
                "endpoint": self.doubao_endpoint_id,
                "is_local": False
            },
            {
                "id": "gemini-2.5-flash",
                "name": "Google Gemini 2.5 Flash / Pro",
                "provider": "Google DeepMind",
                "role": "百万 Token 超长原典跨卷对勘、宏观形而上学共识图谱归纳",
                "status": "configured" if self.gemini_api_key else "needs_key",
                "is_local": False
            },
            {
                "id": "hybrid-moe",
                "name": "Hybrid MoE 协同研讨专家集群",
                "provider": "RTX 5060 + 豆包 + Gemini",
                "role": "5060 本地形式演绎 + 豆包原典勘误 + Gemini 宏观共识提取",
                "status": "active",
                "is_local": False
            }
        ])
        return engines

    async def stream_doubao_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> AsyncGenerator[str, None]:
        """Streams completion from Volcengine Doubao API."""
        if not self.doubao_api_key:
            yield (
                "\n[豆包未配置] 缺少 `ARK_API_KEY`。/etymology 在无密钥时回退本地模型；"
                "请在 `.env` 写入火山引擎 Key 后再选择 doubao-pro。\n"
            )
            return

        import httpx
        headers = {
            "Authorization": f"Bearer {self.doubao_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.doubao_endpoint_id,
            "messages": messages,
            "stream": True,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        url = f"{self.doubao_base_url.rstrip('/')}/chat/completions"
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", url, headers=headers, json=payload) as response:
                if response.status_code != 200:
                    err_text = await response.aread()
                    yield f"\n[Doubao API Error {response.status_code}]: {err_text.decode('utf-8')}"
                    return

                async for line in response.aiter_lines():
                    trimmed = line.strip()
                    if trimmed.startswith("data: "):
                        content = trimmed[6:]
                        if content == "[DONE]":
                            break
                        try:
                            parsed = json.loads(content)
                            delta = parsed.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if delta:
                                yield delta
                        except Exception:
                            continue

    async def stream_gemini_completion(
        self,
        messages: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """Streams completion from Google Gemini API."""
        if not self.gemini_api_key:
            yield (
                "\n[Gemini 未配置] 缺少 `GEMINI_API_KEY`。请在 `.env` 写入密钥后再选择 gemini-2.5-flash。\n"
            )
            return

        import httpx
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.gemini_model}:streamGenerateContent?alt=sse&key={self.gemini_api_key}"

        # Format messages for Gemini API
        contents = []
        for m in messages:
            role = "model" if m.get("role") in ("assistant", "model") else "user"
            contents.append({
                "role": role,
                "parts": [{"text": m.get("content", "")}]
            })

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature
            }
        }
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code != 200:
                    err_text = await response.aread()
                    yield f"\n[Gemini API Error {response.status_code}]: {err_text.decode('utf-8')}"
                    return

                async for line in response.aiter_lines():
                    trimmed = line.strip()
                    if trimmed.startswith("data: "):
                        content = trimmed[6:]
                        try:
                            parsed = json.loads(content)
                            candidates = parsed.get("candidates", [])
                            if candidates:
                                parts = candidates[0].get("content", {}).get("parts", [])
                                for p in parts:
                                    t = p.get("text", "")
                                    if t:
                                        yield t
                        except Exception:
                            continue

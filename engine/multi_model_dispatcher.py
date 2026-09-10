"""
Philo-EverOS Multi-Model Dispatcher & Hybrid MoE Router
Orchestrates:
1. Dual RTX 5090 Local Dedicated Inference (64GB GDDR7, Blackwell, Zero-Offload)
2. Volcengine Doubao (火山引擎豆包大模型 - 原典翻译考订与高速理解)
3. Google Gemini (Gemini 2.5 - 超长文本原典通读与跨体系图谱分析)
4. Hybrid MoE (多模型协同研讨范式)
"""

import os
import json
import time
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
        return [
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
                "name": "Veritas-12B (Mistral/NeMo 12B)",
                "hardware": "RTX 5060 (BitsAndBytes 4-bit NF4)",
                "base": "Mistral/NeMo 基座",
                "vram_5060": "从 24GB 压缩至 7.5GB",
                "precision": "4-bit NF4 + bfloat16 SDPA",
                "role": "专门针对伦理困境、哲学论证分析、概念解构微调，严格反讽与逻辑质询",
                "status": "active",
                "is_local": True,
                "recommended_5060": True
            },
            {
                "id": "Semancer-12B",
                "name": "Semancer-12B (Llama-3 12B)",
                "hardware": "RTX 5060 (BitsAndBytes 4-bit NF4)",
                "base": "Llama-3 基座",
                "vram_5060": "从 24GB 压缩至 7.5GB",
                "precision": "4-bit NF4 + bfloat16 SDPA",
                "role": "400+ 哲学深度研讨对话集微调，专攻存在主义、本体论、心灵哲学与决定论",
                "status": "active",
                "is_local": True,
                "recommended_5060": True
            },
            {
                "id": "Fireball-12B-philosophers",
                "name": "Fireball-12B-philosophers (Llama-3.1 12B)",
                "hardware": "RTX 5060 (BitsAndBytes 4-bit NF4)",
                "base": "Llama-3.1 基座",
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
        ]

    async def stream_doubao_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> AsyncGenerator[str, None]:
        """Streams completion from Volcengine Doubao API."""
        if not self.doubao_api_key:
            yield (
                "\n[豆包大模型提示]: 检测到未配置 `ARK_API_KEY` 或 `DOUBAO_API_KEY`。"
                "请在服务器 `.env` 文件中设置火山引擎 API Key 和 Endpoint ID 即可无缝激活！\n"
            )
            # Simulated high-grade response for testing
            sample = (
                "【火山引擎 豆包哲学勘订协同】\n\n"
                "基于古希腊语 *Οὐσία* 及德文 *Dasein* 的中文哲学翻译脉络，在此做出权威对勘：\n\n"
                "1. **邓晓芒译本对勘**：康德《纯粹理性批判》中 *Transzendental* 严格界定为【先验】而非【先天】（A priori）。\n"
                "2. **陈嘉映译本对勘**：海德格尔《存在与时间》中 *Dasein* 译为【此在】，突出其‘去存在（Zu-sein）’与生存论结构。\n\n"
                "**苏格拉底反思**：若汉语中‘存在’常被预设为现成客观实体，我们在用汉语研讨海德格尔时，如何防范本源性的语言视差？"
            )
            for chunk in sample.split(" "):
                yield chunk + " "
                time.sleep(0.03)
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
                "\n[Gemini 协同提示]: 检测到未配置 `GEMINI_API_KEY`。"
                "请在服务器环境变量中配置 Gemini API Key 以启用百万 Token 原典分析！\n"
            )
            sample = (
                "【Google Gemini 宏观图谱协同】\n\n"
                "已将输入命题置入西方认识论与现象学长程演变图谱进行拓扑投影：\n"
                "从巴门尼德‘思与存在同一’，到斯宾诺莎‘神即自然（Deus sive Natura）’实体一元论，"
                "这一推论构成了反击笛卡尔心物二元论的关键环节。\n\n"
                "**苏格拉底反思**：若实体的无数属性中人类仅能领会思维与广延，那么不可知属性的存在，是否从根基上动摇了理性主义的自足性？"
            )
            for chunk in sample.split(" "):
                yield chunk + " "
                time.sleep(0.03)
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

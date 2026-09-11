"""
OpenAI-compatible client for llama.cpp / Ollama / vLLM (5060 default path).
"""

from __future__ import annotations

import json
import logging
from typing import Any, AsyncGenerator, Dict, Iterable, List, Optional

import httpx

from config.settings import settings

logger = logging.getLogger("philo_everos.engine.local_client")


class LocalOpenAIClient:
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        default_model: Optional[str] = None,
    ):
        raw = (base_url or settings.local_llm_base_url or "").rstrip("/")
        if raw.endswith("/chat/completions"):
            raw = raw[: -len("/chat/completions")]
        self.base_url = raw
        self.api_key = api_key or settings.local_llm_api_key or "philo-everos"
        self.default_model = default_model or settings.local_llm_model or settings.active_philosophy_model

    @property
    def enabled(self) -> bool:
        return bool(self.base_url)

    def _url(self) -> str:
        return f"{self.base_url}/chat/completions"

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _payload(
        self,
        messages: Iterable[Dict[str, Any]],
        temperature: float,
        max_tokens: int,
        stream: bool,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        body: Dict[str, Any] = {
            "model": model or self.default_model,
            "messages": list(messages),
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream,
        }
        return body

    async def stream_tokens(
        self,
        messages: Iterable[Dict[str, Any]],
        temperature: float = 0.3,
        max_tokens: int = 2048,
        model: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        timeout = httpx.Timeout(180.0, connect=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream(
                "POST",
                self._url(),
                headers=self._headers(),
                json=self._payload(messages, temperature, max_tokens, True, model),
            ) as response:
                if response.status_code != 200:
                    err = (await response.aread()).decode("utf-8", errors="replace")
                    raise RuntimeError(f"Local LLM HTTP {response.status_code}: {err[:500]}")
                async for line in response.aiter_lines():
                    trimmed = line.strip()
                    if not trimmed or not trimmed.startswith("data:"):
                        continue
                    data = trimmed[5:].strip()
                    if data == "[DONE]":
                        break
                    try:
                        parsed = json.loads(data)
                    except json.JSONDecodeError:
                        continue
                    delta = (parsed.get("choices") or [{}])[0].get("delta") or {}
                    piece = delta.get("content") or ""
                    if piece:
                        yield piece

    async def complete(
        self,
        messages: Iterable[Dict[str, Any]],
        temperature: float = 0.3,
        max_tokens: int = 2048,
        model: Optional[str] = None,
    ) -> str:
        timeout = httpx.Timeout(180.0, connect=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                self._url(),
                headers=self._headers(),
                json=self._payload(messages, temperature, max_tokens, False, model),
            )
            if response.status_code != 200:
                raise RuntimeError(f"Local LLM HTTP {response.status_code}: {response.text[:500]}")
            parsed = response.json()
            return ((parsed.get("choices") or [{}])[0].get("message") or {}).get("content") or ""


def get_local_openai_client() -> Optional[LocalOpenAIClient]:
    if not settings.local_llm_base_url:
        return None
    return LocalOpenAIClient()

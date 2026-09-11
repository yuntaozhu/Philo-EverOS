"""Doubao / Volcengine Ark embeddings — cloud only, never on the local GPU."""

from __future__ import annotations

import logging
from typing import List, Optional, Sequence

import httpx

from config.settings import settings

logger = logging.getLogger("philo_everos.literature.embeddings")


class DoubaoEmbedder:
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
    ):
        self.api_key = api_key if api_key is not None else settings.doubao_api_key
        self.model = model or settings.doubao_embedding_model
        self.base_url = (base_url or settings.doubao_base_url).rstrip("/")

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    def embed(self, texts: Sequence[str]) -> List[List[float]]:
        cleaned = [t.strip() for t in texts if t and str(t).strip()]
        if not cleaned:
            return []
        if not self.enabled:
            raise RuntimeError("ARK_API_KEY is required for Doubao embeddings.")
        response = httpx.post(
            f"{self.base_url}/embeddings",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json={"model": self.model, "input": cleaned, "encoding_format": "float"},
            timeout=60.0,
        )
        if response.status_code != 200:
            raise RuntimeError(f"Doubao embeddings HTTP {response.status_code}: {response.text[:400]}")
        rows = response.json().get("data") or []
        rows = sorted(rows, key=lambda r: r.get("index", 0))
        return [row.get("embedding") or [] for row in rows]

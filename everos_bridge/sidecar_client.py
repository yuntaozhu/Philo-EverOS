"""
HTTP client for the official EverMind-AI/EverOS service.

Do not import everos.memory. EverOS is a sidecar:
  everos server start --port 8100
  POST /api/v2/memory/add | flush | search
"""

from __future__ import annotations

import logging
import time
from typing import Any, Dict, Iterable, List, Optional

import httpx

from config.settings import settings

logger = logging.getLogger("philo_everos.everos.sidecar")


def build_add_payload(
    session_id: str,
    messages: Iterable[Dict[str, Any]],
    *,
    user_id: str,
    app_id: str,
    project_id: str,
    defer_extraction: bool = True,
) -> Dict[str, Any]:
    now_ms = int(time.time() * 1000)
    items: List[Dict[str, Any]] = []
    for i, raw in enumerate(messages):
        role = raw.get("role") or "user"
        if role == "system":
            continue
        if role not in {"user", "assistant", "tool"}:
            role = "user"
        content = raw.get("content") or ""
        if not str(content).strip():
            continue
        items.append({
            "sender_id": user_id,
            "role": role,
            "timestamp": now_ms + i,
            "content": content if isinstance(content, str) else str(content),
        })
    return {
        "session_id": session_id,
        "app_id": app_id,
        "project_id": project_id,
        "defer_extraction": defer_extraction,
        "messages": items,
    }


def format_search_hits(data: Dict[str, Any], limit: int = 4) -> str:
    blocks: List[str] = []
    for ep in (data.get("episodes") or [])[:limit]:
        summary = ep.get("summary") or ep.get("subject") or ep.get("episode") or ""
        if summary:
            blocks.append(f"- [episode] {str(summary).strip()[:400]}")
        for fact in (ep.get("atomic_facts") or [])[:2]:
            content = fact.get("content") or ""
            if content:
                blocks.append(f"  · {str(content).strip()[:240]}")
    for fact in (data.get("atomic_facts") or [])[:limit]:
        content = fact.get("content") or ""
        if content:
            blocks.append(f"- [fact] {str(content).strip()[:400]}")
    if not blocks:
        return ""
    return (
        "【官方 EverOS sidecar 情景记忆 (HTTP /api/v2/memory/search)】\n"
        + "\n".join(blocks)
        + "\n"
    )


class EverOSSidecarClient:
    def __init__(self, base_url: Optional[str] = None):
        raw = (base_url if base_url is not None else settings.everos_sidecar_url) or ""
        self.base_url = raw.rstrip("/")
        self.app_id = settings.everos_app_id
        self.project_id = settings.everos_project_id

    @property
    def enabled(self) -> bool:
        return bool(self.base_url)

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def health(self) -> Dict[str, Any]:
        if not self.enabled:
            return {"configured": False, "reachable": False, "url": None}
        try:
            with httpx.Client(timeout=2.0) as client:
                response = client.get(self._url("/health"))
            return {
                "configured": True,
                "reachable": response.status_code < 500,
                "url": self.base_url,
                "status_code": response.status_code,
            }
        except httpx.HTTPError as exc:
            return {"configured": True, "reachable": False, "url": self.base_url, "error": str(exc)}

    def add(
        self,
        session_id: str,
        messages: Iterable[Dict[str, Any]],
        user_id: str,
        defer_extraction: bool = True,
    ) -> Optional[Dict[str, Any]]:
        if not self.enabled:
            return None
        payload = build_add_payload(
            session_id,
            messages,
            user_id=user_id,
            app_id=self.app_id,
            project_id=self.project_id,
            defer_extraction=defer_extraction,
        )
        if not payload["messages"]:
            return None
        return self._post("/api/v2/memory/add", payload)

    def flush(self, session_id: str) -> Optional[Dict[str, Any]]:
        if not self.enabled:
            return None
        return self._post(
            "/api/v2/memory/flush",
            {"session_id": session_id, "app_id": self.app_id, "project_id": self.project_id},
        )

    def search(self, query: str, user_id: str, top_k: int = 5) -> Dict[str, Any]:
        if not self.enabled or not (query or "").strip():
            return {}
        result = self._post(
            "/api/v2/memory/search",
            {
                "user_id": user_id,
                "query": query,
                "method": "hybrid",
                "top_k": top_k,
                "app_id": self.app_id,
                "project_id": self.project_id,
            },
        )
        return result or {}

    def _post(self, path: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            with httpx.Client(timeout=20.0) as client:
                response = client.post(self._url(path), json=payload)
            if response.status_code >= 400:
                logger.warning("[everos sidecar] %s HTTP %s: %s", path, response.status_code, response.text[:400])
                return None
            body = response.json()
            return body.get("data", body)
        except httpx.HTTPError as exc:
            logger.warning("[everos sidecar] %s failed: %s", path, exc)
            return None


def get_everos_sidecar() -> EverOSSidecarClient:
    return EverOSSidecarClient()

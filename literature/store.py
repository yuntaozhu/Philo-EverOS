"""
Qdrant literature index. Consensus axioms stay in-repo JSON — do not upsert them here.
"""

from __future__ import annotations

import json
import logging
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

from config.settings import settings
from literature.embeddings import DoubaoEmbedder

logger = logging.getLogger("philo_everos.literature.store")


def document_point_id(doc_id: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"philo-literature:{doc_id}"))


def score_local_hit(query: str, doc: Dict[str, Any]) -> int:
    q = (query or "").lower()
    if not q:
        return 0
    score = 0
    haystacks = [
        doc.get("term") or "",
        doc.get("title") or "",
        doc.get("locator") or "",
        doc.get("source") or "",
        doc.get("text") or "",
        " ".join(doc.get("aliases") or []),
    ]
    blob = "\n".join(haystacks).lower()
    for token in q.replace("/", " ").split():
        if len(token) < 2:
            continue
        if token in blob:
            score += 3
    for alias in doc.get("aliases") or []:
        if alias.lower() in q or q in alias.lower():
            score += 5
    term = (doc.get("term") or "").lower()
    if term and term in q:
        score += 6
    return score


class LiteratureStore:
    def __init__(self, embedder: Optional[DoubaoEmbedder] = None):
        self.embedder = embedder or DoubaoEmbedder()
        self.host = settings.qdrant_host
        self.port = settings.qdrant_port
        self.collection = settings.qdrant_literature_collection
        self.index_path: Path = settings.literature_index_file

    def health(self) -> Dict[str, Any]:
        info: Dict[str, Any] = {
            "host": f"{self.host}:{self.port}",
            "collection": self.collection,
            "embedding_configured": self.embedder.enabled,
            "reachable": False,
            "local_index": self.index_path.exists(),
            "local_count": len(self._load_local()),
        }
        client = self._client()
        if client is None:
            return info
        try:
            names = {c.name for c in client.get_collections().collections}
            info["reachable"] = True
            info["collection_exists"] = self.collection in names
        except Exception as exc:
            info["error"] = str(exc)
        return info

    def ingest(self, documents: Sequence[Dict[str, Any]]) -> Dict[str, Any]:
        texts = [str(d.get("text") or "").strip() for d in documents]
        if not any(texts):
            raise ValueError("No document text to ingest.")
        local_count = self._write_local(documents)
        result: Dict[str, Any] = {
            "local_upserted": local_count,
            "local_index": str(self.index_path),
            "qdrant_upserted": 0,
        }
        if not self.embedder.enabled:
            result["qdrant"] = "skipped_no_ark_key"
            return result
        client = self._client()
        if client is None:
            result["qdrant"] = "skipped_unreachable"
            return result
        try:
            client.get_collections()
        except Exception as exc:
            result["qdrant"] = f"skipped_unreachable:{exc}"
            return result
        vectors = self.embedder.embed(texts)
        if len(vectors) != len(documents):
            raise RuntimeError("Embedding count does not match document count.")
        dim = len(vectors[0]) if vectors and vectors[0] else settings.doubao_embedding_dim
        self._ensure_collection(client, dim)
        from qdrant_client.http.models import PointStruct

        points = []
        for doc, vector in zip(documents, vectors):
            doc_id = str(doc.get("id") or uuid.uuid4())
            points.append(
                PointStruct(
                    id=document_point_id(doc_id),
                    vector=vector,
                    payload={
                        "id": doc_id,
                        "title": doc.get("title") or "",
                        "text": doc.get("text") or "",
                        "source": doc.get("source") or "",
                        "kind": doc.get("kind") or "primary",
                        "term": doc.get("term") or "",
                        "locator": doc.get("locator") or "",
                    },
                )
            )
        client.upsert(collection_name=self.collection, points=points)
        result["qdrant_upserted"] = len(points)
        result["collection"] = self.collection
        result["dim"] = dim
        result["qdrant"] = "ok"
        return result

    def search(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        if not (query or "").strip():
            return []
        remote = self._search_qdrant(query, top_k)
        if remote:
            return remote
        return self._search_local(query, top_k)

    def _search_qdrant(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        if not self.embedder.enabled:
            return []
        client = self._client()
        if client is None:
            return []
        try:
            names = {c.name for c in client.get_collections().collections}
            if self.collection not in names:
                return []
            vector = self.embedder.embed([query])[0]
            hits = client.search(
                collection_name=self.collection,
                query_vector=vector,
                limit=top_k,
                with_payload=True,
            )
        except Exception as exc:
            logger.info("[literature] qdrant search skipped: %s", exc)
            return []
        rows: List[Dict[str, Any]] = []
        for hit in hits:
            payload = hit.payload or {}
            rows.append({
                "id": payload.get("id") or str(hit.id),
                "score": float(hit.score or 0.0),
                "title": payload.get("title") or "",
                "text": payload.get("text") or "",
                "source": payload.get("source") or "",
                "kind": payload.get("kind") or "",
                "locator": payload.get("locator") or "",
            })
        return rows

    def _search_local(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        scored = []
        for doc in self._load_local():
            points = score_local_hit(query, doc)
            if points > 0:
                scored.append((points, doc))
        scored.sort(key=lambda item: item[0], reverse=True)
        rows = []
        for points, doc in scored[:top_k]:
            rows.append({
                "id": doc.get("id") or "",
                "score": float(points),
                "title": doc.get("title") or "",
                "text": doc.get("text") or "",
                "source": doc.get("source") or "",
                "kind": doc.get("kind") or "primary",
                "locator": doc.get("locator") or "",
            })
        return rows

    def _load_local(self) -> List[Dict[str, Any]]:
        if not self.index_path.exists():
            return []
        try:
            data = json.loads(self.index_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return []
        if isinstance(data, dict):
            data = data.get("documents") or []
        return [row for row in data if isinstance(row, dict)]

    def _write_local(self, documents: Sequence[Dict[str, Any]]) -> int:
        existing = {str(d.get("id")): d for d in self._load_local() if d.get("id")}
        for doc in documents:
            if not (doc.get("text") or "").strip():
                continue
            existing[str(doc.get("id") or uuid.uuid4())] = dict(doc)
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        rows = list(existing.values())
        self.index_path.write_text(
            json.dumps({"documents": rows, "count": len(rows)}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return len(rows)

    def format_hits(self, hits: Sequence[Dict[str, Any]]) -> str:
        if not hits:
            return ""
        lines = []
        for i, hit in enumerate(hits, 1):
            title = hit.get("title") or hit.get("source") or hit.get("id")
            excerpt = str(hit.get("text") or "").replace("\n", " ")[:360]
            lines.append(f"[{i}] {title} ({hit.get('source') or 'literature'})\n   {excerpt}")
        return (
            "【文献库 Qdrant + 豆包 embedding（原典/codebook，非共识公理）】\n"
            + "\n".join(lines)
            + "\n本地模型只可用这些片段作引证骨架；不得补造未入库章节号。\n"
        )

    def _client(self):
        try:
            from qdrant_client import QdrantClient
        except ImportError:
            return None
        try:
            return QdrantClient(host=self.host, port=self.port, timeout=3.0)
        except Exception:
            return None

    def _require_client(self):
        client = self._client()
        if client is None:
            raise RuntimeError(f"Qdrant is not reachable at {self.host}:{self.port}.")
        try:
            client.get_collections()
        except Exception as exc:
            raise RuntimeError(f"Qdrant is not reachable at {self.host}:{self.port}: {exc}") from exc
        return client

    def _ensure_collection(self, client, dim: int) -> None:
        from qdrant_client.http.models import Distance, VectorParams

        names = {c.name for c in client.get_collections().collections}
        if self.collection in names:
            return
        client.create_collection(
            collection_name=self.collection,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )
        logger.info("[literature] created Qdrant collection %s dim=%s", self.collection, dim)

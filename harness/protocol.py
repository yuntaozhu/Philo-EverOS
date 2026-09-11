"""
Research protocol lock: phil / soc / hybrid.

Proposition type decides method, evidence, and audit. Hybrid must name
information loss when a philosophical concept is operationalized.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, Optional

from config.settings import settings

CLAIM_TYPES = ("phil", "soc", "hybrid")

SOC_MARKERS = (
    "问卷", "回归", "样本量", "codebook", "operationaliz", "survey",
    "regression", "田野", "访谈", "n=", "pvalue", "p-value", "自变量",
    "因变量", "信效度", "抽样",
)
PHIL_MARKERS = (
    "/deconstruct", "/socratic", "/etymology", "/compare",
    "dasein", "先验", "本体", "cogito", "transcendental", "οὐσία",
    "geworf", "intentionalit", " substantia", "二律背反",
)

_CLAIM_PREFIX = re.compile(r"^/(?:claim|protocol)\s+(phil|soc|hybrid)\b", re.I)


def detect_claim_type(query: str, explicit: Optional[str] = None) -> str:
    if explicit and explicit.lower() in CLAIM_TYPES:
        return explicit.lower()
    text = (query or "").strip()
    prefixed = _CLAIM_PREFIX.match(text)
    if prefixed:
        return prefixed.group(1).lower()
    lowered = text.lower()
    soc = any(m in lowered for m in SOC_MARKERS)
    phil = any(m in lowered for m in PHIL_MARKERS)
    if soc and phil:
        return "hybrid"
    if soc:
        return "soc"
    return "phil"


def strip_claim_prefix(query: str) -> str:
    text = (query or "").strip()
    cleaned = _CLAIM_PREFIX.sub("", text, count=1).strip()
    return cleaned or text


def protocol_instruction(claim_type: str) -> str:
    kind = claim_type if claim_type in CLAIM_TYPES else "phil"
    if kind == "phil":
        return (
            "【研究协议锁定：phil（哲学）】\n"
            "- 本地模型写形式骨架：前提、隐涵、推论、有效性/稳妥性。\n"
            "- 禁止把存在论问题改写成问卷题、神经机制或政策建议。\n"
            "- 云端模型（若被点名）只补原典边码与译本脉络，不得改写结论层。"
        )
    if kind == "soc":
        return (
            "【研究协议锁定：soc（社会科学）】\n"
            "- 必须写清：研究问题、操作化、样本/语料、方法、限度。\n"
            "- 禁止用「存在」「此在」「先验主体」解释回归系数或访谈编码。\n"
            "- 本地模型审查操作化是否偷换概念；云端只核文献与方法惯例。"
        )
    return (
        "【研究协议锁定：hybrid（哲学 ∩ 社会科学）】\n"
        "- 先分栏：哲学承诺（不可操作化的概念）| 经验层（可测量的指标）。\n"
        "- 必须单列【信息损耗 (Information Loss)】：说明从哲学概念落到指标时丢掉了什么，"
        "以及该损耗是否使原命题不再可判定。\n"
        "- 禁止用问卷分数回证本体论；也禁止用存在论词汇给统计结果镀金。"
    )


class ResearchSessionStore:
    def __init__(self, root: Optional[Path] = None):
        self.root = root or (settings.data_dir / "harness" / "sessions")
        self.root.mkdir(parents=True, exist_ok=True)

    def _path(self, user_id: str) -> Path:
        safe = re.sub(r"[^a-zA-Z0-9_.-]+", "_", user_id or "default_scholar")
        return self.root / f"{safe}.json"

    def load(self, user_id: str) -> Dict[str, Any]:
        path = self._path(user_id)
        if not path.exists():
            return {
                "user_id": user_id,
                "claim_type": None,
                "glossary": {},
                "open_questions": [],
                "artifacts": [],
            }
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return {"user_id": user_id, "claim_type": None}

    def lock_claim_type(self, user_id: str, claim_type: str) -> Dict[str, Any]:
        if claim_type not in CLAIM_TYPES:
            raise ValueError(f"claim_type must be one of {CLAIM_TYPES}")
        state = self.load(user_id)
        state["user_id"] = user_id
        state["claim_type"] = claim_type
        self._path(user_id).write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
        return state

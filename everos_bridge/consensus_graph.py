"""
EverOS Collective Consensus Graph & Memory
Maintains stabilized philosophical definitions established during seminars to prevent concept drift.
"""

import json
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from config.settings import settings

class ConsensusNode(BaseModel):
    id: str
    concept: str
    affirmation: str
    negation_or_drift_warning: str
    source_seminar: str
    school_context: str
    citations: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    created_at: float = Field(default_factory=time.time)

DEFAULT_CONSENSUS_ITEMS: List[Dict[str, Any]] = [
    {
        "id": "cnode-husserl-fulfilment",
        "concept": "胡塞尔意向充实 (Husserlian Intuitive Fulfilment / Erfüllung)",
        "affirmation": "本研讨班确立公识：胡塞尔的意向充实（Intentionale Erfüllung）是意向本质在充实直观中的证实过程，属于先验意识内在的结构综合。",
        "negation_or_drift_warning": "严禁等同于经验实在论或朴素反映论中‘心智客体与外在实在物的符合论’反映，否则落入自然态度（Natürliche Einstellung）的范畴谬误。",
        "source_seminar": "《逻辑研究》第六研究讨论班（第4轮研讨）",
        "school_context": "欧陆现象学 (Husserlian Phenomenology)",
        "citations": ["Husserl, Logische Untersuchungen VI, §14-§16", "倪梁康《现象学及其效应》"],
        "tags": ["胡塞尔", "意向充实", "先验现象学", "直观", "实在论批判"]
    },
    {
        "id": "cnode-heidegger-dasein",
        "concept": "此在 (Dasein) 与现成存在 (Vorhandenheit) 的界限",
        "affirmation": "本研讨班确立公识：此在（Dasein）的存在是‘在世界之中存在’（In-der-Welt-sein），其本质在于生存（Existenz）与对存在的领会。",
        "negation_or_drift_warning": "切忌将此在降解为笛卡尔式的思维实体（Res cogitans）、康德式认识论主体或经验人类学/生物学意义上的人体。",
        "source_seminar": "《存在与时间》导论研讨班（第2轮研讨）",
        "school_context": "基础存在论 (Fundamental Ontology)",
        "citations": ["Heidegger, Sein und Zeit, §9-§12", "陈嘉映《存在与时间读本》"],
        "tags": ["海德格尔", "此在", "Dasein", "现成存在", "主客二分批判"]
    },
    {
        "id": "cnode-kant-transcendental",
        "concept": "先验 (Transcendental) 与 先天 (A priori) 的形式区分",
        "affirmation": "本研讨班确立公识：先天（A priori）指认识在逻辑上先于经验且具普遍必然性；先验（Transcendental）专指‘使一切经验知识成为可能的形式条件’之反思体系。",
        "negation_or_drift_warning": "杜绝将 Transcendental 与 Transcendent（超验/超绝，超出一切可能经验界限）相混淆；严禁按常识把先验等同于心理学先知或直觉感受。",
        "source_seminar": "《纯粹理性批判》先验感性论与先验分析论导读",
        "school_context": "德国古典唯心论 / 批判哲学 (Critical Philosophy)",
        "citations": ["Kant, Kritik der reinen Vernunft, B25/A11", "邓晓芒《纯粹理性批判句读》"],
        "tags": ["康德", "先验", "先天", "超验", "范畴演绎"]
    },
    {
        "id": "cnode-wittgenstein-language-game",
        "concept": "维特根斯坦语言游戏与意图的私有性批判",
        "affirmation": "语言的意义在于其在特定生活形式（Lebensform）中的使用（Usage in practice）；‘遵守规则’（Rule-following）本质上是一种公共性实践。",
        "negation_or_drift_warning": "严禁重构出任何形而上学的‘私人感觉语言’，任何将意义锚定于内在神秘私有心理剧场的解释均被后期维特根斯坦归谬。",
        "source_seminar": "《哲学研究》语言哲学研讨班",
        "school_context": "当代分析哲学 / 日常语言学派 (Analytic Philosophy)",
        "citations": ["Wittgenstein, Philosophische Untersuchungen, §243-§270", "韩林合《<哲学研究>解读》"],
        "tags": ["维特根斯坦", "语言游戏", "私人语言论证", "遵守规则"]
    }
]

class ConsensusGraph:
    """EverOS Consensus Graph Manager."""

    def __init__(self, filepath: Optional[Path] = None):
        self.filepath = filepath or settings.consensus_file
        self.nodes: Dict[str, ConsensusNode] = {}
        self._load_or_init()

    def _load_or_init(self):
        if self.filepath.exists():
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    raw_data = json.load(f)
                    for item in raw_data:
                        node = ConsensusNode(**item)
                        self.nodes[node.id] = node
                return
            except Exception:
                pass
        
        # Initialize defaults
        for item in DEFAULT_CONSENSUS_ITEMS:
            node = ConsensusNode(**item)
            self.nodes[node.id] = node
        self.save()

    def save(self):
        self.filepath.parent.mkdir(parents=True, exist_ok=True)
        serializable = [node.model_dump() for node in self.nodes.values()]
        with open(self.filepath, "w", encoding="utf-8") as f:
            json.dump(serializable, f, ensure_ascii=False, indent=2)

    def add_consensus(
        self,
        concept: str,
        affirmation: str,
        negation_or_drift_warning: str,
        source_seminar: str,
        school_context: str,
        citations: Optional[List[str]] = None,
        tags: Optional[List[str]] = None
    ) -> ConsensusNode:
        import uuid
        node_id = f"cnode-{uuid.uuid4().hex[:8]}"
        node = ConsensusNode(
            id=node_id,
            concept=concept,
            affirmation=affirmation,
            negation_or_drift_warning=negation_or_drift_warning,
            source_seminar=source_seminar,
            school_context=school_context,
            citations=citations or [],
            tags=tags or []
        )
        self.nodes[node.id] = node
        self.save()
        return node

    def recall_relevant_consensus(self, query: str, top_k: int = 3) -> List[ConsensusNode]:
        """Simple, deterministic concept-matching retrieval to anchor seminar facts."""
        q_lower = query.lower()
        scored: List[tuple[int, ConsensusNode]] = []

        for node in self.nodes.values():
            score = 0
            if node.concept.lower() in q_lower or any(part in q_lower for part in node.concept.split()):
                score += 5
            for tag in node.tags:
                if tag.lower() in q_lower:
                    score += 3
            if node.school_context.lower() in q_lower:
                score += 2
            if score > 0:
                scored.append((score, node))

        scored.sort(key=lambda x: x[0], reverse=True)
        if scored:
            return [node for _, node in scored[:top_k]]
        # Fallback to top 2 if general query
        return list(self.nodes.values())[:top_k]

    def generate_prompt_injection(self, query: str) -> str:
        relevant = self.recall_relevant_consensus(query)
        if not relevant:
            return ""

        blocks = []
        for i, node in enumerate(relevant, 1):
            cits = " | ".join(node.citations) if node.citations else "经典原典"
            blocks.append(
                f"[{i}] 《{node.concept}》 (来源: {node.source_seminar})\n"
                f"   • 公识定性: {node.affirmation}\n"
                f"   • 漂移防线: {node.negation_or_drift_warning}\n"
                f"   • 原典核定: {cits}"
            )
        
        joined = "\n\n".join(blocks)
        return (
            f"【EverOS 全系集体共识记忆库 (Consensus Grounding - 严禁概念漂移)】\n"
            f"以下是师生在既往高阶研讨班中共同论证确立的共识结论。在回答中必须奉为基本公理，严禁回溯或混淆：\n"
            f"{joined}\n"
        )

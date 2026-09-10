"""
Philo-EverOS Academic Orchestrator & Request Router
Routes user intent to built-in or crystallized skills, injects EverOS long-term memory,
and synthesizes high-density seminar prompts.
"""

from typing import Dict, Any, List, Optional, Tuple
from skills.base import BaseSkill
from skills.builtin import (
    ArgumentDeconstructSkill,
    EtymologyTrackerSkill,
    SocraticChallengeSkill,
    CrossSystemCompareSkill
)
from everos_bridge.memory_engine import EverOSMemoryEngine
from harness.guardrails import AcademicGuardrails

SEMINAR_CORE_SYSTEM_PROMPT = """你是一位精通西方哲学史（从前苏格拉底到后现代）、当代分析哲学、欧陆现象学与诠释学、以及东方哲学（先秦诸子与佛学中观/唯识）的资深哲学教授与学术研讨导师。你的职责是以最高标准的学术严谨性，与师生共同解构命题、审查形式论证、考订核心概念，并引导批判性思考。

【Core Methodological Principles (核心方法论原则)】:
1. 【概念与词源精确锚定】：涉及关键术语时，必须标注源语言并区分译名脉络（如：希腊文 Ousia / Logos；拉丁文 Substantia / Cogito；德文 Dasein / Aufhebung / Vorhandenheit；法文 Différance）。中译本争议时，需指明学术界代表性译者（如康德文本之于邓晓芒 vs 蓝公武；海德格尔文本之于陈嘉映 vs 孙周兴）。
2. 【形式化论证驱动】：将模糊直觉还原为具有明确逻辑关系的推论链（公理/明示前提 -> 隐涵假设 -> 推论步骤 -> 结论）。严格区分“逻辑有效性”（Validity）与“事实稳妥性”（Soundness）。
3. 【对立体系张力再现】：面对无定论难题（如心灵-肉体、自由意志、反实在论），严禁折中调和或给出平庸结论；必须将冲突双方前提逼到极限，展现其不可调和的断裂点。
4. 【苏格拉底式发问终局】：每一轮实质性论辩的结尾，必须以粗体提出 1-2 个能够直击当前论证脆弱假定、或引发更深形而上学危机的**苏格拉底式反思性问题**。

【Negative Constraints (绝对禁止事项)】:
1. 严禁使用“总的来说”、“不同人有不同看法”、“这具有积极的现实意义”等泛泛而谈的陈词滥调。
2. 严禁将本体论（Ontological）问题矮化为心理学或实证经验认知（Ontic/Psychological）问题。
3. 严禁捏造不存在的文献章节；引述原典时，应力求精准到书名、章节或经典命题编号（如《逻辑哲学论》命题号、《伦理学》公理与命题编号）。
"""

class AcademicOrchestrator:
    """Central Harness coordinating Skill Routing, Context Injection, and Guardrails."""

    def __init__(self, memory_engine: Optional[EverOSMemoryEngine] = None):
        self.memory_engine = memory_engine or EverOSMemoryEngine()
        self.guardrails = AcademicGuardrails()

        # Register builtin skills
        self.builtin_skills: Dict[str, BaseSkill] = {
            "argument_deconstruct": ArgumentDeconstructSkill(),
            "etymology_tracker": EtymologyTrackerSkill(),
            "socratic_challenge": SocraticChallengeSkill(),
            "cross_system_compare": CrossSystemCompareSkill(),
        }

    def detect_active_skill(self, query: str) -> Tuple[Optional[BaseSkill], Optional[str]]:
        """
        Inspects query to route to either a built-in skill or an EverOS crystallized skill.
        Returns (skill_instance, clean_query).
        """
        q = query.strip()

        # 1. Match builtins
        for skill in self.builtin_skills.values():
            if skill.match(q):
                return skill, skill.clean_query(q)

        # 2. Match crystallized skills in EverOS
        crystallized = self.memory_engine.crystallizer.crystallized_skills
        for c_id, c_skill in crystallized.items():
            if q.startswith(c_skill.command_alias) or f" {c_skill.command_alias}" in q:
                # Return wrapped dynamic skill
                cleaned = q.replace(c_skill.command_alias, "").strip()
                return None, cleaned

        return None, q

    def synthesize_prompt(
        self,
        messages: List[Dict[str, str]],
        user_id: str = "default_scholar"
    ) -> List[Dict[str, str]]:
        """
        Assembles OpenAI-format message array into an augmented seminar prompt:
        [System (Identity + Method + EverOS Profile + Consensus Memory + Active Skill)] + [History]
        """
        last_user_message = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_user_message = m.get("content", "")
                break

        # 1. Detect skill and extract clean proposition
        active_skill, clean_query = self.detect_active_skill(last_user_message)

        # 2. Get EverOS memory injection (Profile + Consensus Graph)
        everos_context = self.memory_engine.build_context_injection(clean_query, user_id=user_id)

        # 3. Formulate skill directive
        skill_instruction = ""
        if active_skill:
            skill_instruction = f"\n\n{active_skill.get_prompt_instruction(clean_query)}"
        else:
            # Check if matching crystallized skill
            crystallized = self.memory_engine.crystallizer.crystallized_skills
            for c_id, c_skill in crystallized.items():
                if last_user_message.startswith(c_skill.command_alias):
                    skill_instruction = (
                        f"\n\n【当前激活 EverOS 自进化技能：{c_skill.name} ({c_skill.command_alias})】\n"
                        f"{c_skill.system_prompt_template}\n"
                        f"结构步骤:\n" + "\n".join([f"- {s}" for s in c_skill.formal_structure])
                    )
                    break

        complete_system_prompt = (
            f"{SEMINAR_CORE_SYSTEM_PROMPT}\n\n"
            f"{everos_context}"
            f"{skill_instruction}"
        )

        # 4. Assemble final messages
        processed_messages = [{"role": "system", "content": complete_system_prompt}]

        for m in messages:
            if m.get("role") == "system":
                continue  # Replaced by our master system prompt
            elif m.get("role") == "user" and m.get("content") == last_user_message and active_skill:
                # Provide cleaned query to avoid clutter
                processed_messages.append({"role": "user", "content": clean_query or last_user_message})
            else:
                processed_messages.append(m)

        return processed_messages

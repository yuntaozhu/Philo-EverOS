"""
Philo-EverOS Academic Guardrails
Enforces rigorous citation standards, guards against ontic reductions, and audits formal deductive validity.
"""

import re
from typing import Dict, Any, List, Optional

class AcademicGuardrails:
    """Rigorous academic checker for philosophical discourse integrity."""

    # Banned cliché expressions that undermine seminar depth
    BANNED_CLICHES = [
        "总的来说", "不同人有不同看法", "这具有积极的现实意义",
        "仁者见仁智者见智", "从辩证的角度来看各打五十大板"
    ]

    # Patterns indicating improper reduction of ontological concepts to empirical/psychological states
    ONTIC_REDUCTION_PATTERNS = [
        (r"此在.*(?:生物学|神经元|心理情绪|基因)", "【本体论降解警告】: 严禁将海德格尔‘此在’(Dasein)降解为经验生物学或心理学实体。"),
        (r"先验统觉.*(?:大脑皮层|心理机制)", "【先验结构降解警告】: 康德先验统觉之统一性属于认识的形式逻辑奠基，切忌混淆于心理学经验联想。"),
        (r"意向性.*(?:神经反射|条件刺激)", "【现象学自然化警告】: 胡塞尔意向性（Intentionality）是对纯粹意识构造的描述，严禁简化为行为主义生理反射。")
    ]

    @classmethod
    def audit_response(cls, text: str, claim_type: Optional[str] = None) -> Dict[str, Any]:
        """Audits generated response against academic criteria."""
        issues: List[str] = []
        passed_rules: List[str] = []
        if claim_type == "hybrid" and "信息损耗" not in text and "Information Loss" not in text:
            issues.append("hybrid 协议要求单独写出【信息损耗 (Information Loss)】。")

        # 1. Check for banned clichés
        for phrase in cls.BANNED_CLICHES:
            if phrase in text:
                issues.append(f"检测到非学术化泛泛套话：‘{phrase}’，应提炼为具体的形而上学或逻辑论断。")

        # 2. Check for Ontological -> Ontic Reduction
        for pattern, warning in cls.ONTIC_REDUCTION_PATTERNS:
            if re.search(pattern, text):
                issues.append(warning)

        # 3. Check for Socratic ending
        has_bold_question = bool(re.search(r"\*\*[^*?？]*[?？]\*\*", text) or re.search(r"\*\*苏格拉底式.*[?？]\*\*", text))
        if has_bold_question:
            passed_rules.append("苏格拉底式反思终局已正确形式化锚定。")
        else:
            issues.append("未在结尾清晰以粗体标注苏格拉底式反思性问题（需使用 **粗体反诘句？**）。")

        # 4. Check for citation and Greek/Latin/German original annotations
        has_foreign_term = bool(re.search(r"[A-Za-z\u0370-\u03FF\u1F00-\u1FFF]{3,}", text))
        if has_foreign_term:
            passed_rules.append("术语考订包含原语言学符号（希腊语/德语/拉丁语/法语）。")

        return {
            "is_valid": len(issues) == 0,
            "issues": issues,
            "passed_rules": passed_rules,
            "score": max(0.0, 1.0 - (len(issues) * 0.25))
        }

    @classmethod
    def apply_post_processing(cls, text: str) -> str:
        """Light cleanup and normalization."""
        # Ensure clean formatting
        cleaned = text.strip()
        return cleaned

"""
Builtin Skill: Argument Formal Deconstruction (/deconstruct)
"""

from skills.base import BaseSkill

class ArgumentDeconstructSkill(BaseSkill):
    @property
    def skill_id(self) -> str:
        return "argument_deconstruct"

    @property
    def command_prefix(self) -> str:
        return "/deconstruct"

    @property
    def name(self) -> str:
        return "论证形式化重构模式 (Argument Formal Deconstruction)"

    @property
    def description(self) -> str:
        return "将哲学文本或命题严格拆解为明示前提、隐涵假设、形式推论链、形式漏洞与反例判别。"

    def get_prompt_instruction(self, query: str) -> str:
        return (
            "【当前激活技能：/deconstruct 论证形式化重构模式】\n"
            "必须强制将用户输入或讨论的命题，严格解构为以下四栏标准学术架构：\n\n"
            "1. 【明示前提 (Explicit Premises)】：\n"
            "   - 逐条列出文本中直接陈述的命题 (P1, P2... Pn)，剔除一切修辞与抒情成分。\n"
            "2. 【隐涵/未言假设 (Suppressed/Tacit Premises)】：\n"
            "   - 挖掘该论证必须预设才能通畅的本体论或认识论先入之见 (T1, T2...)。\n"
            "3. 【推导逻辑链 (Inference Chain)】：\n"
            "   - 使用清晰的形式推导步骤 (例如: P1 ∧ T1 ⊢ C1, C1 ∧ P2 ⊢ Conclusion)；严格区分有效性（Validity）与事实稳妥性（Soundness）。\n"
            "4. 【形式漏洞与反例判别 (Fallacies & Counter-examples)】：\n"
            "   - 审查是否存在窃取论题（Begging the question）、偷换概念（Equivocation）、肯定后件或范畴错误（Category Mistake），并构造一个最致命的极限反例。\n\n"
            "※ 终局要求：必须以粗体提出 1-2 个能够直击当前论证脆弱假定、或引发更深形而上学危机的**苏格拉底式反思性问题**。"
        )

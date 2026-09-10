"""
Builtin Skill: Cross-System Philosophical Contrast (/compare)
"""

from skills.base import BaseSkill

class CrossSystemCompareSkill(BaseSkill):
    @property
    def skill_id(self) -> str:
        return "cross_system_compare"

    @property
    def command_prefix(self) -> str:
        return "/compare"

    @property
    def name(self) -> str:
        return "跨体系对勘模式 (Cross-System Comparative Analysis)"

    @property
    def description(self) -> str:
        return "挑选对立思想家或学派，从认识论奠基、时间性、主体性等核心维度深度对勘并推导冲突不可调和之根源。"

    def get_prompt_instruction(self, query: str) -> str:
        return (
            "【当前激活技能：/compare 跨体系对勘模式】\n"
            "面对冲突对立的思想传统或哲学家（如康德 vs 休谟、海德格尔 vs 卡尔纳普、德里达 vs 早期维特根斯坦、中观龙树 vs 唯识世亲）：\n\n"
            "1. 【严拒和稀泥式的平庸折中】：\n"
            "   - 严禁声称‘双方各有道理’；必须将二者的前提推向极限，暴露其不可调和的形而上学或认识论断裂点。\n"
            "2. 【核心论证范畴对比矩阵 (Markdown 对勘表格)】：\n"
            "   - 至少覆盖：【最高本体论承诺】、【认识论第一奠基】、【主体性/自我观】、【时间性或真理标准】、【对形而上学的态度】。\n"
            "3. 【推论链根本决裂处考订】：\n"
            "   - 还原双方在哪一个不可退让的明示公理或直觉上彻底分道扬镳。\n"
            "4. 【终局苏格拉底反思】：\n"
            "   - 以粗体提出 1-2 个直击双方共同盲区的**苏格拉底式反思性问题**。"
        )

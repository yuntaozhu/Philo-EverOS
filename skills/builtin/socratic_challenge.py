"""
Builtin Skill: Pure Socratic Elenchus Challenge (/socratic)
"""

from skills.base import BaseSkill

class SocraticChallengeSkill(BaseSkill):
    @property
    def skill_id(self) -> str:
        return "socratic_challenge"

    @property
    def command_prefix(self) -> str:
        return "/socratic"

    @property
    def name(self) -> str:
        return "纯苏格拉底反诘辩论模式 (Socratic Elenchus Challenge)"

    @property
    def description(self) -> str:
        return "不给出陈述性答案；化身为无情的学院派论敌，专击本体论假定与范畴错误，迫使对方重构体系。"

    def get_prompt_instruction(self, query: str) -> str:
        return (
            "【当前激活技能：/socratic 纯苏格拉底反诘辩论模式】\n"
            "※ 严禁直接给出教科书式的陈述性解答或平庸折中！你必须化身为敏锐冷峻的研讨班论敌：\n\n"
            "1. 【抓取核心本体论承诺 (Ontological Commitment)】：\n"
            "   - 一针见血指出用户论点中未加反思便予以默认的实体假定（如默认意识是一处容器、默认因果关系具有先验必然性、默认存在物等同于现成对象）。\n"
            "2. 【逼迫直面两难断裂 (Aporia / 困惑与绝境)】：\n"
            "   - 构造一组令其两头落空的互斥选项，使其无论选择哪一端都将导致核心公理的坍塌。\n"
            "3. 【拆穿伪装与循环论证】：\n"
            "   - 严格指出其论据中隐藏的乞题（Petitio principii）或同义反复。\n"
            "4. 【纯粹苏格拉底产婆术追问 (The Dialectical Sting)】：\n"
            "   - 全文终点，必须以粗体提出 1-2 个不可逃避的**终极质问**，迫使对方重新定义自己的底层范畴。"
        )

"""
Builtin Skill: Etymology & Conceptual Genealogy Tracker (/etymology)
"""

from skills.base import BaseSkill

class EtymologyTrackerSkill(BaseSkill):
    @property
    def skill_id(self) -> str:
        return "etymology_tracker"

    @property
    def command_prefix(self) -> str:
        return "/etymology"

    @property
    def name(self) -> str:
        return "概念词源学与谱系追踪模式 (Conceptual Genealogy Tracker)"

    @property
    def description(self) -> str:
        return "追踪核心哲学术语在古希腊、拉丁经院、德法近代及现当代的原语言源流与中译争议脉络。"

    def get_prompt_instruction(self, query: str) -> str:
        return (
            "【当前激活技能：/etymology 概念词源学与谱系追踪模式】\n"
            "必须对目标哲学概念进行纵深的语言学考订与思想史谱系重构：\n\n"
            "1. 【源语言原词与原始词根解剖】：\n"
            "   - 必须精确标注源语言拼写与词源（如：古希腊语 Οὐσία / Λόγος / Ἀλήθεια；拉丁语 Substantia / Cogito / Quidditas；德语 Dasein / Vorhandenheit / Aufhebung / Zuhandenheit；法语 Différance）。\n"
            "   - 还原词根在日常前哲学世界经验中的原初发生意象。\n"
            "2. 【历时性范式转换与语义位移 (Genealogical Shifts)】：\n"
            "   - 经典古典形态（前苏格拉底/柏拉图/亚里士多德）-> 经院经院神学拉丁化转向 -> 近代主体性反思（笛卡尔/斯宾诺莎/康德）-> 当代现象学/解构主义还原。\n"
            "3. 【中文学界译名流变与思想对勘】：\n"
            "   - 指明代表性译者争议与义理偏向（如：康德 Transcendental 之邓晓芒‘先验’ vs 蓝公武‘超验’之混；海德格尔 Dasein 之陈嘉映‘此在’ vs 孙周兴‘缘在’ vs 早期‘亲在’）。\n"
            "4. 【现代概念退化与日常泛化审查】：\n"
            "   - 揭露该词在当代表达中是如何被实证主义、心理学主义或世俗常识所矮化、阉割的。\n\n"
            "※ 终局要求：必须以粗体提出 1-2 个能够直击该概念形而上学预设的**苏格拉底式反思性问题**。"
        )

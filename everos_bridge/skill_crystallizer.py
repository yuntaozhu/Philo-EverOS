"""
EverOS Skill Crystallizer Engine
Monitors high-value academic interactions and distills recurring philosophical reasoning paradigms
into standalone, reusable crystallized skill specifications (Markdown/YAML).
"""

import os
import re
import yaml
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from config.settings import settings

class CrystallizedSkill(BaseModel):
    skill_id: str
    name: str
    command_alias: str
    description: str
    paradigm_pattern: str
    system_prompt_template: str
    formal_structure: List[str]
    source_dialogue_summary: str
    crystallized_at: str
    activation_threshold: float = 0.85
    version: str = "1.0.0"

class SkillCrystallizer:
    """Detects and crystallizes emergent argumentative patterns from philosophical dialogues."""

    def __init__(self, skills_dir: Optional[Path] = None):
        self.skills_dir = skills_dir or settings.crystallized_skills_dir
        self.skills_dir.mkdir(parents=True, exist_ok=True)
        self.crystallized_skills: Dict[str, CrystallizedSkill] = {}
        self._load_crystallized_skills()

    def _load_crystallized_skills(self):
        for file in self.skills_dir.glob("*.yaml"):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if data and "skill_id" in data:
                        skill = CrystallizedSkill(**data)
                        self.crystallized_skills[skill.skill_id] = skill
            except Exception as e:
                pass

    def save_skill(self, skill: CrystallizedSkill):
        yaml_file = self.skills_dir / f"{skill.skill_id}.yaml"
        md_file = self.skills_dir / f"{skill.skill_id}.md"

        # 1. Save YAML format
        with open(yaml_file, "w", encoding="utf-8") as f:
            yaml.dump(skill.model_dump(), f, allow_unicode=True, sort_keys=False)

        # 2. Save Markdown specification documentation
        struct_md = "\n".join([f"- Step {i+1}: {step}" for i, step in enumerate(skill.formal_structure)])
        md_content = f"""# Crystallized Skill: {skill.name} (`{skill.command_alias}`)

## 元信息
- **Skill ID**: `{skill.skill_id}`
- **结晶时间**: `{skill.crystallized_at}`
- **推演范式**: {skill.paradigm_pattern}

## 核心论证结构 (Formal Structure)
{struct_md}

## 系统提示词注入范本
```markdown
{skill.system_prompt_template}
```

## 诞生源流研讨摘要
> {skill.source_dialogue_summary}
"""
        with open(md_file, "w", encoding="utf-8") as f:
            f.write(md_content)

        self.crystallized_skills[skill.skill_id] = skill

    def analyze_dialogue_for_crystallization(
        self,
        user_message: str,
        assistant_response: str
    ) -> Optional[CrystallizedSkill]:
        """
        Heuristic pattern detector for philosophical paradigms:
        - Counterfactual Gedankenexperiment (反事实思想实验)
        - Syllogistic Reductio (三段论归谬)
        - Transcendental Deduction (康德式先验条件回溯)
        """
        combined = f"{user_message}\n{assistant_response}"

        # Check for Counterfactual Thought Experiment pattern
        if ("思想实验" in combined or "反事实" in combined or "假想世界" in combined or "thought experiment" in combined.lower()) and ("孪生地球" in combined or "缸中之脑" in combined or "中文屋" in combined or "黑白玛丽" in combined or "直觉泵" in combined):
            if "counterfactual_thought_experiment" not in self.crystallized_skills:
                skill = CrystallizedSkill(
                    skill_id="counterfactual_thought_experiment",
                    name="反事实思想实验与直觉泵解构",
                    command_alias="/experiment",
                    description="构建极限反事实可能世界场景（Possible Worlds），迫使论敌在本体论直觉与语义外在论之间选边。",
                    paradigm_pattern="反事实条件设定 -> 物理/意识同一性剥离 -> 直觉悖论揭露 -> 本体现行结论",
                    system_prompt_template="【反事实思想实验模式】：请严格设定可能世界（W*）的物理与因果常数，通过最小干预原则引入变量，推导出与原命题冲突的直觉极限。",
                    formal_structure=[
                        "设定基准现实世界 W0 与反事实假想世界 W*",
                        "引入非物理性或反事实扰动变量 (Perturbation Variable)",
                        "推导观察者第一人称与第三人称认识论落差 (Epistemic Gap)",
                        "得出原论据逻辑超载或范畴崩塌的不可回避性结论"
                    ],
                    source_dialogue_summary="源自关于普特南孪生地球与笛卡尔恶魔怀疑论的心灵哲学高阶研讨。",
                    crystallized_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                )
                self.save_skill(skill)
                return skill

        # Check for Syllogistic Reductio pattern
        if ("归谬" in combined or "reductio" in combined.lower() or "自相矛盾" in combined) and ("假定P" in combined or "若P成立" in combined or "导出~P" in combined or "荒谬推论" in combined):
            if "syllogistic_reductio" not in self.crystallized_skills:
                skill = CrystallizedSkill(
                    skill_id="syllogistic_reductio",
                    name="形式三段论归谬法 (Reductio ad Absurdum)",
                    command_alias="/reductio",
                    description="假定论敌之命题为真，严格形式化展开其中蕴涵的逻辑链，逼导出两难困境或自毁性悖论。",
                    paradigm_pattern="假设公理 -> 演绎推论链 -> 悖论矛盾锚定 (P ∧ ¬P) -> 原始命题必然为假",
                    system_prompt_template="【三段论归谬模式】：先行无条件接受对方的核心明示命题，以最严格的形式推论步步紧逼，直至引出形而上学或逻辑上的不可容忍之矛盾。",
                    formal_structure=[
                        "Step 1: 引入论敌命题 P 作为临时公理",
                        "Step 2: 结合无可辩驳的普遍前提 Q, 推演出中间项 R",
                        "Step 3: 揭露 R 必然蕴涵非 P (R ⊢ ¬P)",
                        "Step 4: 宣布 (P ∧ ¬P) 形式矛盾，根据否定引入律（Negation Introduction）证毕 ¬P"
                    ],
                    source_dialogue_summary="源自关于芝诺悖论与康德纯粹理性二律背反的形式论证研讨。",
                    crystallized_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                )
                self.save_skill(skill)
                return skill

        return None

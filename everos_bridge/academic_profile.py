"""
EverOS Academic Profile Tracker
Maintains persistent student profiles: school of thought, preferred translation editions, and thesis focus.
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from config.settings import settings

class AcademicProfile(BaseModel):
    user_id: str = "default_scholar"
    student_name: str = "研讨学者 (Scholar)"
    school_of_thought: str = Field(
        default="欧陆现象学与诠释学 (Continental Phenomenology & Hermeneutics)",
        description="Core philosophical tradition (Phenomenology, Analytic, Classical Hermeneutics, Buddhist Yogacara)"
    )
    translation_alignments: Dict[str, str] = Field(
        default_factory=lambda: {
            "康德 (Kant)": "邓晓芒译本 (人民出版社, 强调先验/超验对勘与逻辑奠基)",
            "海德格尔 (Heidegger)": "陈嘉映/王庆节译本 (三联书店, 严格区分此在 Dasein 与现成存在 Vorhandenheit)",
            "胡塞尔 (Husserl)": "倪梁康译本 (商务印书馆, 现象学还原与纯粹意向性充实)",
            "维特根斯坦 (Wittgenstein)": "韩林合译本 (商务印书馆, 命题图式与语言游戏)"
        },
        description="Authorized Chinese translation editions and terminological conventions"
    )
    current_thesis_topic: str = Field(
        default="海德格尔时间性（Zeitlichkeit）与斯宾诺莎实体（Substantia）的本体论对话",
        description="Active dissertation, thesis, or semester research topic"
    )
    concept_anchors: Dict[str, str] = Field(
        default_factory=lambda: {
            "Transcendental": "严格译为【先验】（使经验成为可能的形式条件），拒绝译为【先天的】（A priori）混淆",
            "Dasein": "统一使用【此在】并标注德文原词，严禁降解为心理学主体或经验人",
            "Ousia": "希腊语 Οὐσία 辨析：第一本体（个别存在）与第二本体（种与属）",
            "Aufhebung": "黑格尔辩证法核心术语【扬弃】：同时包含否定、保存与提升三重张力"
        },
        description="Customized strict philosophical terminological bindings"
    )
    last_updated: str = "2026-09-10T00:00:00Z"

class AcademicProfileManager:
    """Manages profile loading, updating, and EverOS contextual injection."""

    def __init__(self, profiles_dir: Optional[Path] = None):
        self.profiles_dir = profiles_dir or settings.profiles_dir
        self.profiles_dir.mkdir(parents=True, exist_ok=True)
        self.active_profile = self.load_profile("default_scholar")

    def load_profile(self, user_id: str) -> AcademicProfile:
        filepath = self.profiles_dir / f"{user_id}.json"
        if filepath.exists():
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return AcademicProfile(**data)
            except Exception:
                pass
        
        # Create and save default profile
        default_profile = AcademicProfile(user_id=user_id)
        self.save_profile(default_profile)
        return default_profile

    def save_profile(self, profile: AcademicProfile):
        filepath = self.profiles_dir / f"{profile.user_id}.json"
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(profile.model_dump(), f, ensure_ascii=False, indent=2)
        self.active_profile = profile

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> AcademicProfile:
        profile = self.load_profile(user_id)
        for k, v in updates.items():
            if hasattr(profile, k):
                setattr(profile, k, v)
        self.save_profile(profile)
        return profile

    def generate_prompt_injection(self, profile: Optional[AcademicProfile] = None) -> str:
        p = profile or self.active_profile
        alignments_str = "\n".join([f"  - {author}: {edition}" for author, edition in p.translation_alignments.items()])
        anchors_str = "\n".join([f"  - {term}: {meaning}" for term, meaning in p.concept_anchors.items()])

        return (
            f"【EverOS 个人学术画像与流派锚定 (User Academic Profile)】\n"
            f"- 研讨学者: {p.student_name} (ID: {p.user_id})\n"
            f"- 专攻哲学流派: {p.school_of_thought}\n"
            f"- 当前研究课题/毕业论文: {p.current_thesis_topic}\n"
            f"- 偏好中译本与学术规范:\n{alignments_str}\n"
            f"- 核心概念锚定约定:\n{anchors_str}\n"
            f"※ 强制学术约束：在所有论辩中，必须严格贯彻以上中译本学术定名与概念范畴，严禁产生概念漂移。\n"
        )

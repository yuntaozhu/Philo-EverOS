"""
EverOS Core Memory Engine
Orchestrates Hippocampal Long-term Memory, Collective Consensus Graph, and Skill Crystallizer.
"""

from typing import Dict, Any, Optional
from .academic_profile import AcademicProfileManager
from .consensus_graph import ConsensusGraph
from .skill_crystallizer import SkillCrystallizer
from .sidecar_client import get_everos_sidecar

class EverOSMemoryEngine:
    """Unified bridge to EverOS evolutionary memory mechanisms."""

    def __init__(self):
        self.profile_manager = AcademicProfileManager()
        self.consensus_graph = ConsensusGraph()
        self.crystallizer = SkillCrystallizer()

    def build_context_injection(self, query: str, user_id: str = "default_scholar") -> str:
        """
        Synthesizes active academic profile and retrieved collective consensus facts
        into a coherent prompt preamble.
        """
        profile = self.profile_manager.load_profile(user_id)
        profile_part = self.profile_manager.generate_prompt_injection(profile)
        consensus_part = self.consensus_graph.generate_prompt_injection(query)

        crystallized_skills = self.crystallizer.crystallized_skills
        skills_summary = ""
        if crystallized_skills:
            skill_list = "\n".join([
                f"  - `{s.command_alias}` ({s.name}): {s.description}"
                for s in crystallized_skills.values()
            ])
            skills_summary = (
                f"【EverOS 已结晶自进化技能库 (Crystallized Skills Pool)】\n"
                f"{skill_list}\n"
            )

        return f"{profile_part}\n{consensus_part}\n{skills_summary}".strip()

    def post_interaction_update(
        self,
        user_message: str,
        assistant_response: str,
        user_id: str = "default_scholar"
    ) -> Dict[str, Any]:
        """
        Asynchronous feedback hook triggered after generation completes.
        Evaluates potential skill crystallization and concept reinforcement.
        """
        new_skill = self.crystallizer.analyze_dialogue_for_crystallization(
            user_message=user_message,
            assistant_response=assistant_response
        )

        sidecar = get_everos_sidecar()
        sidecar_status = "disabled"
        if sidecar.enabled:
            session_id = f"seminar-{user_id}"
            added = sidecar.add(
                session_id,
                [
                    {"role": "user", "content": user_message},
                    {"role": "assistant", "content": assistant_response},
                ],
                user_id=user_id,
                defer_extraction=True,
            )
            flushed = sidecar.flush(session_id)
            sidecar_status = "written" if added or flushed else "unreachable"

        return {
            "crystallized_new_skill": new_skill.skill_id if new_skill else None,
            "profile_user_id": user_id,
            "status": "memory_persisted",
            "everos_sidecar": sidecar_status,
        }

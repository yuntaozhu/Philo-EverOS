"""
Philo-EverOS Feedback Collector
Collects student corrections (SFT) and preference evaluations (DPO) for continuous philosophical alignment.
"""

import json
import time
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from config.settings import settings

class SFTCorrectionItem(BaseModel):
    id: str = Field(default_factory=lambda: f"sft-{uuid.uuid4().hex[:8]}")
    instruction: str
    original_output: str
    corrected_output: str
    student_notes: Optional[str] = None
    philosopher_target: Optional[str] = None
    timestamp: float = Field(default_factory=time.time)

class DPOPreferenceItem(BaseModel):
    id: str = Field(default_factory=lambda: f"dpo-{uuid.uuid4().hex[:8]}")
    prompt: str
    chosen: str
    rejected: str
    dimension: str = "形式有效性与词源精确度 (Validity & Etymological Precision)"
    critique: Optional[str] = None
    timestamp: float = Field(default_factory=time.time)

class FeedbackCollector:
    """Manages collection and persistent storage of academic student feedback."""

    def __init__(self, data_dir: Optional[Path] = None):
        self.training_dir = data_dir or settings.training_data_dir
        self.training_dir.mkdir(parents=True, exist_ok=True)
        self.sft_file = self.training_dir / "sft_corrections.json"
        self.dpo_file = self.training_dir / "dpo_preferences.json"

    def record_sft_correction(
        self,
        instruction: str,
        original_output: str,
        corrected_output: str,
        student_notes: Optional[str] = None,
        philosopher_target: Optional[str] = None
    ) -> SFTCorrectionItem:
        item = SFTCorrectionItem(
            instruction=instruction,
            original_output=original_output,
            corrected_output=corrected_output,
            student_notes=student_notes,
            philosopher_target=philosopher_target
        )
        self._append_json(self.sft_file, item.model_dump())
        return item

    def record_dpo_preference(
        self,
        prompt: str,
        chosen: str,
        rejected: str,
        dimension: str = "形式有效性与词源精确度",
        critique: Optional[str] = None
    ) -> DPOPreferenceItem:
        item = DPOPreferenceItem(
            prompt=prompt,
            chosen=chosen,
            rejected=rejected,
            dimension=dimension,
            critique=critique
        )
        self._append_json(self.dpo_file, item.model_dump())
        return item

    def get_all_sft(self) -> List[Dict[str, Any]]:
        return self._read_json(self.sft_file)

    def get_all_dpo(self) -> List[Dict[str, Any]]:
        return self._read_json(self.dpo_file)

    def _append_json(self, path: Path, data: Dict[str, Any]):
        items = self._read_json(path)
        items.append(data)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)

    def _read_json(self, path: Path) -> List[Dict[str, Any]]:
        if not path.exists():
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

"""
Philo-EverOS Training Dataset Exporter
Exports collected student corrections into Alpaca SFT format and DPO pairwise formats.
"""

import json
from pathlib import Path
from typing import Dict, Any, List
from .collector import FeedbackCollector
from config.settings import settings

class DatasetExporter:
    """Formats raw feedback into clean training artifacts."""

    def __init__(self, collector: FeedbackCollector):
        self.collector = collector
        self.output_dir = settings.training_data_dir

    def export_alpaca_sft(self, filename: str = "alpaca_sft_dataset.json") -> Path:
        """
        Exports SFT pairs into standard Alpaca format:
        [ {"instruction": "...", "input": "", "output": "..."} ]
        """
        raw_sft = self.collector.get_all_sft()
        alpaca_records: List[Dict[str, str]] = []

        for item in raw_sft:
            alpaca_records.append({
                "instruction": item["instruction"],
                "input": f"[原稿草拟]: {item['original_output'][:300]}..." if item.get("original_output") else "",
                "output": item["corrected_output"],
                "system": "你是一位精通西方哲学史与严谨分析哲学的资深哲学教授。请以最高学术标准给出推论与考订。"
            })

        target_path = self.output_dir / filename
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(alpaca_records, f, ensure_ascii=False, indent=2)

        return target_path

    def export_dpo_pairs(self, filename: str = "dpo_preference_dataset.json") -> Path:
        """
        Exports preference pairs into standard DPO format:
        [ {"prompt": "...", "chosen": "...", "rejected": "..."} ]
        """
        raw_dpo = self.collector.get_all_dpo()
        dpo_records: List[Dict[str, Any]] = []

        for item in raw_dpo:
            dpo_records.append({
                "prompt": item["prompt"],
                "chosen": item["chosen"],
                "rejected": item["rejected"],
                "dimension": item.get("dimension", "Validity & Rigor")
            })

        target_path = self.output_dir / filename
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(dpo_records, f, ensure_ascii=False, indent=2)

        return target_path

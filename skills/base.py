"""
Philo-EverOS Skill Base Class
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseSkill(ABC):
    """Abstract base class for all built-in and crystallized philosophical skills."""

    @property
    @abstractmethod
    def skill_id(self) -> str:
        pass

    @property
    @abstractmethod
    def command_prefix(self) -> str:
        """Command trigger, e.g., /deconstruct, /socratic, /etymology, /compare."""
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        pass

    def match(self, query: str) -> bool:
        """Check whether user query triggers this skill."""
        q = query.strip()
        return q.startswith(self.command_prefix) or f" {self.command_prefix}" in q

    @abstractmethod
    def get_prompt_instruction(self, query: str) -> str:
        """Return specialized methodological system prompt addition."""
        pass

    def clean_query(self, query: str) -> str:
        """Strip command prefix from query to isolate pure proposition."""
        return query.replace(self.command_prefix, "").strip()

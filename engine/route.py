"""Request routing: local HF / remote OpenAI-compatible / explicit cloud."""

from __future__ import annotations

from typing import Optional


def resolve_inference_backend(
    model: Optional[str],
    last_user_prompt: str,
    *,
    doubao_configured: bool,
) -> str:
    """Return doubao | gemini | local.

    Doubao is used only when the client names it, or when /etymology is
    issued and an Ark key is present. Gemini is explicit-model only.
    """
    choice = (model or "").lower()
    if "doubao" in choice:
        return "doubao"
    prompt = (last_user_prompt or "").lstrip()
    if prompt.startswith("/etymology") and doubao_configured:
        return "doubao"
    if "gemini" in choice:
        return "gemini"
    return "local"


def remote_model_override(model: Optional[str], fallback: str) -> str:
    """Strip seminar aliases so Ollama/llama.cpp get a real model id."""
    if not model:
        return fallback
    alias = model.strip()
    lowered = alias.lower()
    if lowered in {
        "philo-everos-dual5090",
        "philo-everos-5090",
        "philo-everos",
        "hybrid-moe",
    }:
        return fallback
    return alias

"""
Per-model prompt adapters.

Fireball-12B ships without tokenizer.chat_template and was trained on Alpaca
markers. Blind apply_chat_template() raises; a Mistral [INST] wrapper makes the
model echo the user turn and leak "### Instruction:". Route each family through
its own formatter and stop strings.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List, Literal, Optional

PromptFormat = Literal["alpaca", "chatml", "gemma", "raw_template"]

SUPPORTED_FORMATS: tuple[str, ...] = ("alpaca", "chatml", "gemma", "raw_template")

DEFAULT_SYSTEM_PROMPT = (
    "You are an expert in academic philosophy, formal logic, and continental thought."
)

_ALPACA_STOP = ("### Instruction:", "### Response:")
_CHATML_STOP = ("<|im_end|>", "<|im_start|>")
_GEMMA_STOP = ("<end_of_turn>", "<start_of_turn>")


@dataclass(frozen=True)
class PromptAdapter:
    format_name: PromptFormat
    stop_strings: tuple[str, ...] = field(default_factory=tuple)
    default_system: str = DEFAULT_SYSTEM_PROMPT

    def format_messages(
        self,
        messages: Iterable[Dict[str, Any]],
        tokenizer: Any = None,
    ) -> str:
        normalized = _normalize_messages(messages)
        if self.format_name == "alpaca":
            return _format_alpaca(normalized, self.default_system)
        if self.format_name == "chatml":
            return _format_chatml(normalized, self.default_system)
        if self.format_name == "gemma":
            return _format_gemma(normalized, self.default_system)
        return _format_raw_template(normalized, tokenizer)

    def strip_stop_echo(self, text: str) -> str:
        """Drop leaked instruction markers from a finished completion."""
        cleaned = text
        for marker in self.stop_strings:
            if marker and marker in cleaned:
                cleaned = cleaned.split(marker, 1)[0]
        return cleaned.strip()


def infer_prompt_format(
    model_id: str = "",
    model_path: str = "",
    explicit: Optional[str] = None,
    tokenizer: Any = None,
) -> PromptFormat:
    """
    Resolve formatter. Order: PROMPT_FORMAT env / explicit → path keywords →
    tokenizer.chat_template → chatml (Qwen-safe default).
    """
    if explicit and explicit.lower() not in ("", "auto"):
        candidate = explicit.lower().strip()
        if candidate not in SUPPORTED_FORMATS:
            raise ValueError(
                f"Unknown PROMPT_FORMAT={explicit!r}. "
                f"Use one of: {', '.join(SUPPORTED_FORMATS)}, or auto."
            )
        return candidate  # type: ignore[return-value]

    blob = f"{model_id} {model_path}".lower()

    if "fireball" in blob:
        return "alpaca"
    if any(k in blob for k in ("qwen", "brie", "phil")):
        return "chatml"
    if any(k in blob for k in ("veritas", "semancer", "gemma")):
        return "gemma"
    if tokenizer is not None and getattr(tokenizer, "chat_template", None):
        return "raw_template"
    return "chatml"


def get_adapter(
    format_name: Optional[str] = None,
    model_id: str = "",
    model_path: str = "",
    tokenizer: Any = None,
) -> PromptAdapter:
    resolved = infer_prompt_format(
        model_id=model_id,
        model_path=model_path,
        explicit=format_name,
        tokenizer=tokenizer,
    )
    stops = {
        "alpaca": _ALPACA_STOP,
        "chatml": _CHATML_STOP,
        "gemma": _GEMMA_STOP,
        "raw_template": tuple(),
    }[resolved]
    return PromptAdapter(format_name=resolved, stop_strings=stops)


def _normalize_messages(messages: Iterable[Dict[str, Any]]) -> List[Dict[str, str]]:
    out: List[Dict[str, str]] = []
    for raw in messages:
        role = str(raw.get("role") or "user").strip().lower()
        if role == "model":
            role = "assistant"
        content = raw.get("content")
        if content is None:
            continue
        if not isinstance(content, str):
            content = str(content)
        out.append({"role": role, "content": content})
    return out


def _split_system(messages: List[Dict[str, str]], default_system: str) -> tuple[str, List[Dict[str, str]]]:
    system_parts: List[str] = []
    rest: List[Dict[str, str]] = []
    for msg in messages:
        if msg["role"] == "system":
            if msg["content"].strip():
                system_parts.append(msg["content"].strip())
        else:
            rest.append(msg)
    system = "\n\n".join(system_parts) if system_parts else default_system
    return system, rest


def _format_alpaca(messages: List[Dict[str, str]], default_system: str) -> str:
    """Fireball / EpistemeAI philosophers: Instruction–Response, never [INST]."""
    system, rest = _split_system(messages, default_system)
    parts = [system.strip(), ""]
    for msg in rest:
        if msg["role"] == "user":
            parts.append(f"### Instruction:\n{msg['content'].strip()}")
        elif msg["role"] == "assistant":
            parts.append(f"### Response:\n{msg['content'].strip()}")
        else:
            parts.append(f"### Instruction:\n{msg['content'].strip()}")
    parts.append("### Response:\n")
    return "\n\n".join(p for p in parts if p is not None).replace("\n\n\n\n", "\n\n")


def _format_chatml(messages: List[Dict[str, str]], default_system: str) -> str:
    """Qwen2.5 / brie-v2 ChatML."""
    system, rest = _split_system(messages, default_system)
    chunks = [f"<|im_start|>system\n{system}<|im_end|>"]
    for msg in rest:
        role = msg["role"] if msg["role"] in ("user", "assistant") else "user"
        chunks.append(f"<|im_start|>{role}\n{msg['content']}<|im_end|>")
    chunks.append("<|im_start|>assistant\n")
    return "\n".join(chunks)


def _format_gemma(messages: List[Dict[str, str]], default_system: str) -> str:
    """Gemma 2/3 / Veritas / Semancer turn markers. System is folded into first user turn."""
    system, rest = _split_system(messages, default_system)
    if not rest:
        rest = [{"role": "user", "content": ""}]
    lines = ["<bos>"]
    first_user = True
    for msg in rest:
        if msg["role"] == "assistant":
            lines.append(f"<start_of_turn>model\n{msg['content'].strip()}<end_of_turn>")
            continue
        body = msg["content"].strip()
        if first_user and system:
            body = f"{system.strip()}\n\n{body}".strip()
            first_user = False
        lines.append(f"<start_of_turn>user\n{body}<end_of_turn>")
    lines.append("<start_of_turn>model\n")
    return "\n".join(lines)


def _format_raw_template(messages: List[Dict[str, str]], tokenizer: Any) -> str:
    if tokenizer is None:
        raise ValueError(
            "raw_template requires a tokenizer with chat_template. "
            "Set PROMPT_FORMAT=alpaca|chatml|gemma or pass a loaded tokenizer."
        )
    template = getattr(tokenizer, "chat_template", None)
    if not template:
        raise ValueError(
            "tokenizer.chat_template is not set. "
            "Do not call apply_chat_template on Fireball-class weights; "
            "use PROMPT_FORMAT=alpaca (Fireball), chatml (Qwen/brie), or gemma (Veritas)."
        )
    return tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

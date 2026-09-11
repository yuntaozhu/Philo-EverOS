"""Adapter unit tests — no GPU required."""

from engine.prompt_adapters import get_adapter, infer_prompt_format
from engine.streamer import filter_stop_stream


def test_fireball_is_alpaca_never_inst():
    fmt = infer_prompt_format(model_id="Fireball-12B-philosophers", model_path=r"C:\philo_env\philosophy_models\Fireball-12B")
    assert fmt == "alpaca"
    adapter = get_adapter(model_id="Fireball-12B-philosophers")
    text = adapter.format_messages([
        {"role": "system", "content": "Be rigorous."},
        {"role": "user", "content": "Define Geworfenheit."},
        {"role": "assistant", "content": "Thrownness is existential."},
        {"role": "user", "content": "Explain further."},
    ])
    assert "[INST]" not in text
    assert "### Instruction:\nDefine Geworfenheit." in text
    assert text.rstrip().endswith("### Response:")
    leaked = adapter.strip_stop_echo("A short reply.\n\n### Instruction:\nDefine Geworfenheit.")
    assert "### Instruction:" not in leaked
    assert leaked.startswith("A short reply.")


def test_qwen_brie_chatml():
    assert infer_prompt_format(model_id="brie-v2-3b") == "chatml"
    assert infer_prompt_format(model_path="Qwen2.5-7B-Instruct") == "chatml"
    adapter = get_adapter(model_id="brie-v2-3b")
    text = adapter.format_messages([{"role": "user", "content": "/deconstruct Cogito"}])
    assert text.startswith("<|im_start|>system")
    assert "<|im_start|>user\n/deconstruct Cogito<|im_end|>" in text
    assert text.endswith("<|im_start|>assistant\n")


def test_veritas_gemma_and_explicit_override():
    assert infer_prompt_format(model_id="Veritas-12B") == "gemma"
    assert infer_prompt_format(model_id="Semancer-12B") == "gemma"
    adapter = get_adapter(format_name="gemma", model_id="Veritas-12B")
    text = adapter.format_messages([
        {"role": "system", "content": "Seminar rules."},
        {"role": "user", "content": "What is Dasein?"},
    ])
    assert "<start_of_turn>user" in text
    assert "Seminar rules." in text
    assert text.endswith("<start_of_turn>model\n")
    assert infer_prompt_format(model_id="Fireball-12B", explicit="chatml") == "chatml"


def test_stop_stream_cuts_instruction_echo():
    pieces = ["Thrownness is", " existential.", "\n\n### Inst", "ruction:\nDefine"]
    collected = []
    ended = []
    filter_stop_stream(pieces, ["### Instruction:"], collected.append, lambda: ended.append(True))
    assert "".join(collected) == "Thrownness is existential.\n\n"
    assert ended == [True]


def test_raw_template_requires_chat_template():
    adapter = get_adapter(format_name="raw_template")
    try:
        adapter.format_messages([{"role": "user", "content": "hi"}])
        raise AssertionError("expected ValueError")
    except ValueError as exc:
        assert "chat_template" in str(exc)


if __name__ == "__main__":
    test_fireball_is_alpaca_never_inst()
    test_qwen_brie_chatml()
    test_veritas_gemma_and_explicit_override()
    test_raw_template_requires_chat_template()
    test_stop_stream_cuts_instruction_echo()
    print("prompt_adapters ok")

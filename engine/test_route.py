"""Routing tests — no GPU required."""

from engine.route import remote_model_override, resolve_inference_backend


def test_etymology_uses_doubao_only_with_key():
    assert resolve_inference_backend("brie-v2-3b", "/etymology Dasein", doubao_configured=True) == "doubao"
    assert resolve_inference_backend("brie-v2-3b", "/etymology Dasein", doubao_configured=False) == "local"
    assert resolve_inference_backend("brie-v2-3b", "/deconstruct 我思", doubao_configured=True) == "local"


def test_explicit_cloud_models():
    assert resolve_inference_backend("doubao-pro", "hello", doubao_configured=False) == "doubao"
    assert resolve_inference_backend("gemini-2.5-flash", "hello", doubao_configured=True) == "gemini"


def test_remote_alias_stripped():
    assert remote_model_override("Philo-EverOS-Dual5090", "qwen2.5:7b") == "qwen2.5:7b"
    assert remote_model_override("qwen2.5:7b", "brie-v2-3b") == "qwen2.5:7b"


if __name__ == "__main__":
    test_etymology_uses_doubao_only_with_key()
    test_explicit_cloud_models()
    test_remote_alias_stripped()
    print("route ok")

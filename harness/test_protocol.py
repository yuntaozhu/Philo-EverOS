"""Protocol lock tests — no GPU / Qdrant / EverOS required."""

from harness.guardrails import AcademicGuardrails
from harness.protocol import (
    detect_claim_type,
    protocol_instruction,
    strip_claim_prefix,
)


def test_explicit_and_prefix():
    assert detect_claim_type("anything", explicit="soc") == "soc"
    assert detect_claim_type("/claim hybrid 意向性如何做成量表") == "hybrid"
    assert strip_claim_prefix("/claim phil /deconstruct Cogito") == "/deconstruct Cogito"


def test_markers():
    assert detect_claim_type("/deconstruct 我思故我在") == "phil"
    assert detect_claim_type("本问卷的自变量与样本量 n=400") == "soc"
    assert detect_claim_type("/deconstruct 意向性 并设计问卷操作化") == "hybrid"


def test_hybrid_requires_information_loss():
    text = protocol_instruction("hybrid")
    assert "Information Loss" in text
    assert "信息损耗" in text
    assert "Information Loss" not in protocol_instruction("phil")
    missing = AcademicGuardrails.audit_response("形式有效，但未写损耗。", claim_type="hybrid")
    assert missing["is_valid"] is False
    present = AcademicGuardrails.audit_response(
        "分栏之后。【信息损耗 (Information Loss)】：量表丢掉了意向充实。\n\n**若指标无法回指充实，命题是否已不可判定？**",
        claim_type="hybrid",
    )
    assert all("信息损耗" not in i for i in present["issues"])


if __name__ == "__main__":
    test_explicit_and_prefix()
    test_markers()
    test_hybrid_requires_information_loss()
    print("protocol ok")

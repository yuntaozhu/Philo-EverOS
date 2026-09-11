"""Sidecar payload tests — no running EverOS required."""

from everos_bridge.sidecar_client import build_add_payload, format_search_hits


def test_add_payload_skips_system_and_empty():
    payload = build_add_payload(
        "sess-1",
        [
            {"role": "system", "content": "ignore"},
            {"role": "user", "content": "What is Dasein?"},
            {"role": "assistant", "content": "  "},
            {"role": "assistant", "content": "Existenz, not a soul."},
        ],
        user_id="scholar",
        app_id="philo-everos",
        project_id="seminar",
    )
    assert payload["session_id"] == "sess-1"
    assert payload["defer_extraction"] is True
    assert [m["role"] for m in payload["messages"]] == ["user", "assistant"]
    assert all(m["sender_id"] == "scholar" for m in payload["messages"])
    assert all(isinstance(m["timestamp"], int) for m in payload["messages"])


def test_format_search_hits():
    text = format_search_hits({
        "episodes": [
            {"summary": "Seminar on Geworfenheit", "atomic_facts": [{"content": "Thrownness is existential."}]}
        ]
    })
    assert "EverOS sidecar" in text
    assert "Geworfenheit" in text
    assert format_search_hits({}) == ""


if __name__ == "__main__":
    test_add_payload_skips_system_and_empty()
    test_format_search_hits()
    print("sidecar ok")

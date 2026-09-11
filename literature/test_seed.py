"""Local literature seed tests — no Qdrant / Doubao required."""

from literature.seed_canons import seed_documents
from literature.store import LiteratureStore, score_local_hit


def test_seed_has_seminar_anchors():
    docs = seed_documents()
    ids = {d["id"] for d in docs}
    assert "canon-kant-krw-b25" in ids
    assert "canon-spinoza-ethica-def3" in ids
    assert "canon-aristotle-cat-2a11" in ids
    assert "canon-heidegger-sz-9" in ids
    for doc in docs:
        assert "locator" in doc["text"].lower() or doc["locator"]
        assert doc["kind"] == "primary"


def test_local_score_prefers_dasein():
    docs = seed_documents()
    ranked = sorted(docs, key=lambda d: score_local_hit("Dasein 此在", d), reverse=True)
    assert ranked[0]["id"] == "canon-heidegger-sz-9"


def test_store_local_roundtrip(tmp_path, monkeypatch=None):
    store = LiteratureStore()
    store.index_path = tmp_path / "local_index.json"
    store.ingest([seed_documents()[0]])
    hits = store._search_local("Transzendental 先验", top_k=1)
    assert hits
    assert "B25" in hits[0]["title"]


if __name__ == "__main__":
    from pathlib import Path
    import tempfile

    test_seed_has_seminar_anchors()
    test_local_score_prefers_dasein()
    with tempfile.TemporaryDirectory() as folder:
        store = LiteratureStore()
        store.index_path = Path(folder) / "local_index.json"
        store.ingest(seed_documents()[:3])
        hits = store.search("/deconstruct 先验 Transzendental", top_k=2)
        assert hits
        assert any("B25" in (h.get("title") or "") or "B131" in (h.get("title") or "") for h in hits)
    print("literature seed ok")

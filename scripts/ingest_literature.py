"""Load the seminar seed canons into the local index, and into Qdrant when ready."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from literature.seed_canons import seed_documents
from literature.store import LiteratureStore


def main() -> int:
    documents = seed_documents()
    store = LiteratureStore()
    result = store.ingest(documents)
    snapshot = ROOT / "data" / "literature" / "seed_canons.json"
    snapshot.parent.mkdir(parents=True, exist_ok=True)
    snapshot.write_text(
        json.dumps({"documents": documents, "count": len(documents)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print(f"seed snapshot: {snapshot}")
    sample = store.search("Dasein 此在", top_k=2)
    print("sample search Dasein:", [hit.get("title") for hit in sample])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

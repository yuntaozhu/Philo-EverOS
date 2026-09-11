# Regression prompts

Use these after a format or routing change. Open WebUI → `http://127.0.0.1:8000/v1`.

## Fireball (English, Alpaca, 5090 only)

Model: `Fireball-12B-philosophers`  
Env: `PROMPT_FORMAT=alpaca`  
Do **not** also run Ollama 32B on the same card.

1. Spinoza: `State Ethics I, Definition 3 (substance) and Proposition 14. Why does this collapse Descartes' two finite substances? Cite the geometric order; do not moralize.`
2. Heidegger: `Explain Geworfenheit in Sein und Zeit §29 without reducing Dasein to a psychological subject. Contrast Vorhandenheit.`

Pass if: no `[INST]` leak, no `### Instruction:` echo, English academic register, multi-turn does not reprint the template.

## Qwen (Chinese default)

Model: `qwen2.5:7b` or `brie-v2-3b`  
Env: `PROMPT_FORMAT=chatml` and, on 5060, `LOCAL_LLM_BASE_URL=http://127.0.0.1:11434/v1`

1. `/deconstruct 我思故我在`
2. `/etymology Dasein` — routes to Doubao only when `ARK_API_KEY` is set; otherwise stays on Qwen.

Pass if: Chinese is not a shallow Fireball-style gloss; `/deconstruct` keeps the four-column scaffold from the harness; no canned Kant essay when the backend is offline (502 instead).

## Literature retrieval

After `python scripts/ingest_literature.py`, `/etymology Ousia` and `/deconstruct 我思` should inject the matching seed excerpt (Categories 2a11, Meditationes II). If Qdrant + `ARK_API_KEY` are set, the same script writes vectors; otherwise the local index is used.

## Hybrid protocol

`/claim hybrid 将意向性做成李克特量表时丢掉了什么？`

Pass if the reply has a dedicated **信息损耗 / Information Loss** section and does not treat the scale score as proof of the phenomenological claim.

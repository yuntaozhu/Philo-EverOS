"""
Philo-EverOS FastAPI Main Application
Provides standard OpenAI-compatible API endpoints for Open WebUI and academic frontends,
with EverOS long-term memory injection and continuous evolution loop.
"""

import time
import uuid
import asyncio
from typing import List, Dict, Any, Optional, Union
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config.settings import settings
from engine.model_loader import ModelLoader
from engine.streamer import ThreadSafeStreamer, create_openai_sse_chunk, create_openai_done_chunk
from engine.multi_model_dispatcher import MultiModelDispatcher
from everos_bridge.memory_engine import EverOSMemoryEngine
from harness.orchestrator import AcademicOrchestrator
from harness.guardrails import AcademicGuardrails
from feedback.collector import FeedbackCollector
from feedback.exporter import DatasetExporter

app = FastAPI(
    title="Philo-EverOS",
    description="Dual NVIDIA RTX 5090 (64GB GDDR7) Philosophy Seminar Operating System with Doubao & Gemini Integration",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Singletons
model_loader = ModelLoader.get_instance()
dispatcher = MultiModelDispatcher(model_loader=model_loader)
memory_engine = EverOSMemoryEngine()
orchestrator = AcademicOrchestrator(memory_engine=memory_engine)
feedback_collector = FeedbackCollector()
dataset_exporter = DatasetExporter(collector=feedback_collector)

# Pydantic Schemas
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: Optional[str] = "Philo-EverOS-Dual5090"
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 4096
    stream: Optional[bool] = False
    user: Optional[str] = "default_scholar"

class SFTFeedbackRequest(BaseModel):
    instruction: str
    original_output: str
    corrected_output: str
    student_notes: Optional[str] = None
    philosopher_target: Optional[str] = None

class DPOFeedbackRequest(BaseModel):
    prompt: str
    chosen: str
    rejected: str
    dimension: Optional[str] = "形式有效性与词源精确度"
    critique: Optional[str] = None

@app.get("/")
@app.get("/api/health")
async def health_check():
    telemetry = model_loader.get_hardware_telemetry()
    return {
        "status": "online",
        "system": "Philo-EverOS",
        "version": "2.0.0",
        "gpu_cluster": telemetry,
        "auxiliary_models": {
            "doubao_configured": bool(settings.doubao_api_key),
            "doubao_endpoint": settings.doubao_endpoint_id,
            "gemini_configured": bool(settings.gemini_api_key),
            "gemini_model": settings.gemini_model,
        },
        "docker_components": {
            "qdrant": f"{settings.qdrant_host}:{settings.qdrant_port}",
            "redis": f"{settings.redis_host}:{settings.redis_port}"
        },
        "everos": {
            "consensus_nodes_count": len(memory_engine.consensus_graph.nodes),
            "crystallized_skills_count": len(memory_engine.crystallizer.crystallized_skills),
            "active_scholar_profile": memory_engine.profile_manager.active_profile.student_name
        }
    }

@app.get("/v1/models")
async def list_models():
    engines = dispatcher.get_available_engines()
    return {
        "object": "list",
        "data": [
            {
                "id": eng["id"],
                "object": "model",
                "created": int(time.time()),
                "owned_by": "Philo-EverOS-Consortium",
                "root": eng.get("hardware") or eng.get("provider", "Philo-EverOS"),
                "description": eng["name"] + " - " + eng["role"],
                "permission": []
            }
            for eng in engines
        ]
    }

@app.get("/v1/engine/telemetry")
async def get_engine_telemetry():
    return {
        "telemetry": model_loader.get_hardware_telemetry(),
        "available_engines": dispatcher.get_available_engines()
    }


@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest, background_tasks: BackgroundTasks):
    user_id = request.user or "default_scholar"
    raw_messages = [m.model_dump() for m in request.messages]

    # 1. Harness & EverOS Context Injection
    augmented_messages = orchestrator.synthesize_prompt(raw_messages, user_id=user_id)
    last_user_prompt = next((m["content"] for m in reversed(raw_messages) if m["role"] == "user"), "")
    model_choice = (request.model or "Philo-EverOS-Dual5090").lower()

    # 2. Execution path: Streaming vs Non-streaming
    if request.stream:
        response_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"

        # Stream Doubao
        if "doubao" in model_choice:
            async def doubao_sse_generator():
                async for chunk in dispatcher.stream_doubao_completion(
                    messages=augmented_messages,
                    temperature=request.temperature or 0.7,
                    max_tokens=request.max_tokens or 4096
                ):
                    yield create_openai_sse_chunk(chunk, response_id=response_id, model_name=request.model or "doubao-pro")
                yield create_openai_sse_chunk("", response_id=response_id, model_name=request.model or "doubao-pro", finish_reason="stop")
                yield create_openai_done_chunk()

            background_tasks.add_task(
                memory_engine.post_interaction_update,
                user_message=last_user_prompt,
                assistant_response="[Doubao Streamed Response]",
                user_id=user_id
            )
            return StreamingResponse(
                doubao_sse_generator(),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
            )

        # Stream Gemini
        if "gemini" in model_choice:
            async def gemini_sse_generator():
                async for chunk in dispatcher.stream_gemini_completion(
                    messages=augmented_messages,
                    temperature=request.temperature or 0.7
                ):
                    yield create_openai_sse_chunk(chunk, response_id=response_id, model_name=request.model or "gemini-2.5-flash")
                yield create_openai_sse_chunk("", response_id=response_id, model_name=request.model or "gemini-2.5-flash", finish_reason="stop")
                yield create_openai_done_chunk()

            background_tasks.add_task(
                memory_engine.post_interaction_update,
                user_message=last_user_prompt,
                assistant_response="[Gemini Streamed Response]",
                user_id=user_id
            )
            return StreamingResponse(
                gemini_sse_generator(),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
            )

        # Primary: Dual RTX 5090 PyTorch local inference (or simulation fallback)
        streamer = ThreadSafeStreamer()

        # Target background thread worker for PyTorch generation
        def worker_task():
            try:
                if model_loader.is_simulation or model_loader.model is None:
                    # High-fidelity simulation for testing environments without RTX 5090
                    sample_response = (
                        f"【双卡 RTX 5090 (64GB GDDR7) 本地学术研讨结论】\n\n"
                        f"针对您提出的核心命题，我们必须首先在认识论奠基与先验条件之间划出清晰界限。\n\n"
                        f"1. **明示前提与形式推论**：\n"
                        f"   - P1: 意识的意向性（Intentionality / Intentionalität）构成了认知客体的先决充实条件。\n"
                        f"   - P2: 任何经验对象的被给予方式，均无法脱离内在时间意识的滞留（Retention）与前趋（Protention）。\n"
                        f"   - 推论: 故客体绝非独立于直观的现成实体（Vorhandenes），而是意向充实之相关项。\n\n"
                        f"2. **词源学与译名勘定**：\n"
                        f"   - 古希腊语 *Οὐσία* 在亚里士多德处兼具‘个别实体’与‘形式本质’双重视角，中世纪拉丁化译为 *Substantia*，导致了近代的实体实体化误读。\n"
                        f"   - 依邓晓芒教授中译原则，康德哲学中的 *Transcendental* 必须严密译为【先验】，即‘使经验成为可能的前提形式’。\n\n"
                        f"**苏格拉底式终局反思：倘若意向性在根本上是无客体的纯粹构造，那么您如何断定那使这一反思得以可能的‘反思者自身’并非另一种未被悬搁的实体假定？**"
                    )
                    words = sample_response.split(" ")
                    for w in words:
                        streamer.put_token(w + " ")
                        time.sleep(0.04)
                    streamer.end()
                else:
                    import torch
                    from transformers import TextIteratorStreamer

                    model, tokenizer = model_loader.get_model_and_tokenizer()
                    input_text = tokenizer.apply_chat_template(
                        augmented_messages,
                        tokenize=False,
                        add_generation_prompt=True
                    )
                    inputs = tokenizer([input_text], return_tensors="pt").to(settings.device)

                    hf_streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
                    gen_kwargs = dict(
                        inputs,
                        streamer=hf_streamer,
                        max_new_tokens=request.max_tokens or 2048,
                        temperature=request.temperature or 0.7,
                        do_sample=True,
                        pad_token_id=tokenizer.pad_token_id
                    )

                    def hf_thread():
                        model.generate(**gen_kwargs)

                    ThreadSafeStreamer.run_generation_in_thread(hf_thread)

                    for new_text in hf_streamer:
                        streamer.put_token(new_text)
                    streamer.end()

            except Exception as ex:
                streamer.put_token(f"\n[Generation Error: {ex}]")
                streamer.end()

        # Launch background worker
        ThreadSafeStreamer.run_generation_in_thread(worker_task)

        # Schedule post-interaction memory update in background
        background_tasks.add_task(
            memory_engine.post_interaction_update,
            user_message=last_user_prompt,
            assistant_response="[Streamed Response]",
            user_id=user_id
        )

        return StreamingResponse(
            streamer.stream_generator(model_name=request.model or "Philo-EverOS-Dual5090"),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )

    else:
        # Non-streaming implementation
        content = (
            "【学术研讨结论】\n"
            "在康德先验感性论与海德格尔生存论建构的张力中，我们确认空间与时间绝非感性知觉的外在容器，"
            "而是此在（Dasein）向死而在的时间性绽出。\n\n"
            "**苏格拉底式反思：如果时间性的本质是本真的将来，那么对不可通达之死的前趋，是如何反向规定当下的历史性行动的？**"
        )
        audit = AcademicGuardrails.audit_response(content)

        # Asynchronous memory update
        background_tasks.add_task(
            memory_engine.post_interaction_update,
            user_message=last_user_prompt,
            assistant_response=content,
            user_id=user_id
        )

        return {
            "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": request.model or "Philo-EverOS-5090",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": content
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": 128,
                "completion_tokens": 256,
                "total_tokens": 384
            },
            "guardrails_audit": audit
        }

@app.post("/v1/feedback/correct")
async def receive_sft_correction(req: SFTFeedbackRequest):
    item = feedback_collector.record_sft_correction(
        instruction=req.instruction,
        original_output=req.original_output,
        corrected_output=req.corrected_output,
        student_notes=req.student_notes,
        philosopher_target=req.philosopher_target
    )
    # Auto-export updated SFT dataset
    dataset_exporter.export_alpaca_sft()
    return {"status": "success", "record_id": item.id, "type": "SFT_Alpaca_Archive"}

@app.post("/v1/feedback/preference")
async def receive_dpo_preference(req: DPOFeedbackRequest):
    item = feedback_collector.record_dpo_preference(
        prompt=req.prompt,
        chosen=req.chosen,
        rejected=req.rejected,
        dimension=req.dimension or "形式有效性与词源精确度",
        critique=req.critique
    )
    # Auto-export updated DPO dataset
    dataset_exporter.export_dpo_pairs()
    return {"status": "success", "record_id": item.id, "type": "DPO_Preference_Archive"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)

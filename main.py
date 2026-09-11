"""
Philo-EverOS FastAPI Main Application
Provides standard OpenAI-compatible API endpoints for Open WebUI and academic frontends,
with EverOS long-term memory injection and continuous evolution loop.
"""

import time
import uuid
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config.settings import settings
from engine.model_loader import ModelLoader
from engine.prompt_adapters import get_adapter
from engine.local_client import get_local_openai_client
from engine.route import remote_model_override, resolve_inference_backend
from engine.streamer import (
    ThreadSafeStreamer,
    build_local_generator,
    create_openai_sse_chunk,
    create_openai_done_chunk,
)
from engine.multi_model_dispatcher import MultiModelDispatcher
from everos_bridge.memory_engine import EverOSMemoryEngine
from everos_bridge.sidecar_client import get_everos_sidecar
from harness.orchestrator import AcademicOrchestrator
from harness.guardrails import AcademicGuardrails
from harness.protocol import CLAIM_TYPES, ResearchSessionStore
from literature.store import LiteratureStore
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
remote_client = get_local_openai_client()


def _local_adapter():
    return get_adapter(
        format_name=settings.prompt_format,
        model_id=model_loader.active_model_id,
        model_path=model_loader.model_path,
        tokenizer=model_loader.tokenizer,
    )


def _start_local_stream(messages, max_tokens: int, temperature: float) -> ThreadSafeStreamer:
    """Thread-backed HF stream, or a short simulation if no weights are loaded."""
    if not model_loader.is_simulation and model_loader.model is not None:
        generator = build_local_generator(
            model_loader.model,
            model_loader.tokenizer,
            format_name=settings.prompt_format,
            model_id=model_loader.active_model_id,
            model_path=model_loader.model_path,
        )
        return generator.start_stream(messages, max_tokens=max_tokens, temperature=temperature)

    streamer = ThreadSafeStreamer()
    adapter = _local_adapter()
    preview = (
        f"[simulation format={adapter.format_name}] "
        "Local weights are not loaded. Set MODEL_PATH and a live GPU, "
        "or point LOCAL_LLM_BASE_URL at llama.cpp / Ollama."
    )

    def _sim():
        streamer.put_token(preview)
        streamer.end()

    ThreadSafeStreamer.run_generation_in_thread(_sim)
    return streamer


def _generate_local_completion(messages, max_tokens: int, temperature: float) -> str:
    if not model_loader.is_simulation and model_loader.model is not None:
        generator = build_local_generator(
            model_loader.model,
            model_loader.tokenizer,
            format_name=settings.prompt_format,
            model_id=model_loader.active_model_id,
            model_path=model_loader.model_path,
        )
        return generator.generate(messages, max_tokens=max_tokens, temperature=temperature)
    adapter = _local_adapter()
    return (
        f"[simulation format={adapter.format_name}] "
        "Local weights are not loaded. Set MODEL_PATH or LOCAL_LLM_BASE_URL."
    )


def _local_gpu_blocked() -> Optional[str]:
    if getattr(model_loader, "backend_mode", "") == "blocked":
        return model_loader.block_reason or "GPU already occupied by another model."
    return None


async def _sse_from_async_tokens(token_iter, response_id: str, model_name: str, last_user_prompt: str, user_id: str):
    pieces: List[str] = []
    async for chunk in token_iter:
        pieces.append(chunk)
        yield create_openai_sse_chunk(chunk, response_id=response_id, model_name=model_name)
    yield create_openai_sse_chunk("", response_id=response_id, model_name=model_name, finish_reason="stop")
    yield create_openai_done_chunk()
    memory_engine.post_interaction_update(
        user_message=last_user_prompt,
        assistant_response="".join(pieces),
        user_id=user_id,
    )


def _openai_completion_payload(model_name: str, content: str) -> Dict[str, Any]:
    audit = AcademicGuardrails.audit_response(
        content,
        claim_type=getattr(orchestrator, "last_claim_type", None),
    )
    return {
        "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": model_name,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": 128,
            "completion_tokens": 256,
            "total_tokens": 384,
        },
        "guardrails_audit": audit,
    }


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
    claim_type: Optional[str] = None

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
            "active_scholar_profile": memory_engine.profile_manager.active_profile.student_name,
            "sidecar": get_everos_sidecar().health(),
        },
        "literature": LiteratureStore().health(),
        "prompt_format": model_loader.resolve_prompt_format(),
        "backend_mode": getattr(model_loader, "backend_mode", "unknown"),
        "local_llm_base_url": settings.local_llm_base_url,
        "local_llm_model": settings.local_llm_model,
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
    last_user_prompt = next((m["content"] for m in reversed(raw_messages) if m["role"] == "user"), "")

    augmented_messages = orchestrator.synthesize_prompt(
        raw_messages,
        user_id=user_id,
        claim_type=request.claim_type,
    )
    backend = resolve_inference_backend(
        request.model,
        last_user_prompt,
        doubao_configured=bool(settings.doubao_api_key),
    )
    sse_headers = {"Cache-Control": "no-cache", "Connection": "keep-alive"}

    if backend == "doubao":
        model_name = request.model or "doubao-pro"
        if request.stream:
            response_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"
            return StreamingResponse(
                _sse_from_async_tokens(
                    dispatcher.stream_doubao_completion(
                        messages=augmented_messages,
                        temperature=request.temperature or 0.7,
                        max_tokens=request.max_tokens or 4096,
                    ),
                    response_id,
                    model_name,
                    last_user_prompt,
                    user_id,
                ),
                media_type="text/event-stream",
                headers=sse_headers,
            )
        pieces: List[str] = []
        async for chunk in dispatcher.stream_doubao_completion(
            messages=augmented_messages,
            temperature=request.temperature or 0.7,
            max_tokens=request.max_tokens or 4096,
        ):
            pieces.append(chunk)
        content = "".join(pieces)
        background_tasks.add_task(
            memory_engine.post_interaction_update,
            user_message=last_user_prompt,
            assistant_response=content,
            user_id=user_id,
        )
        return _openai_completion_payload(request.model or model_name, content)

    if backend == "gemini":
        model_name = request.model or "gemini-2.5-flash"
        if request.stream:
            response_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"
            return StreamingResponse(
                _sse_from_async_tokens(
                    dispatcher.stream_gemini_completion(
                        messages=augmented_messages,
                        temperature=request.temperature or 0.7,
                    ),
                    response_id,
                    model_name,
                    last_user_prompt,
                    user_id,
                ),
                media_type="text/event-stream",
                headers=sse_headers,
            )
        gemini_pieces: List[str] = []
        async for chunk in dispatcher.stream_gemini_completion(
            messages=augmented_messages,
            temperature=request.temperature or 0.7,
        ):
            gemini_pieces.append(chunk)
        content = "".join(gemini_pieces)
        background_tasks.add_task(
            memory_engine.post_interaction_update,
            user_message=last_user_prompt,
            assistant_response=content,
            user_id=user_id,
        )
        return _openai_completion_payload(request.model or model_name, content)

    blocked = _local_gpu_blocked()
    if blocked and remote_client is None:
        raise HTTPException(status_code=503, detail=blocked)

    if remote_client is not None:
        remote_model = remote_model_override(request.model, remote_client.default_model)
        if request.stream:
            response_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"
            return StreamingResponse(
                _sse_from_async_tokens(
                    remote_client.stream_tokens(
                        messages=augmented_messages,
                        temperature=request.temperature if request.temperature is not None else 0.3,
                        max_tokens=request.max_tokens or 2048,
                        model=remote_model,
                    ),
                    response_id,
                    request.model or remote_model,
                    last_user_prompt,
                    user_id,
                ),
                media_type="text/event-stream",
                headers=sse_headers,
            )
        content = await remote_client.complete(
            messages=augmented_messages,
            temperature=request.temperature if request.temperature is not None else 0.3,
            max_tokens=request.max_tokens or 2048,
            model=remote_model,
        )
        background_tasks.add_task(
            memory_engine.post_interaction_update,
            user_message=last_user_prompt,
            assistant_response=content,
            user_id=user_id,
        )
        return _openai_completion_payload(request.model or remote_model, content)

    if request.stream:
        local_streamer = _start_local_stream(
            messages=augmented_messages,
            max_tokens=request.max_tokens or 2048,
            temperature=request.temperature if request.temperature is not None else 0.3,
        )
        model_name = request.model or "Philo-EverOS-Dual5090"

        async def local_sse_and_persist():
            async for chunk in local_streamer.stream_generator(model_name=model_name):
                yield chunk
            memory_engine.post_interaction_update(
                user_message=last_user_prompt,
                assistant_response=local_streamer.full_text,
                user_id=user_id,
            )

        return StreamingResponse(
            local_sse_and_persist(),
            media_type="text/event-stream",
            headers=sse_headers,
        )

    content = _generate_local_completion(
        messages=augmented_messages,
        max_tokens=request.max_tokens or 2048,
        temperature=request.temperature if request.temperature is not None else 0.3,
    )
    background_tasks.add_task(
        memory_engine.post_interaction_update,
        user_message=last_user_prompt,
        assistant_response=content,
        user_id=user_id,
    )
    return _openai_completion_payload(request.model or "Philo-EverOS-5090", content)

class LiteratureIngestRequest(BaseModel):
    documents: List[Dict[str, Any]]


class HarnessSessionRequest(BaseModel):
    user_id: Optional[str] = "default_scholar"
    claim_type: str


@app.post("/v1/literature/ingest")
async def ingest_literature(req: LiteratureIngestRequest):
    try:
        result = LiteratureStore().ingest(req.documents)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"status": "success", **result}


@app.get("/v1/harness/session")
async def get_harness_session(user_id: str = "default_scholar"):
    return ResearchSessionStore().load(user_id)


@app.post("/v1/harness/session")
async def lock_harness_session(req: HarnessSessionRequest):
    if req.claim_type not in CLAIM_TYPES:
        raise HTTPException(status_code=400, detail=f"claim_type must be one of {CLAIM_TYPES}")
    return ResearchSessionStore().lock_claim_type(req.user_id or "default_scholar", req.claim_type)


@app.post("/v1/feedback/correct")
async def receive_sft_correction(req: SFTFeedbackRequest):
    item = feedback_collector.record_sft_correction(
        instruction=req.instruction,
        original_output=req.original_output,
        corrected_output=req.corrected_output,
        student_notes=req.student_notes,
        philosopher_target=req.philosopher_target
    )
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
    dataset_exporter.export_dpo_pairs()
    return {"status": "success", "record_id": item.id, "type": "DPO_Preference_Archive"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)

"""
Thread-safe local generation + OpenAI SSE.

Never consume HuggingFace TextIteratorStreamer inside an async generator.
model.generate() runs in a daemon thread; tokens land on a queue; the asyncio
loop only polls via run_in_executor so /v1/models stays responsive (Open WebUI).
"""

from __future__ import annotations

import json
import time
import uuid
import queue
import threading
import asyncio
from typing import Any, AsyncGenerator, Dict, Iterable, List, Optional, Sequence

from engine.prompt_adapters import PromptAdapter, get_adapter


def create_openai_sse_chunk(
    content: str,
    response_id: Optional[str] = None,
    model_name: str = "Philo-EverOS-5090",
    finish_reason: Optional[str] = None
) -> str:
    """Format single token into standard OpenAI Server-Sent Event (SSE) payload."""
    chunk_id = response_id or f"chatcmpl-{uuid.uuid4().hex[:12]}"
    created_ts = int(time.time())
    payload = {
        "id": chunk_id,
        "object": "chat.completion.chunk",
        "created": created_ts,
        "model": model_name,
        "choices": [
            {
                "index": 0,
                "delta": {"content": content} if content else {},
                "finish_reason": finish_reason
            }
        ]
    }
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def create_openai_done_chunk() -> str:
    """Final standard OpenAI termination marker."""
    return "data: [DONE]\n\n"


class ThreadSafeStreamer:
    """
    Queue between the generate() worker thread and the FastAPI event loop.
    Accumulates full_text so memory hooks receive the real completion.
    """

    def __init__(self, timeout: float = 180.0):
        self.queue: queue.Queue = queue.Queue()
        self.stop_signal = object()
        self.timeout = timeout
        self.response_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"
        self._parts: List[str] = []
        self._lock = threading.Lock()

    def put_token(self, token: str):
        if not token:
            return
        with self._lock:
            self._parts.append(token)
        self.queue.put(token)

    def end(self):
        self.queue.put(self.stop_signal)

    @property
    def full_text(self) -> str:
        with self._lock:
            return "".join(self._parts)

    async def stream_generator(self, model_name: str = "Philo-EverOS-5090") -> AsyncGenerator[str, None]:
        """Yield SSE chunks without blocking the server event loop."""
        loop = asyncio.get_running_loop()
        finished = False

        while not finished:
            try:
                item = await loop.run_in_executor(None, self._poll_queue)
                if item is self.stop_signal:
                    finished = True
                    yield create_openai_sse_chunk(
                        "",
                        response_id=self.response_id,
                        model_name=model_name,
                        finish_reason="stop",
                    )
                    yield create_openai_done_chunk()
                    break
                elif item:
                    yield create_openai_sse_chunk(item, response_id=self.response_id, model_name=model_name)
            except Exception as e:
                yield create_openai_sse_chunk(
                    f"\n[Generation Interrupted: {e}]",
                    response_id=self.response_id,
                    model_name=model_name,
                )
                yield create_openai_done_chunk()
                break

    def iter_sse_sync(self, model_name: str = "Philo-EverOS-5090"):
        """Sync SSE iterator for Starlette thread-pool StreamingResponse."""
        while True:
            item = self._poll_queue()
            if item is self.stop_signal:
                yield create_openai_sse_chunk(
                    "",
                    response_id=self.response_id,
                    model_name=model_name,
                    finish_reason="stop",
                )
                yield create_openai_done_chunk()
                return
            if item:
                yield create_openai_sse_chunk(item, response_id=self.response_id, model_name=model_name)

    def _poll_queue(self):
        try:
            return self.queue.get(timeout=self.timeout)
        except queue.Empty:
            return self.stop_signal

    @staticmethod
    def run_generation_in_thread(generation_func, *args, **kwargs):
        worker = threading.Thread(
            target=generation_func,
            args=args,
            kwargs=kwargs,
            daemon=True,
        )
        worker.start()
        return worker


def filter_stop_stream(
    token_iter: Iterable[str],
    stop_strings: Sequence[str],
    put_fn,
    end_fn,
) -> None:
    """
    Forward decoded pieces until a stop marker appears.
    Holds back a short tail so a split '### Inst' + 'ruction:' cannot leak.
    """
    stops = [s for s in stop_strings if s]
    pending = ""
    max_hold = max((len(s) for s in stops), default=0)

    def _flush_hit(buf: str) -> bool:
        for marker in stops:
            idx = buf.find(marker)
            if idx != -1:
                safe = buf[:idx]
                if safe:
                    put_fn(safe)
                end_fn()
                return True
        return False

    try:
        for piece in token_iter:
            if not piece:
                continue
            pending += piece
            if _flush_hit(pending):
                return
            if max_hold and len(pending) > max_hold:
                emit_len = len(pending) - max_hold + 1
                put_fn(pending[:emit_len])
                pending = pending[emit_len:]
        if pending:
            if not _flush_hit(pending):
                put_fn(pending)
        end_fn()
    except Exception:
        if pending and not any(s in pending for s in stops):
            put_fn(pending)
        end_fn()
        raise


class LocalHFGenerator:
    """
    HuggingFace generate() wrapper: PromptAdapter + stop strings + do_sample
    + background thread. Used by both streaming and non-streaming routes.
    """

    def __init__(self, model, tokenizer, adapter: PromptAdapter):
        self.model = model
        self.tokenizer = tokenizer
        self.adapter = adapter

    def format_prompt(self, messages: Iterable[Dict[str, Any]]) -> str:
        return self.adapter.format_messages(messages, tokenizer=self.tokenizer)

    def start_stream(
        self,
        messages: Iterable[Dict[str, Any]],
        max_tokens: int = 2048,
        temperature: float = 0.3,
        top_p: float = 0.9,
    ) -> ThreadSafeStreamer:
        prompt = self.format_prompt(messages)
        out = ThreadSafeStreamer()

        def worker():
            try:
                self._stream_into(prompt, out, max_tokens, temperature, top_p)
            except Exception as exc:
                out.put_token(f"\n[Generation Error: {exc}]")
                out.end()

        ThreadSafeStreamer.run_generation_in_thread(worker)
        return out

    def generate(
        self,
        messages: Iterable[Dict[str, Any]],
        max_tokens: int = 2048,
        temperature: float = 0.3,
        top_p: float = 0.9,
    ) -> str:
        prompt = self.format_prompt(messages)
        import torch

        inputs = self.tokenizer(prompt, return_tensors="pt")
        device = next(self.model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        input_len = inputs["input_ids"].shape[1]
        stopping = _build_stopping_criteria(self.tokenizer, self.adapter.stop_strings, input_len)
        do_sample = bool(temperature and temperature > 0)

        gen_kwargs: Dict[str, Any] = dict(
            **inputs,
            max_new_tokens=max_tokens,
            do_sample=do_sample,
            pad_token_id=self.tokenizer.pad_token_id or self.tokenizer.eos_token_id,
            eos_token_id=self.tokenizer.eos_token_id,
        )
        if do_sample:
            gen_kwargs["temperature"] = temperature
            gen_kwargs["top_p"] = top_p
        if stopping is not None:
            gen_kwargs["stopping_criteria"] = stopping

        with torch.no_grad():
            output = self.model.generate(**gen_kwargs)

        text = self.tokenizer.decode(output[0][input_len:], skip_special_tokens=True)
        return self.adapter.strip_stop_echo(text)

    def _stream_into(
        self,
        prompt: str,
        out: ThreadSafeStreamer,
        max_tokens: int,
        temperature: float,
        top_p: float,
    ) -> None:
        from transformers import TextIteratorStreamer

        inputs = self.tokenizer(prompt, return_tensors="pt")
        device = next(self.model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        input_len = inputs["input_ids"].shape[1]
        stopping = _build_stopping_criteria(self.tokenizer, self.adapter.stop_strings, input_len)
        hf_streamer = TextIteratorStreamer(
            self.tokenizer,
            skip_prompt=True,
            skip_special_tokens=True,
        )
        do_sample = bool(temperature and temperature > 0)
        gen_kwargs: Dict[str, Any] = dict(
            **inputs,
            streamer=hf_streamer,
            max_new_tokens=max_tokens,
            do_sample=do_sample,
            pad_token_id=self.tokenizer.pad_token_id or self.tokenizer.eos_token_id,
            eos_token_id=self.tokenizer.eos_token_id,
        )
        if do_sample:
            gen_kwargs["temperature"] = temperature
            gen_kwargs["top_p"] = top_p
        if stopping is not None:
            gen_kwargs["stopping_criteria"] = stopping

        worker = threading.Thread(target=self.model.generate, kwargs=gen_kwargs, daemon=True)
        worker.start()
        try:
            filter_stop_stream(
                hf_streamer,
                self.adapter.stop_strings,
                out.put_token,
                out.end,
            )
        finally:
            worker.join(timeout=2.0)


def _build_stopping_criteria(tokenizer, stop_strings: Sequence[str], input_len: int):
    stops = [s for s in stop_strings if s]
    if not stops:
        return None
    try:
        from transformers import StoppingCriteria, StoppingCriteriaList
    except Exception:
        return None

    class _StopOnStrings(StoppingCriteria):
        def __call__(self, input_ids, scores, **kwargs):
            generated = input_ids[0, input_len:]
            if generated.shape[0] == 0:
                return False
            decoded = tokenizer.decode(generated, skip_special_tokens=True)
            return any(marker in decoded for marker in stops)

    return StoppingCriteriaList([_StopOnStrings()])


def build_local_generator(model, tokenizer, **adapter_kwargs) -> LocalHFGenerator:
    adapter = get_adapter(tokenizer=tokenizer, **adapter_kwargs)
    if tokenizer is not None and getattr(tokenizer, "pad_token", None) is None:
        tokenizer.pad_token = tokenizer.eos_token
    return LocalHFGenerator(model, tokenizer, adapter)

"""
Philo-EverOS Thread-Safe SSE Streamer
Compliant with OpenAI API Streaming Specifications and Non-blocking AsyncIO loops.
"""

import json
import time
import uuid
import queue
import threading
import asyncio
from typing import AsyncGenerator, Generator, Optional, Any, Dict

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
    Non-blocking Streamer wrapping PyTorch/Transformers generation inside a background worker thread.
    Prevents the AsyncIO event loop from stalling or timing out during long philosophical token generations.
    """
    def __init__(self, timeout: float = 120.0):
        self.queue: queue.Queue = queue.Queue()
        self.stop_signal = object()
        self.timeout = timeout
        self.response_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"

    def put_token(self, token: str):
        """Put generated token into thread-safe buffer."""
        self.queue.put(token)

    def end(self):
        """Signals generation completion."""
        self.queue.put(self.stop_signal)

    async def stream_generator(self, model_name: str = "Philo-EverOS-5090") -> AsyncGenerator[str, None]:
        """
        Asynchronously yields SSE chunks without blocking the server event loop.
        """
        loop = asyncio.get_running_loop()
        finished = False

        while not finished:
            try:
                # Poll queue without blocking the event loop
                item = await loop.run_in_executor(None, self._poll_queue)
                if item is self.stop_signal:
                    finished = True
                    # Yield finish reason chunk
                    yield create_openai_sse_chunk("", response_id=self.response_id, model_name=model_name, finish_reason="stop")
                    # Yield terminal [DONE]
                    yield create_openai_done_chunk()
                    break
                elif item:
                    yield create_openai_sse_chunk(item, response_id=self.response_id, model_name=model_name)
            except Exception as e:
                # Handle timeout or worker error
                yield create_openai_sse_chunk(f"\n[Generation Interrupted: {e}]", response_id=self.response_id, model_name=model_name)
                yield create_openai_done_chunk()
                break

    def _poll_queue(self):
        try:
            return self.queue.get(timeout=self.timeout)
        except queue.Empty:
            return self.stop_signal

    @staticmethod
    def run_generation_in_thread(generation_func, *args, **kwargs):
        """
        Spawns background daemon thread for model.generate()
        """
        worker = threading.Thread(
            target=generation_func,
            args=args,
            kwargs=kwargs,
            daemon=True
        )
        worker.start()
        return worker

"""
Refuse to load a second in-process HuggingFace weight set onto a card that is
already occupied (the Fireball + Ollama-32B pile-up that dropped to CPU).
"""

from __future__ import annotations

import atexit
import logging
import os
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

from config.settings import settings

logger = logging.getLogger("philo_everos.engine.gpu_lock")

LOCK_PATH = settings.data_dir / "engine.gpu.lock"
VRAM_BUSY_MIB = int(os.getenv("GPU_BUSY_THRESHOLD_MIB", "4096"))


class GpuOccupiedError(RuntimeError):
    pass


def list_gpu_compute_apps() -> List[Dict[str, Any]]:
    try:
        result = subprocess.run(
            [
                "nvidia-smi",
                "--query-compute-apps=pid,process_name,used_gpu_memory",
                "--format=csv,noheader,nounits",
            ],
            capture_output=True,
            text=True,
            timeout=8,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError) as exc:
        logger.info("[gpu_lock] nvidia-smi unavailable (%s); skipping occupancy probe.", exc)
        return []

    apps: List[Dict[str, Any]] = []
    for raw in result.stdout.splitlines():
        line = raw.strip()
        if not line:
            continue
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 3:
            continue
        try:
            pid = int(parts[0])
            used = int(float(parts[2]))
        except ValueError:
            continue
        apps.append({"pid": pid, "name": parts[1], "used_mib": used})
    return apps


def assert_can_load_inprocess_weights() -> None:
    """Call only when this process is about to from_pretrained() onto the GPU."""
    if settings.allow_gpu_share or os.getenv("ALLOW_GPU_SHARE", "").strip().lower() in {"1", "true", "yes"}:
        logger.warning("[gpu_lock] ALLOW_GPU_SHARE=1 — occupancy check skipped.")
        return

    self_pid = os.getpid()
    others = [a for a in list_gpu_compute_apps() if a["pid"] != self_pid and a["used_mib"] >= VRAM_BUSY_MIB]
    if others:
        detail = ", ".join(f"{a['name']} pid={a['pid']} ({a['used_mib']} MiB)" for a in others)
        raise GpuOccupiedError(
            "GPU already holds another model: "
            f"{detail}. Stop serve_philo.py / Ollama / a second Philo-EverOS, "
            "or set ALLOW_GPU_SHARE=1 if this is intentional."
        )

    stale = _read_lock_pid()
    if stale and stale != self_pid and _pid_alive(stale):
        raise GpuOccupiedError(
            f"Philo-EverOS GPU lock is held by pid {stale} ({LOCK_PATH}). "
            "Stop that process before loading another in-process model."
        )
    _write_lock(self_pid)
    atexit.register(release_lock)


def release_lock() -> None:
    try:
        if LOCK_PATH.exists():
            stored = _read_lock_pid()
            if stored in (None, os.getpid()):
                LOCK_PATH.unlink(missing_ok=True)
    except OSError:
        pass


def _read_lock_pid() -> Optional[int]:
    try:
        text = LOCK_PATH.read_text(encoding="utf-8").strip()
        return int(text) if text else None
    except (OSError, ValueError):
        return None


def _write_lock(pid: int) -> None:
    LOCK_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOCK_PATH.write_text(str(pid), encoding="utf-8")


def _pid_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    try:
        os.kill(pid, 0)
    except PermissionError:
        return True
    except OSError:
        return False
    return True

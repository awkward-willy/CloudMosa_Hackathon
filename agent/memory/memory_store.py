import json
from pathlib import Path
from typing import Any, Dict, Optional

DEFAULT_PATH = Path("data/memory.json")

class MemoryStore:
    """Tiny JSON-backed memory store for long-term agent memory."""
    def __init__(self, path: Path = DEFAULT_PATH) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._cache: Dict[str, Any] = {}
        self._loaded = False

    def _ensure_loaded(self) -> None:
        if self._loaded:
            return
        if self.path.exists():
            try:
                self._cache = json.loads(self.path.read_text(encoding="utf-8"))
            except Exception:
                self._cache = {}
        else:
            self._cache = {}
        self._loaded = True

    def get(self, key: str, default: Optional[Any] = None) -> Any:
        self._ensure_loaded()
        return self._cache.get(key, default)

    def set(self, key: str, value: Any) -> None:
        self._ensure_loaded()
        self._cache[key] = value
        self._flush()

    def append_list(self, key: str, item: Any, max_len: int = 20) -> None:
        self._ensure_loaded()
        lst = self._cache.get(key, [])
        if not isinstance(lst, list):
            lst = [lst]
        lst.append(item)
        if max_len and len(lst) > max_len:
            lst = lst[-max_len:]
        self._cache[key] = lst
        self._flush()

    def _flush(self) -> None:
        self.path.write_text(
            json.dumps(self._cache, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )

from typing import Optional

from langchain_core.tools import tool

from memory.memory_store import MemoryStore

_store = MemoryStore()


@tool
def memory_get(key: str) -> str:
    """Get a value from long-term memory by key. Returns empty string if not found."""
    val = _store.get(key, "")
    return "" if val is None else str(val)


@tool
def memory_set(key: str, value: str) -> str:
    """Set a value into long-term memory by key (overwrites)."""
    _store.set(key, value)
    return f"OK: memory[{key}] set."


@tool
def memory_append(key: str, value: str) -> str:
    """Append a value to a list in long-term memory by key (keeps last 20 items)."""
    _store.append_list(key, value, max_len=20)
    return f"OK: memory[{key}] appended."

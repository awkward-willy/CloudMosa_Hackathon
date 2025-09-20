from __future__ import annotations
from langchain_core.tools import tool
from typing import List, Dict, Any, Optional
import datetime as dt
import json

from llm import get_llm
from memory.memory_store import MemoryStore

_STORE = MemoryStore()

_SYSTEM_INSTR = (
    "You create practical personal finance tips for adults with low financial literacy in developing regions. "
    "Write at CEFR A1–A2 level, avoid jargon, never promise guaranteed returns. "
    "Each tip MUST follow this structure and stay within 120–200 words total:\n"
    "- A 1–2 sentence intro that sets context and motivation.\n"
    "- A numbered list with 2–3 concrete steps (use '1.', '2.', '3.'). Each step is 1–2 short sentences.\n"
    "- A single-sentence 'Example:' that shows how to apply the steps in daily life.\n"
    "- A single-sentence 'Common mistake:' that warns about a frequent error.\n"
    "- A single-sentence 'Tiny challenge:' that gives a very small action a person can try today.\n"
    "Forbidden topics: high-risk investing, lending apps, crypto hype, get-rich-quick.\n"
    "Output ONE JSON object with fields: "
    "{title: string, body: string, tags: string[], reading_level: 'A1'|'A2'}.\n"
    "In body, keep the exact headings and markers: numbered steps (1., 2., 3.), and the labels 'Example:', 'Common mistake:', 'Tiny challenge:'."
)

def _parse_json(text: str) -> Optional[Dict[str, Any]]:
    text = (text or "").strip()
    if not text:
        return None
    try:
        return json.loads(text)
    except Exception:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except Exception:
                return None
    return None

def _normalize_entry(entry: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    if not isinstance(entry, dict):
        return None
    title = (entry.get("title") or "").strip()
    body = (entry.get("body") or "").strip()
    tags = entry.get("tags") or []
    level = (entry.get("reading_level") or "").strip() or "A2"
    if not title or not body:
        return None
    if not isinstance(tags, list):
        tags = []
    tags = [str(t)[:24] for t in tags[:3]]

    # Ensure numbered steps exist in body; if not, add a minimal structure
    if "1." not in body:
        body = f"{body}\n\n1. Take a small, clear first step.\n2. Repeat it on a schedule.\n3. Review after one week."

    return {"title": title, "body": body, "tags": tags, "reading_level": level}

@tool
def generate_financial_tip(locale: str = "en", theme: str = "budgeting") -> str:
    """Return today's financial tip for the given locale and theme (generate once; keep last 30 days). JSON string."""
    today = dt.date.today().isoformat()
    tips: List[Dict[str, Any]] = _STORE.get("daily_tips", [])
    if not isinstance(tips, list):
        tips = []

    for entry in reversed(tips):
        if entry.get("date") == today and entry.get("locale") == locale and entry.get("theme") == theme:
            return json.dumps(entry["tip"], ensure_ascii=False)

    llm = get_llm(temperature=0.5)
    user_prompt = (
        f"Locale: {locale}\n"
        f"Theme: {theme}\n"
        "Generate exactly one tip. Include a short intro and 2–3 numbered steps. "
        "Stay within 120–200 words in total."
    )
    resp = llm.invoke(
        [
            {"role": "system", "content": _SYSTEM_INSTR},
            {"role": "user", "content": user_prompt},
        ]
    )
    parsed = _parse_json(getattr(resp, "content", "") or "")
    tip = _normalize_entry(parsed) if parsed else None
    if not tip:
        return json.dumps({"error": "No tip generated"}, ensure_ascii=False)

    record = {"date": today, "locale": locale, "theme": theme, "tip": tip}
    tips.append(record)
    tips = tips[-30:]
    _STORE.set("daily_tips", tips)
    _STORE.set("last_tip", record)

    return json.dumps(tip, ensure_ascii=False)

@tool
def list_recent_tips(n: int = 7, locale: str = "", theme: str = "") -> str:
    """List up to N most recent tips as a JSON array. Optional locale/theme filters."""
    tips: List[Dict[str, Any]] = _STORE.get("daily_tips", [])
    if not isinstance(tips, list):
        tips = []
    items = tips
    if locale:
        items = [t for t in items if t.get("locale") == locale]
    if theme:
        items = [t for t in items if t.get("theme") == theme]
    out = []
    for t in items[-n:]:
        out.append(
            {
                "date": t.get("date"),
                "locale": t.get("locale"),
                "theme": t.get("theme"),
                "tip": t.get("tip"),
            }
        )
    return json.dumps(out, ensure_ascii=False)

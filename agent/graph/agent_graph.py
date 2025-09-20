from __future__ import annotations
import re
import json
from typing import Sequence

from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
    AIMessage,
    ToolMessage,
    SystemMessage,
)
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from state import AgentState
from llm import get_llm

from tools.tx_loader import load_transactions
from tools.advisor import analyze_transactions
from tools.memory_tools import memory_get, memory_set, memory_append
from tools.financial_tips import generate_financial_tip, list_recent_tips


tools = [
    load_transactions,
    analyze_transactions,
    memory_get,
    memory_set,
    memory_append,
    generate_financial_tip,
    list_recent_tips,
]


def _last_user_text(messages: Sequence[BaseMessage]) -> str:
    for m in reversed(messages):
        if isinstance(m, HumanMessage):
            return m.content or ""
    return ""


def _format_tip(result: str) -> str:
    try:
        data = json.loads(result)
        title = data.get("title", "").strip()
        body = data.get("body", "").strip()
        tags = ", ".join(data.get("tags", []))
        level = data.get("reading_level", "")
        parts = []
        if title:
            parts.append(f"**{title}**")
        if body:
            parts.append(body)
        meta = []
        if tags:
            meta.append(f"Tags: {tags}")
        if level:
            meta.append(f"Level: {level}")
        if meta:
            parts.append(" · ".join(meta))
        pretty = "\n\n".join(parts).strip()
        return pretty or result
    except Exception:
        return result


def our_agent(state: AgentState) -> AgentState:
    # Intercept tip requests and force tool usage
    if state["messages"]:
        last_user = _last_user_text(state["messages"])
        if last_user and re.search(r"\b(tip|tips|today'?s tip|daily tip)\b", last_user, flags=re.I):
            result = generate_financial_tip.invoke({"locale": "en", "theme": "budgeting"})
            pretty = _format_tip(result)
            tool_msg = ToolMessage(content=result, tool_call_id="tip-direct")
            ai_msg = AIMessage(content=f"Here's today's tip:\n{pretty}")
            return {"messages": list(state["messages"]) + [tool_msg, ai_msg]}

    system = SystemMessage(
        content=(
            """You are a concise personal finance assistant.
- On the first turn, call memory_get('profile') and memory_get('last_summary') if available.
- If the user does not specify a CSV path, always use 'data/sample_transactions.csv' as the default.
- Use tools to load_transactions(path) and analyze_transactions(path) to produce advice.
- After producing suggestions, update long-term memory via memory_append('advice_history', ...) and memory_set('last_summary', ...).
- Provide 3-5 numbered, actionable bullet points under 150 words.
- You can call generate_financial_tip(locale, theme) to produce a daily low-literacy tip, and list_recent_tips(n, locale) to review recent tips.
- When the user asks for a tip (e.g., "tip", "today's tip", "daily tip"), you must call `generate_financial_tip` and must not write the tip by yourself.
"""
        )
    )

    llm = get_llm(temperature=0.2).bind_tools(tools)
    response = llm.invoke([system] + list(state["messages"]))
    return {"messages": list(state["messages"]) + [response]}


def route_after_agent(state: AgentState) -> str:
    msgs = list(state["messages"])
    if not msgs:
        return "end"
    last = msgs[-1]
    if isinstance(last, AIMessage) and getattr(last, "tool_calls", None):
        return "tools"
    return "end"


def back_to_agent(_state: AgentState) -> str:
    return "agent"


graph = StateGraph(AgentState)
graph.add_node("agent", our_agent)
graph.add_node("tools", ToolNode(tools))
graph.set_entry_point("agent")

graph.add_conditional_edges(
    "agent",
    route_after_agent,
    {"tools": "tools", "end": END},
)

graph.add_conditional_edges(
    "tools",
    back_to_agent,
    {"agent": "agent"},
)

app = graph.compile()

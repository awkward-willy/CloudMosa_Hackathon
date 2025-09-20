from __future__ import annotations
import os
from typing import Sequence
from dotenv import load_dotenv
from langchain_core.messages import (
    HumanMessage,
    SystemMessage,
    ToolMessage,
    BaseMessage,
    AIMessage,
)
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from state import AgentState

from langchain_google_genai import ChatGoogleGenerativeAI

from tools.tx_loader import load_transactions
from tools.advisor import analyze_transactions
from tools.memory_tools import memory_get, memory_set, memory_append

from llm import get_llm

tools = [
    load_transactions,
    analyze_transactions,
    memory_get,
    memory_set,
    memory_append,
]

_llm = get_llm(temperature=0.2)
_bound_llm = _llm.bind_tools(tools)


def our_agent(state: AgentState) -> AgentState:
    system = SystemMessage(
        content=(
            "You are a concise personal finance assistant.\n"
            "- On the first turn, call memory_get('profile') and memory_get('last_summary') if available.\n"
            "- If the user does not specify a CSV path, always use 'data/sample_transactions.csv' as the default.\n"
            "- Use tools to load_transactions(path) and analyze_transactions(path) to produce advice.\n"
            "- After producing suggestions, update long-term memory via memory_append('advice_history', ...)"
            " and memory_set('last_summary', ...).\n"
            "- Provide 3-5 numbered, actionable bullet points under 150 words."
        )
    )

    all_messages: Sequence[BaseMessage] = [system] + list(state["messages"])
    response = _bound_llm.invoke(all_messages)
    return {"messages": list(state["messages"]) + [response]}


def route_after_agent(state: AgentState) -> str:
    msgs = list(state["messages"])
    if not msgs:
        return "end"
    last = msgs[-1]
    if isinstance(last, AIMessage) and getattr(last, "tool_calls", None):
        return "tools"
    return "end"


def should_continue_after_tools(state: AgentState) -> str:
    return "agent"


graph = StateGraph(AgentState)
graph.add_node("agent", our_agent)
graph.add_node("tools", ToolNode(tools))

graph.set_entry_point("agent")

graph.add_conditional_edges(
    "agent",
    route_after_agent,
    {
        "tools": "tools",
        "end": END,
    },
)

graph.add_conditional_edges(
    "tools",
    should_continue_after_tools,
    {
        "agent": "agent",
    },
)

app = graph.compile()

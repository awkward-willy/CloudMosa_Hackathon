from __future__ import annotations
import argparse
from typing import List
from state import AgentState
from graph.agent_graph import app
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage, BaseMessage


def get_last_ai_message(messages: List[BaseMessage]) -> str:
    for m in reversed(messages):
        if isinstance(m, AIMessage):
            return m.content or ""
    return ""


def print_tail(messages: List[BaseMessage], tail: int = 10) -> None:
    print("\n--- Conversation tail ---")
    for m in messages[-tail:]:
        if isinstance(m, HumanMessage):
            role = "Human"
        elif isinstance(m, ToolMessage):
            role = "Tool"
        elif isinstance(m, AIMessage):
            role = "AI"
        else:
            role = "Other"
        content = getattr(m, "content", "")
        if content and content.strip():
            print(f"[{role}] {content}")
    print("-------------------------\n")


def print_last_tool_calls(messages: List[BaseMessage]) -> None:
    for m in reversed(messages):
        if isinstance(m, AIMessage):
            tc = getattr(m, "tool_calls", None)
            if tc:
                names = [t.get("name", "") for t in tc if isinstance(t, dict)]
                names = [n for n in names if n]
                if names:
                    print(f"Tools used: {names}")
            return


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--debug", action="store_true", help="Print internal messages and tool calls.")
    args = parser.parse_args()

    print("\n=== Finance Agent (with long-term memory) ===")
    state: AgentState = {"messages": []}

    while True:
        user_input = input("\nYou: ")
        if user_input.strip().lower() in {"exit", "quit"}:
            break

        state["messages"].append(HumanMessage(content=user_input))
        state = app.invoke(state)

        if args.debug:
            print_tail(list(state["messages"]))
            print_last_tool_calls(list(state["messages"]))
        else:
            ai_reply = get_last_ai_message(list(state["messages"]))
            if ai_reply.strip():
                print(f"\nAI: {ai_reply}")

    print("\n=== Session Ended ===")


if __name__ == "__main__":
    main()

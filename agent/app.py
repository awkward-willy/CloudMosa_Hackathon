from __future__ import annotations
import argparse
import json
from pathlib import Path
from typing import List
from state import AgentState
from graph.agent_graph import app
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage, BaseMessage


def get_last_ai_message(messages: List[BaseMessage]) -> str:
    """Return the most recent AI message content."""
    for m in reversed(messages):
        if isinstance(m, AIMessage):
            return m.content or ""
    return ""


def print_tail(messages: List[BaseMessage], tail: int = 10) -> None:
    """Print the last few messages for debugging."""
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
    """Print names of tools used in the last AI message."""
    for m in reversed(messages):
        if isinstance(m, AIMessage):
            tc = getattr(m, "tool_calls", None)
            if tc:
                names = [t.get("name", "") for t in tc if isinstance(t, dict)]
                names = [n for n in names if n]
                if names:
                    print(f"Tools used: {names}")
            return


def load_json_records(path: Path):
    """Load transactions from JSON file."""
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("JSON must be a list of transaction objects.")
    return data


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--json",
        type=Path,
        default=Path("data/sample_transactions.json"),
        help="Path to JSON transactions file."
    )
    parser.add_argument(
        "--debug", action="store_true",
        help="Print internal messages and tool calls."
    )
    args = parser.parse_args()

    print("\n=== Finance Agent (with long-term memory) ===")

    # Load transactions at start (instead of CSV)
    if args.json.exists():
        records = load_json_records(args.json)
        print(f"Loaded {len(records)} transactions from {args.json}")
        # Inject a HumanMessage so agent knows dataset exists
        init_msg = HumanMessage(content="Dataset loaded and ready.")
        state: AgentState = {"messages": [init_msg]}
    else:
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

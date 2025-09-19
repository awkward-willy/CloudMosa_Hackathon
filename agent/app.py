from __future__ import annotations
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from graph.agent_graph import build_graph
from state import AgentState

load_dotenv()

def main():
    graph = build_graph().compile()
    state: AgentState = {
        "messages": [],
        "dataset_path": "data/sample_transactions.csv",
        "last_response": None,
    }
    print("\nType 'exit' to quit.\n")
    while True:
        q = input("You: ")
        if q.strip().lower() in {"exit", "quit"}:
            break
        state["messages"].append(HumanMessage(content=q))
        state = graph.invoke(state)

        print("\n--- Conversation log ---")
        for msg in state["messages"]:
            if isinstance(msg, HumanMessage):
                role = "Human"
            elif isinstance(msg, ToolMessage):
                role = "Tool"
            elif isinstance(msg, AIMessage):
                role = "AI"
            else:
                role = "Other"
            print(f"[{role}] {msg.content}")
        print("------------------------\n")

if __name__ == "__main__":
    main()

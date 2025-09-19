import argparse
from dotenv import load_dotenv
from state import AgentState
from graph.agent_graph import build_graph

load_dotenv()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", default="data/sample_transactions.csv",
                        help="交易CSV路徑（需含: date,description,category,amount）")
    args = parser.parse_args()

    graph = build_graph().compile()
    state: AgentState = {
        "messages": [],
        "dataset_path": args.csv,
        "last_response": None,
    }
    out = graph.invoke(state)
    print("\n=== 建議 ===")
    print(out["last_response"])

if __name__ == "__main__":
    main()

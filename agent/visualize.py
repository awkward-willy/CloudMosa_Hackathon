from graph.agent_graph import build_graph

def main():
    g = build_graph().compile()
    # Save Mermaid source only
    out_path = "agent_graph.mmd"
    with open(out_path, "w") as f:
        f.write(g.get_graph().draw_mermaid())
    print(f"Mermaid source saved to {out_path}")
    print("Open this file in https://mermaid.live to view the diagram.")

if __name__ == "__main__":
    main()

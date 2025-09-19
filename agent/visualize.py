from graph.agent_graph import build_graph

def main():
    # build raw graph
    g = build_graph()
    # compile it
    compiled = g.compile()

    # Save PNG
    out_path = "agent_graph.png"
    with open(out_path, "wb") as f:
        f.write(compiled.get_graph().draw_mermaid_png())
    print(f"Graph saved to {out_path}")

    # Save Mermaid source as well
    with open("agent_graph.mmd", "w") as f:
        f.write(compiled.get_graph().draw_mermaid())
    print("Mermaid source saved to agent_graph.mmd")

if __name__ == "__main__":
    main()

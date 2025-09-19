# visualize.py
from graph.agent_graph import app

def main():
    g = app.get_graph()
    out_path = "agent_graph.mmd"
    with open(out_path, "w") as f:
        f.write(g.draw_mermaid())
    print(f"Mermaid source saved to {out_path}")
    print("Open it in https://mermaid.live to view the diagram.")

if __name__ == "__main__":
    main()

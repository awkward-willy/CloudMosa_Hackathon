import ast
import re
from pathlib import Path

DOCS_DIR = Path("./docs")
DOCS_DIR.mkdir(exist_ok=True)
OUTPUT_FILE = DOCS_DIR / "agent_design.md"

GRAPH_FILE = Path("graph/agent_graph.py")
TOOLS_DIR = Path("tools")


def extract_system_prompt() -> str:
    text = GRAPH_FILE.read_text(encoding="utf-8")
    # Match the SystemMessage content string
    match = re.search(
        r'SystemMessage\(.*?content=\(\s*"""?(.+?)"""?\s*\)\)', text, re.S
    )
    if match:
        return match.group(1).strip()
    # fallback: look for content=(...) string
    match = re.search(r'content=\(\s*"(.+?)"\s*\)', text, re.S)
    if match:
        return match.group(1).strip()
    return "Not found."


def extract_tools() -> list[tuple[str, str]]:
    results = []
    for file in TOOLS_DIR.glob("*.py"):
        src = file.read_text(encoding="utf-8")
        tree = ast.parse(src)
        for node in tree.body:
            if isinstance(node, ast.FunctionDef):
                has_tool_decorator = any(
                    isinstance(d, ast.Name)
                    and d.id == "tool"
                    or (isinstance(d, ast.Attribute) and d.attr == "tool")
                    for d in node.decorator_list
                )
                if has_tool_decorator:
                    doc = ast.get_docstring(node) or "No description."
                    results.append((node.name, doc.strip()))
    return results


def main():
    system_prompt = extract_system_prompt()
    tools = extract_tools()

    lines = []
    lines.append("# Finance Agent Design\n")
    lines.append("This document is auto-generated from code.\n")
    lines.append("\n---\n\n## System Prompt\n")
    lines.append("```\n" + system_prompt + "\n```\n")
    lines.append("\n---\n\n## Tools\n")

    for name, doc in tools:
        lines.append(f"### `{name}`\n")
        lines.append(doc + "\n\n---\n")

    OUTPUT_FILE.write_text("\n".join(lines), encoding="utf-8")
    print(f"Documentation generated at {OUTPUT_FILE}")


if __name__ == "__main__":
    main()

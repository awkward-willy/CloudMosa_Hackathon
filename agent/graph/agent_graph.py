from __future__ import annotations
import os, time, uuid
from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from state import AgentState
from tools.tx_loader import load_csv
from tools.advisor import Advisor

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
model_id = os.getenv("MODEL_ID", "gemini-1.5-flash")

llm = ChatGoogleGenerativeAI(
    model=model_id,
    google_api_key=api_key,
    temperature=0.2
)

def load_node(state: AgentState) -> AgentState:
    path = state.get("dataset_path") or "data/sample_transactions.csv"
    df = load_csv(path)
    state["_df"] = df
    # log as ToolMessage
    state["messages"].append(
        ToolMessage(
            content=f"Loaded dataset {path} with {len(df)} rows.",
            tool_call_id=str(uuid.uuid4())
        )
    )
    return state

def advise_node(state: AgentState) -> AgentState:
    df = state.get("_df")
    advisor = Advisor()
    metrics = advisor.analyze(df)
    baseline_tips = advisor.advise(metrics)

    # log baseline rule-based advice as ToolMessage
    state["messages"].append(
        ToolMessage(
            content=f"Baseline advice: {baseline_tips}",
            tool_call_id=str(uuid.uuid4())
        )
    )

    system = "You are a concise financial coach. Use bullet points. Maximum 120 words."
    user = (
        "Based on the following metrics, provide 3-5 specific budgeting suggestions "
        "(mention percentages or amounts if possible):\n"
        f"{metrics}\n\n"
        f"Rule-based baseline advice:\n{baseline_tips}"
    )

    text = llm.invoke([
        {"role": "system", "content": system},
        {"role": "user", "content": user}
    ]).content

    state["messages"].append(AIMessage(content=text))
    state["last_response"] = text
    return state

def build_graph() -> StateGraph:
    g = StateGraph(AgentState)
    g.add_node("load", load_node)
    g.add_node("advise", advise_node)
    g.add_edge(START, "load")
    g.add_edge("load", "advise")
    g.add_edge("advise", END)
    return g

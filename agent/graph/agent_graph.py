import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from state import AgentState
from tools.tx_loader import load_csv
from tools.advisor import Advisor

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
model_id = os.getenv("MODEL_ID", "gemini-1.5-flash")

llm = ChatGoogleGenerativeAI(
    model=model_id,
    google_api_key=api_key,
    convert_system_message_to_human=True,  # Gemini 不支援 system role，這樣能把 system 當作第一則 user
    temperature=0.2
)

def load_node(state: AgentState) -> AgentState:
    path = state.get("dataset_path") or "data/sample_transactions.csv"
    df = load_csv(path)
    state["_df"] = df
    return state

def advise_node(state: AgentState) -> AgentState:
    df = state.get("_df")
    advisor = Advisor()
    metrics = advisor.analyze(df)
    baseline_tips = advisor.advise(metrics)

    system = "你是簡潔的理財教練，繁體中文、最多120字，條列3-5點。"
    user = (
        "根據以下指標提供具體建議（盡量含百分比或金額）：\n"
        f"{metrics}\n\n"
        f"現有規則建議（可參考並優化措辭）：\n{baseline_tips}"
    )

    text = llm.invoke([{"role":"system","content":system},
                       {"role":"user","content":user}]).content
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

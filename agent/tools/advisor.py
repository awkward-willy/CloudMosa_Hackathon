from __future__ import annotations
from typing import List, Dict, Any
from langchain_core.tools import tool

# 直接沿用 tx_ingest.py 的 Transaction，確保 schema 一致
from tools.tx_ingest import Transaction


def _summarize(records: List[Transaction]) -> Dict[str, Any]:
    # 轉成原生 dict 方便運算
    rows = [r.model_dump() for r in records]

    income_total = sum(r.get("amount", 0) for r in rows if r.get("income"))
    expense_total = sum(r.get("amount", 0) for r in rows if not r.get("income"))
    net = income_total - expense_total
    savings_rate = (net / income_total * 100.0) if income_total > 0 else 0.0

    # 依 type 聚合支出
    expense_by_type: Dict[str, float] = {}
    for r in rows:
        if not r.get("income"):
            t = r.get("type") or "Other"
            expense_by_type[t] = expense_by_type.get(t, 0.0) + float(r.get("amount", 0))

    top_expense_types = dict(
        sorted(expense_by_type.items(), key=lambda kv: kv[1], reverse=True)
    )

    summary = {
        "income_total": round(float(income_total), 2),
        "expense_total": round(float(expense_total), 2),
        "net": round(float(net), 2),
        "savings_rate_pct": round(float(savings_rate), 1),
        "top_expense_types": top_expense_types,
    }

    # 規則型建議
    advice: List[str] = []
    if savings_rate < 20:
        advice.append("Your savings rate is below 20%. Automate transfers to savings (start with 10%).")
    if expense_total > income_total:
        advice.append("Expenses exceed income. Cut non-essential categories by 20–30%.")
    if top_expense_types:
        top3 = list(top_expense_types.items())[:3]
        advice.append("Focus on top expense types: " + ", ".join(f"{k} ({round(v,2)})" for k, v in top3))
    if not advice:
        advice.append("Maintain current savings habit and review categories monthly.")

    return {"summary": summary, "advice": advice}


@tool
def analyze_transactions(records: List[Transaction]) -> Dict[str, Any]:
    """Analyze transactions (array of Transaction) and return summary + advice."""
    if not isinstance(records, list) or not records:
        return {"summary": {}, "advice": ["No records provided."]}
    return _summarize(records)

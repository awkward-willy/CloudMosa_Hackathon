from typing import Dict, List
import pandas as pd

class Advisor:
    def analyze(self, df: pd.DataFrame) -> Dict[str, float]:
        income = df.loc[df["amount"] > 0, "amount"].sum()
        expense = -df.loc[df["amount"] < 0, "amount"].sum()
        savings = income - expense
        sr = (savings / income) if income > 0 else 0.0
        by_cat = df.groupby("category")["amount"].sum().to_dict()
        metrics = {
            "income": float(income),
            "expense": float(expense),
            "savings": float(savings),
            "savings_rate": float(sr),
        }
        for k, v in by_cat.items():
            metrics[f"cat::{k}"] = float(v)
        return metrics

    def advise(self, m: Dict[str, float]) -> List[str]:
        tips: List[str] = []
        sr = m.get("savings_rate", 0.0)
        if sr < 0.2:
            tips.append(f"儲蓄率 {sr:.1%} 低於 20% 目標，先設定自動轉存 10%。")
        if -m.get("cat::Food", 0.0) > 0.25 * m.get("expense", 1):
            tips.append("餐飲支出 >25%，改週預算上限 + 大賣場採買，先降 10%。")
        if -m.get("cat::Shopping", 0.0) > 0.15 * m.get("expense", 1):
            tips.append("購物 >15%，設定『30 天冷靜期』與每月上限。")
        return tips

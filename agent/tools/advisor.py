from langchain_core.tools import tool
import pandas as pd

@tool
def analyze_transactions(path: str) -> str:
    """Analyze transactions from CSV and return concise baseline advice."""
    try:
        df = pd.read_csv(path)
        if "amount" not in df.columns:
            return "ERROR: column 'amount' is required"

        income = df[df["amount"] > 0]["amount"].sum()
        expense = -df[df["amount"] < 0]["amount"].sum()
        savings = income - expense
        sr = (savings / income) if income > 0 else -1.0

        tips = []
        if sr < 0.2:
            tips.append(
                f"Savings rate {sr:.1%} is below 20% target. Automate at least 10% transfers."
            )
        if expense > income:
            tips.append("Expenses exceed income. Cut non-essential categories by 20-30%.")
        if not tips:
            tips.append("Finances appear stable. Maintain savings rate >= 20%.")

        return " | ".join(tips)
    except Exception as e:
        return f"ERROR: {e}"

from langchain_core.tools import tool
import pandas as pd

@tool
def load_transactions(path: str) -> str:
    """Load user transaction data from a CSV file and return a short summary."""
    try:
        df = pd.read_csv(path)
        cols = list(df.columns)
        return f"OK: loaded {len(df)} rows; columns={cols}"
    except Exception as e:
        return f"ERROR: {e}"

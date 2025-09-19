import pandas as pd
from pathlib import Path

REQUIRED_COLS = ["date", "description", "category", "amount"]

def load_csv(path: str) -> pd.DataFrame:
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"CSV not found: {p}")
    df = pd.read_csv(p)
    for c in REQUIRED_COLS:
        if c not in df.columns:
            raise ValueError(f"Missing column: {c}")
    df["date"] = pd.to_datetime(df["date"])
    df["amount"] = df["amount"].astype(float)
    return df

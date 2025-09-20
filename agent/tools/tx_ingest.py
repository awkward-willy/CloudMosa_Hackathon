from __future__ import annotations

from typing import List

from langchain_core.tools import tool
from pydantic import BaseModel, Field


class Transaction(BaseModel):
    income: bool = Field(..., description="True if this is income, False if expense")
    description: str = Field(..., description="Short description of the transaction")
    amount: float = Field(..., description="Transaction amount")
    type: str = Field(..., description="Category, e.g. Rent, Food, Salary")


@tool
def ingest_transactions(records: List[Transaction]) -> str:
    """Ingest transaction records from a JSON array of Transaction objects."""
    if not records:
        return "OK: loaded 0 rows; columns=[]"
    sample_keys = list(records[0].model_dump().keys())
    return f"OK: loaded {len(records)} rows; columns={sample_keys}"

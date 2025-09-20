from typing import List, Literal

from pydantic import BaseModel, Field


# Data Models
class Transaction(BaseModel):
    """Transaction data model."""

    income: bool = Field(
        ..., description="Whether this is income (True) or expense (False)"
    )
    description: str = Field(..., description="Description of the transaction")
    amount: float = Field(..., gt=0, description="Amount in dollars (must be positive)")
    type: str = Field(
        ..., description="Category of transaction (e.g., 'food', 'transportation')"
    )


# Request Models
class GetDailyTipRequest(BaseModel):
    """Request model for getting a daily financial tip."""

    user_uuid: str = Field(..., description="Unique identifier for the user")


class GetFinancialAdviceRequest(BaseModel):
    """Request model for getting personalized financial advice."""

    user_uuid: str = Field(..., description="Unique identifier for the user")
    transactions: List[Transaction] = Field(
        ..., description="List of user's transactions"
    )
    output_format: Literal["text", "audio"] = Field(
        default="text", description="Output format: 'text' for plain text or 'audio' for voice"
    )

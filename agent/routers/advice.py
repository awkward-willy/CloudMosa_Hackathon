from fastapi import APIRouter, HTTPException

from models import AdviceModel, TransactionModel
from schemas import GetFinancialAdviceRequest

router = APIRouter(prefix="/api", tags=["advice"])


@router.post("/advice")
async def get_financial_advice(request: GetFinancialAdviceRequest) -> str:
    """
    Generate personalized financial advice based on user's transaction records.

    This endpoint analyzes the user's spending patterns and financial behavior
    to provide tailored recommendations for improving their financial health.

    Args:
        request: Request containing user UUID and list of transactions

    Returns:
        str: Personalized financial advice as plain text

    Raises:
        HTTPException: If transaction validation fails or advice generation fails
    """
    try:
        # Convert Pydantic models to dictionary format for processing
        transactions_dict = TransactionModel.convert_to_dict_list(request.transactions)

        # Validate transaction data structure
        if not TransactionModel.validate_transactions(transactions_dict):
            raise HTTPException(
                status_code=400,
                detail="Invalid transaction data: transactions must have positive amounts and required fields",
            )

        # Generate advice using the business logic model
        advice = AdviceModel.generate_financial_advice(
            request.user_uuid, transactions_dict
        )

        if not advice:
            raise HTTPException(status_code=500, detail="Failed to generate advice")

        return advice

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate advice: {str(e)}"
        )

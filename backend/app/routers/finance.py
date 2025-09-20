import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import TransactionRepository
from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.schemas import GetFinancialAdviceRequest

router = APIRouter()


@router.get("/tip")
async def get_tip():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://agent/api/tip")
            response.raise_for_status()
            tip_text = response.text
            return {"tip": tip_text if tip_text else "No tip available"}
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Error fetching tip: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.post("/advice")
async def get_financial_advice(
    request: GetFinancialAdviceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> str:
    """
    Generate personalized financial advice based on user's recent transaction records.

    This endpoint queries the database for recent transactions and forwards them
    to the agent service to get financial advice.

    Args:
        request: Request containing the number of recent days to analyze

    Returns:
        str: Personalized financial advice as plain text

    Raises:
        HTTPException: If the agent service call fails or database query fails
    """
    try:
        # Get recent transactions from database
        transaction_repo = TransactionRepository(db)
        recent_transactions = await transaction_repo.get_recent_transactions_by_user(
            user_id=current_user.id, days=request.days
        )

        # Convert transactions to the format expected by the agent
        transaction_data = [
            {
                "income": transaction.income,
                "description": transaction.description,
                "amount": float(transaction.amount),
                "type": transaction.type,
            }
            for transaction in recent_transactions
        ]

        # Prepare request data for agent service
        agent_request_data = {
            "user_uuid": str(current_user.id),
            "transactions": transaction_data,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://agent/api/advice", json=agent_request_data
            )
            response.raise_for_status()
            advice_text = response.text
            return advice_text if advice_text else "No advice available"

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching advice: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.crud import TransactionRepository
from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.schemas import FinancialAdviceResponse, GetFinancialAdviceRequest

router = APIRouter()


@router.post("/tip")
async def get_tip(current_user: User = Depends(get_current_user)):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.agent_base_url}/api/tip",
                json={"user_uuid": str(current_user.id)},
            )
            response.raise_for_status()
            tip_text = response.text
            return {"tip": tip_text if tip_text else "No tip available"}
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Error fetching tip: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.post("/advice", response_model=None)
async def get_financial_advice(
    request: GetFinancialAdviceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate personalized financial advice based on user's recent transaction records.

    This endpoint queries the database for recent transactions and forwards them
    to the agent service to get financial advice.

    Args:
        request: Request containing the number of recent days to analyze and output format

    Returns:
        JSON response for text format or Response with audio binary data

    Raises:
        HTTPException: If the agent service call fails or database query fails
    """
    try:
        # Get recent transactions from database
        transaction_repo = TransactionRepository(db)
        recent_transactions = await transaction_repo.get_recent_transactions_by_user(
            user_id=current_user.id, days=request.days
        )

        # Limit the number of transactions
        recent_transactions = recent_transactions[:50]

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
            "output_format": request.output_format,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.agent_base_url}/api/advice",
                json=agent_request_data,
                timeout=120,
            )
            response.raise_for_status()

            if request.output_format == "audio":
                # Return audio binary data with appropriate content type
                return Response(
                    content=response.content,
                    media_type="audio/mpeg",
                    headers={"Content-Disposition": "attachment; filename=advice.mp3"},
                )
            else:
                # Return text response as JSON
                advice_text = response.text
                return FinancialAdviceResponse(
                    advice=advice_text if advice_text else "No advice available"
                )

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching advice: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

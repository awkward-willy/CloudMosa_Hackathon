import httpx
from fastapi import APIRouter, HTTPException

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
async def get_financial_advice(request: GetFinancialAdviceRequest) -> str:
    """
    Generate personalized financial advice based on user's transaction records.

    This endpoint forwards the request to the agent service to get financial advice.

    Args:
        request: Request containing user UUID and list of transactions

    Returns:
        str: Personalized financial advice as plain text

    Raises:
        HTTPException: If the agent service call fails
    """
    async with httpx.AsyncClient() as client:
        try:
            # Convert request to JSON for the POST call
            request_data = request.model_dump()

            response = await client.post("http://agent/api/advice", json=request_data)
            response.raise_for_status()
            advice_text = response.text
            return advice_text if advice_text else "No advice available"

        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500, detail=f"Error fetching advice: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

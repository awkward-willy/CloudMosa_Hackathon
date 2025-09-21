import logging
import traceback

from fastapi import APIRouter, HTTPException

from models import TipModel
from schemas import GetDailyTipRequest

router = APIRouter(prefix="/api", tags=["tips"])


@router.post("/tip")
async def get_daily_tip(request: GetDailyTipRequest) -> str:
    """
    Generate a daily financial tip for the user.

    This endpoint provides personalized financial tips to help users
    improve their financial habits and knowledge.

    Args:
        request: Request containing user UUID

    Returns:
        str: Generated financial tip as plain text

    Raises:
        HTTPException: If tip generation fails
    """
    try:
        # Generate tip using the business logic model
        tip = TipModel.generate_daily_tip(request.user_uuid)
        return tip

    except Exception as e:
        logging.error(f"500 Error in get_daily_tip: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to generate tip: {str(e)}")

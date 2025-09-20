import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/tips")
async def get_tip():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://agent/api/tip")
            response.raise_for_status()
            data = response.json()
            return {"tip": data.get("tip", "No tip available")}
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Error fetching tip: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

import os
import requests
from typing import Union

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from models import AdviceModel, TransactionModel
from schemas import GetFinancialAdviceRequest

router = APIRouter(prefix="/api", tags=["advice"])


@router.post("/advice", response_model=None)
async def get_financial_advice(request: GetFinancialAdviceRequest):
    """
    Generate personalized financial advice based on user's transaction records.

    This endpoint analyzes the user's spending patterns and financial behavior
    to provide tailored recommendations for improving their financial health.

    Args:
        request: Request containing user UUID, list of transactions, and output format

    Returns:
        For text format: JSON string containing the advice text
        For audio format: Response object with MP3 audio content

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

        # Return text format
        if request.output_format == "text":
            return advice

        # Generate audio format using UnrealSpeech API
        try:
            api_key = os.getenv("TTS_API_KEY")
            if not api_key:
                raise HTTPException(
                    status_code=500,
                    detail="TTS_API_KEY not found in environment variables"
                )

            # Prepare the request to UnrealSpeech API
            url = "https://api.v8.unrealspeech.com/speech"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "Text": advice,
                "VoiceId": "Sierra",
                "Bitrate": "320k",
                "AudioFormat": "mp3",
                "OutputFormat": "uri",
                "TimestampType": "sentence",
                "sync": False,
            }

            # Make the API request
            response = requests.post(url, json=payload, headers=headers, timeout=60)
            response.raise_for_status()

            # UnrealSpeech returns JSON with audio URL or direct audio content
            response_data = response.json()

            if "AudioContent" in response_data:
                raise Exception("Unexpected response format from UnrealSpeech API")
            audio_response = requests.get(response_data["OutputUri"], timeout=60)
            audio_response.raise_for_status()
            audio_content = audio_response.content

            # Return the audio content as a response
            return Response(
                content=audio_content,
                media_type="audio/mpeg",
                headers={"Content-Disposition": f"attachment; filename=advice_{request.user_uuid}.mp3"}
            )

        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to call UnrealSpeech API: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate audio: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate advice: {str(e)}"
        )

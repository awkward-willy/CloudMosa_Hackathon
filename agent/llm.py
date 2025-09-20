import os

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load .env once
load_dotenv()


def get_llm(temperature: float = 0.2):
    model_id = os.getenv("MODEL_ID", "gemini-1.5-flash")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    return ChatGoogleGenerativeAI(
        model=model_id,
        google_api_key=api_key,
        temperature=temperature,
    )

import logging
import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from routers import advice_router, tips_router

# FastAPI app with enhanced metadata
app = FastAPI(
    title="Finance Agent API",
    description="Personal finance assistant with daily tips and transaction advice",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Include routers
app.include_router(tips_router)
app.include_router(advice_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"500 Error: {str(exc)}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )


@app.get("/")
async def get_api_info():
    """
    Root endpoint providing API information and available endpoints.

    Returns:
        dict: Simple API metadata and endpoint information
    """
    return {
        "message": "Finance Agent API is running",
        "version": "1.0.0",
        "endpoints": {
            "tip": "POST /api/tip",
            "advice": "POST /api/advice",
            "health": "GET /health",
            "docs": "GET /docs",
        },
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify service availability.

    Returns:
        dict: Simple health status
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    print("\n=== Finance Agent FastAPI Server ===")
    print("Starting server at http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("Alternative docs: http://localhost:8000/redoc")
    print("Health check: http://localhost:8000/health")
    print("\nEndpoints:")
    print("- POST /api/tip - Get daily financial tip")
    print("- POST /api/advice - Get personalized advice based on transactions")
    print("\nPress Ctrl+C to stop the server")

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

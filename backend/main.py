import uvicorn

from app.main import app


def main():
    """Run the FastAPI application"""
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug",
    )


if __name__ == "__main__":
    main()

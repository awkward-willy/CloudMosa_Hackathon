from fastapi import FastAPI

from app.routers import health

app = FastAPI(
    title="CloudMosa Backend API",
    version="0.1.0",
    description="FastAPI backend for MeiChu Hackathon",
)

# Include routers
app.include_router(health.router)

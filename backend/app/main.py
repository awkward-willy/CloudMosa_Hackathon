from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.database import create_tables
from app.routers import auth, health, transactions, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_tables()
    yield
    # Shutdown
    # Add cleanup code here if needed


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description=(
        "FastAPI backend for personal finance tracking with "
        "email authentication"
    ),
    lifespan=lifespan,
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(transactions.router)


@app.get("/")
async def root():
    return {"message": "Personal Finance API is running"}

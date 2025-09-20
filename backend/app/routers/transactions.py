import math
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import TransactionRepository
from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.schemas import (
    PaginatedTransactions,
    PaginationMetadata,
    Transaction,
    TransactionCreate,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=Transaction)
async def create_transaction(
    transaction: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction_repo = TransactionRepository(db)
    return await transaction_repo.create_transaction(
        user_id=current_user.id, transaction=transaction
    )


@router.get("/", response_model=PaginatedTransactions)
async def read_transactions(
    page: int = Query(1, ge=1, description="Page number starting from 1"),
    page_size: int = Query(
        10, ge=1, le=100, description="Number of items per page (max 100)"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction_repo = TransactionRepository(db)

    # Convert page/page_size to skip/limit
    skip = (page - 1) * page_size

    # Get transactions and total count
    transactions = await transaction_repo.get_transactions_by_user(
        user_id=current_user.id, skip=skip, limit=page_size
    )
    total_count = await transaction_repo.get_transactions_count_by_user(
        user_id=current_user.id
    )

    # Calculate pagination metadata
    total_pages = math.ceil(total_count / page_size) if total_count > 0 else 0
    has_next = page < total_pages
    has_previous = page > 1

    metadata = PaginationMetadata(
        page=page,
        page_size=page_size,
        total_items=total_count,
        total_pages=total_pages,
        has_next=has_next,
        has_previous=has_previous,
    )

    # Convert SQLAlchemy models to Pydantic schemas
    transaction_schemas = [
        Transaction.model_validate(transaction) for transaction in transactions
    ]

    return PaginatedTransactions(items=transaction_schemas, metadata=metadata)


@router.get("/{transaction_id}", response_model=Transaction)
async def read_transaction(
    transaction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction_repo = TransactionRepository(db)
    db_transaction = await transaction_repo.get_transaction_by_id(
        transaction_id=transaction_id, user_id=current_user.id
    )
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction


@router.delete("/{transaction_id}", response_model=Transaction)
async def delete_transaction(
    transaction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction_repo = TransactionRepository(db)
    db_transaction = await transaction_repo.delete_transaction(
        transaction_id=transaction_id, user_id=current_user.id
    )
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

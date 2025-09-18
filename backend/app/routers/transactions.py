import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import TransactionRepository
from app.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.schemas import Transaction, TransactionCreate, TransactionUpdate

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


@router.get("/", response_model=List[Transaction])
async def read_transactions(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction_repo = TransactionRepository(db)
    return await transaction_repo.get_transactions_by_user(
        user_id=current_user.id, skip=skip, limit=limit
    )


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


@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: uuid.UUID,
    transaction: TransactionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction_repo = TransactionRepository(db)
    db_transaction = await transaction_repo.update_transaction(
        transaction_id=transaction_id,
        transaction_update=transaction,
        user_id=current_user.id,
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

import uuid

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models import Transaction, User
from app.schemas import TransactionCreate, TransactionUpdate, UserCreate
from app.security import get_password_hash


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str):
        result = await self.db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get_user_by_username(self, username: str):
        result = await self.db.execute(select(User).filter(User.username == username))
        return result.scalars().first()

    async def get_user_by_id(self, user_id: uuid.UUID):
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result.scalars().first()

    async def create_user(self, user: UserCreate):
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=get_password_hash(user.password),
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user


class TransactionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_transaction(
        self, user_id: uuid.UUID, transaction: TransactionCreate
    ) -> Transaction:
        db_transaction = Transaction(**transaction.model_dump(), user_id=user_id)
        self.db.add(db_transaction)
        await self.db.commit()
        await self.db.refresh(db_transaction)
        return db_transaction

    async def get_transaction_by_id(
        self, transaction_id: uuid.UUID, user_id: uuid.UUID
    ) -> Transaction | None:
        result = await self.db.execute(
            select(Transaction).filter(
                Transaction.id == transaction_id, Transaction.user_id == user_id
            )
        )
        return result.scalars().first()

    async def get_transactions_by_user(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> list[Transaction]:
        result = await self.db.execute(
            select(Transaction)
            .filter(Transaction.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(Transaction.time.desc())  # Order by most recent first
        )
        return list(result.scalars().all())

    async def get_transactions_count_by_user(self, user_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count(Transaction.id)).filter(Transaction.user_id == user_id)
        )
        return result.scalar() or 0

    async def update_transaction(
        self,
        transaction_id: uuid.UUID,
        transaction_update: TransactionUpdate,
        user_id: uuid.UUID,
    ) -> Transaction | None:
        db_transaction = await self.get_transaction_by_id(transaction_id, user_id)
        if db_transaction:
            update_data = transaction_update.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_transaction, key, value)
            await self.db.commit()
            await self.db.refresh(db_transaction)
        return db_transaction

    async def delete_transaction(
        self, transaction_id: uuid.UUID, user_id: uuid.UUID
    ) -> Transaction | None:
        db_transaction = await self.get_transaction_by_id(transaction_id, user_id)
        if db_transaction:
            await self.db.delete(db_transaction)
            await self.db.commit()
        return db_transaction

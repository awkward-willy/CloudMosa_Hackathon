import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr


# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    username: str
    password: str


# Transaction schemas
class TransactionBase(BaseModel):
    income: bool
    description: str
    amount: float
    type: str


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    income: Optional[bool] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None


class Transaction(TransactionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    time: datetime

    model_config = ConfigDict(from_attributes=True)


# Pagination schemas
class PaginationMetadata(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool


class PaginatedTransactions(BaseModel):
    items: list[Transaction]
    metadata: PaginationMetadata


# Financial advice schemas
class GetFinancialAdviceRequest(BaseModel):
    user_uuid: uuid.UUID
    days: int
    output_format: Literal["text", "audio"]


class FinancialAdviceResponse(BaseModel):
    advice: str

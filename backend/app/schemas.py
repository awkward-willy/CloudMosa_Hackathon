import uuid
from datetime import datetime
from typing import Optional

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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import UserRepository
from app.database import get_db
from app.schemas import User, UserCreate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=User)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    user_repo = UserRepository(db)
    db_user = await user_repo.get_user_by_email(email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = await user_repo.get_user_by_username(username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return await user_repo.create_user(user=user)

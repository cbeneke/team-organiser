from fastapi import APIRouter, Depends
from typing import Annotated
from sqlalchemy.orm import Session

from src.database import get_db

from src.users.schemas import ResponseUser
from src.users.dependencies import get_current_active_user, get_user, get_all_users
from src.users.service import delete_user, update_user


router = APIRouter()

@router.get("/", response_model=list[ResponseUser])
async def read_users(
    users: Annotated[list[ResponseUser], Depends(get_all_users)]
):
    return users

@router.get("/me", response_model=ResponseUser)
async def read_users_me(
    current_user: Annotated[ResponseUser, Depends(get_current_active_user)]
):
    return current_user

@router.get("/{user_id}", response_model=ResponseUser)
async def read_user(
    user: Annotated[ResponseUser, Depends(get_user)]
):
    return user

@router.delete("/{user_id}")
async def drop_user(
    user: Annotated[ResponseUser, Depends(get_user)],
    db: Session = Depends(get_db)
):
    delete_user(user.id, db)
    return {}

@router.post("/{user_id}", response_model=ResponseUser)
async def update_user(
    user: Annotated[ResponseUser, Depends(get_user)]
):
    user = update_user(user.id, user.password)
    return user

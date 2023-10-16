from fastapi import APIRouter, Depends, Form
from typing import Annotated
from sqlalchemy.orm import Session

from src.database import get_db

from src.users.schemas import ResponseUser
from src.users.dependencies import get_current_active_user, get_user, get_all_users, is_trainer
from src.users.service import delete_user, update_user


router = APIRouter()

@router.get("/", response_model=list[ResponseUser])
async def router_get_all_user(
    _: Annotated[bool, Depends(is_trainer)],
    users: Annotated[list[ResponseUser], Depends(get_all_users)]
):
    return users

@router.get("/me", response_model=ResponseUser)
async def router_get_my_user(
    current_user: Annotated[ResponseUser, Depends(get_current_active_user)]
):
    return current_user

@router.get("/{user_id}", response_model=ResponseUser)
async def router_get_user(
    _: Annotated[bool, Depends(is_trainer)],
    user: Annotated[ResponseUser, Depends(get_user)]
):
    return user

@router.delete("/{user_id}")
async def router_delete_user(
    _: Annotated[bool, Depends(is_trainer)],
    user: Annotated[ResponseUser, Depends(get_user)],
    db: Session = Depends(get_db)
):
    delete_user(user.id, db)
    return {}

@router.post("/{user_id}", response_model=ResponseUser)
async def router_update_user(
    _: Annotated[bool, Depends(is_trainer)],
    user: Annotated[ResponseUser, Depends(get_user)],
    password: Annotated[str, Form()],
    is_trainer: Annotated[bool, Form()],
    db: Session = Depends(get_db),
):
    new_password = password if password else user.password
    user = update_user(user.id, new_password, is_trainer, db)
    return user

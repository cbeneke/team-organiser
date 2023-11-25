from fastapi import APIRouter, Depends
from typing import Annotated
from sqlalchemy.orm import Session

from src.database import get_db

from src.users.schemas import ResponseUser, UpdateUser
from src.users.dependencies import (
    get_current_active_user,
    get_user,
    get_all_users,
    get_current_active_admin_user,
)
from src.users.service import delete_user, update_user, is_owner_or_admin
from src.users.exceptions import AccessDenied


router = APIRouter()


@router.get("/", response_model=list[ResponseUser])
async def router_get_all_user(
    users: Annotated[list[ResponseUser], Depends(get_all_users)],
    admin: ResponseUser = Depends(get_current_active_admin_user),
):
    return users


@router.get("/me", response_model=ResponseUser)
async def router_get_my_user(
    current_user: Annotated[ResponseUser, Depends(get_current_active_user)]
):
    return current_user


@router.get("/{user_id}", response_model=ResponseUser)
async def router_get_user(
    user: Annotated[ResponseUser, Depends(get_user)],
    admin: ResponseUser = Depends(get_current_active_admin_user),
):
    return user


@router.delete("/{user_id}")
async def router_delete_user(
    user: Annotated[ResponseUser, Depends(get_user)],
    actor: ResponseUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not is_owner_or_admin(actor, user, db):
        raise AccessDenied
    
    delete_user(user.id, db)
    return {}


@router.put("/{user_id}", response_model=ResponseUser)
async def router_update_user(
    user: Annotated[ResponseUser, Depends(get_user)],
    updateUser: UpdateUser,
    actor: ResponseUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not is_owner_or_admin(actor, user, db):
        raise AccessDenied
    
    # Return user if no update is requested
    if updateUser.password is None and updateUser.is_trainer is None:
        return user

    user = update_user(user, updateUser.password, updateUser.is_trainer, db)
    return user
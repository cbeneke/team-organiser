from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session
from uuid import UUID

from src.database import get_db

from src.users.models import DBUser
from src.users.utils import (
    get_db_user,
    get_db_user_by_id,
    get_all_db_users,
    get_db_role,
)
from src.users.exceptions import UserInactive, UserNotFound, AccessDenied
from src.users.schemas import RoleName

from src.auth.dependencies import get_username_from_token
from src.auth.exceptions import InvalidToken


async def get_all_users(
    db: Session = Depends(get_db),
):
    users = get_all_db_users(db)
    return users


async def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
):
    user = get_db_user_by_id(user_id, db)
    if user is None:
        raise UserNotFound
    return user


async def get_current_user(
    username: Annotated[str, Depends(get_username_from_token)],
    db: Session = Depends(get_db),
):
    user = get_db_user(username, db)
    if user is None:
        raise InvalidToken
    return user


async def get_current_active_user(
    current_user: Annotated[DBUser, Depends(get_current_user)]
):
    if not current_user.is_active:
        raise UserInactive
    
    return current_user


async def get_current_active_admin_user(
    user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    trainer_role = get_db_role(RoleName.trainer, db)
    if trainer_role not in user.roles:
        raise AccessDenied

    return user

from fastapi import APIRouter, Depends
from typing import Annotated
from sqlalchemy.orm import Session

from src.database import get_db
from src.utils import all_fields_are_none

from src.users.models import DBUser
from src.users.schemas import ResponseUser, UpdateUser
from src.users.dependencies import (
    get_current_active_user,
    get_user,
    get_all_users,
    get_current_active_admin_user,
)
from src.users.service import delete_user, update_user
from src.users.utils import (is_admin_or_self, is_admin)
from src.users.exceptions import AccessDenied

from src.events.schemas import ResponseEvent
from src.events.models import DBEventResponses


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
    if not is_admin_or_self(actor, user, db):
        raise AccessDenied

    delete_user(user.id, db)
    return {}


@router.put("/{user_id}", response_model=ResponseUser)
async def router_update_user(
    user: Annotated[ResponseUser, Depends(get_user)],
    update: UpdateUser,
    actor: ResponseUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not is_admin_or_self(actor, user, db):
        raise AccessDenied

    if update.is_admin is not None and not is_admin(actor, user, db):
        raise AccessDenied

    # Return user without update if no update is requested
    if all_fields_are_none(update):
        return user

    user = update_user(user, update.display_name, update.password, update.is_admin, db)
    return user


@router.get("/{user_id}/events", response_model=list[ResponseEvent])
async def router_get_user_events(
    user: Annotated[ResponseUser, Depends(get_user)],
    actor: ResponseUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not is_admin_or_self(actor, user, db):
        raise AccessDenied

    responses = db.query(DBEventResponses).filter(DBEventResponses.user == user).all()
    # TODO this can probably be more efficient
    events = [response.event for response in responses]

    return events

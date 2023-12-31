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
)
from src.users.service import update_user
from src.users.utils import (is_admin_or_self, is_admin)
from src.users.exceptions import AccessDenied

from src.events.schemas import ResponseEvent
from src.events.models import (DBEventResponses, DBEvents)


router = APIRouter()


@router.get("/", response_model=list[ResponseUser])
async def router_get_all_user(
    actor: ResponseUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return db.query(DBUser).order_by(DBUser.username).all()


@router.get("/me", response_model=ResponseUser)
async def router_get_my_user(
    actor: ResponseUser = Depends(get_current_active_user),
):
    return actor


@router.get("/{user_id}", response_model=ResponseUser)
async def router_get_user(
    user: ResponseUser = Depends(get_user),
    actor: ResponseUser = Depends(get_current_active_user),
):
    return user


@router.delete("/{user_id}")
async def router_delete_user(
    user: ResponseUser = Depends(get_user),
    actor: ResponseUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not is_admin_or_self(actor, user, db):
        raise AccessDenied

    db.delete(user)
    db.query(DBEventResponses).filter(DBEventResponses.user == user).delete()
    db.commit()

    return {}


@router.put("/{user_id}", response_model=ResponseUser)
async def router_update_user(
    update: UpdateUser,
    user: ResponseUser = Depends(get_user),
    actor: ResponseUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not is_admin_or_self(actor, user, db):
        raise AccessDenied

    if update.is_admin is not None and not is_admin(actor, db):
        raise AccessDenied

    # Return user without update if no update is requested
    if all_fields_are_none(update):
        return user

    user = update_user(user, update.display_name, update.password, update.is_admin, db)
    return user


@router.get("/{user_id}/events", response_model=list[ResponseEvent])
async def router_get_user_events(
    user: ResponseUser = Depends(get_user),
    actor: ResponseUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not is_admin_or_self(actor, user, db):
        raise AccessDenied

    responses = db.query(DBEventResponses).filter(DBEventResponses.user == user).all()

    # TODO this can probably be done more efficiently
    events = [response.event for response in responses if response.event]

    return events

from fastapi import APIRouter, Depends, Form, status
from typing import Annotated, Optional
from sqlalchemy.orm import Session
from datetime import date

from src.database import get_db
from src.utils import all_fields_are_none

from src.events.models import DBEvents
from src.events.schemas import ResponseEvent, NewEvent, UpdateEvent
from src.events.dependencies import get_event
from src.events.service import add_event, update_event
from src.events.utils import parse_timerange

from src.users.dependencies import get_current_active_user
from src.users.exceptions import AccessDenied
from src.users.models import DBUser
from src.users.utils import is_admin_or_owner

router = APIRouter()


@router.get("/", response_model=list[ResponseEvent])
async def router_get_events(
    start_date: Optional[Annotated[date, Form()]] = None,
    end_date: Optional[Annotated[date, Form()]] = None,
    user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    start_time, end_time = parse_timerange(start_date, end_date)

    events = (
        db.query(DBEvents)
        .filter(DBEvents.start_time <= end_time, DBEvents.end_time >= start_time)
        .order_by(DBEvents.start_time)
        .all()
    )
    return events


@router.post("/", response_model=ResponseEvent, status_code=status.HTTP_201_CREATED)
async def router_add_event(
    event: NewEvent,
    user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    event = add_event(event, user, db)
    return event


@router.get("/{event_id}", response_model=ResponseEvent)
async def router_get_event(
    user: DBUser = Depends(get_current_active_user),
    event: ResponseEvent = Depends(get_event),
):
    return event


@router.delete("/{event_id}")
async def router_delete_event(
    user: DBUser = Depends(get_current_active_user),
    event: ResponseEvent = Depends(get_event),
    db: Session = Depends(get_db),
):
    if not is_admin_or_owner(user, event.owner, db):
        raise AccessDenied

    db.delete(event)
    db.commit()

    return {}


@router.put("/{event_id}", response_model=ResponseEvent)
async def router_update_event(
    update: UpdateEvent,
    db: Session = Depends(get_db),
    event: ResponseEvent = Depends(get_event),
    user: DBUser = Depends(get_current_active_user),
):
    if not is_admin_or_owner(user, event.owner, db):
        raise AccessDenied

    # Return event without update if no update is requested
    if all_fields_are_none(update):
        return event
    
    event = update_event(
        db, event, update.title, update.description, update.start_time, update.end_time, update.display_color
    )
    return event

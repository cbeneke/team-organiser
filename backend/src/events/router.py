from fastapi import APIRouter, Depends, Form, status
from typing import Annotated, Optional, Union
from sqlalchemy.orm import Session
from datetime import date

from src.database import get_db
from src.utils import all_fields_are_none

from src.events.models import DBEvents, DBEventResponses
from src.events.schemas import (
    ResponseEvent,
    NewEvent,
    UpdateEvent,
    ResponseType,
    Response,
)
from src.events.dependencies import get_event
from src.events.service import (
    add_event,
    update_event,
    synchronise_invitees
)
from src.events.utils import parse_timerange
from src.events.exceptions import EventResponseNotFound

from src.users.dependencies import get_current_active_user, get_user
from src.users.exceptions import AccessDenied
from src.users.schemas import ResponseUser
from src.users.utils import is_admin_or_self

router = APIRouter()


@router.get("/", response_model=list[ResponseEvent])
async def router_get_events(
    start_date: Optional[Annotated[date, Form()]] = None,
    end_date: Optional[Annotated[date, Form()]] = None,
    user: ResponseUser = Depends(get_current_active_user),
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
    user: ResponseUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    event = add_event(event, user, db)

    return event


@router.get("/{event_id}", response_model=ResponseEvent)
async def router_get_event(
    user: ResponseUser = Depends(get_current_active_user),
    event: ResponseEvent = Depends(get_event),
):
    return event


@router.delete("/{event_id}")
async def router_delete_event(
    user: ResponseUser = Depends(get_current_active_user),
    event: ResponseEvent = Depends(get_event),
    db: Session = Depends(get_db),
):
    if not is_admin_or_self(user, event.owner, db):
        raise AccessDenied

    db.delete(event)
    db.commit()

    return {}


@router.put("/{event_id}", response_model=ResponseEvent)
async def router_update_event(
    update: UpdateEvent,
    db: Session = Depends(get_db),
    event: ResponseEvent = Depends(get_event),
    user: ResponseUser = Depends(get_current_active_user),
):
    if not is_admin_or_self(user, event.owner, db):
        raise AccessDenied

    # Return event without update if no update is requested
    if all_fields_are_none(update):
        return event

    event = update_event(
        db,
        event,
        update.title,
        update.description,
        update.start_time,
        update.end_time,
        update.display_color,
    )
    if update.invitees:
        synchronise_invitees(db, event, update.invitees)

    return event


@router.put("/{event_id}/respond", response_model=Response)
async def router_set_event_response(
    status: ResponseType,
    db: Session = Depends(get_db),
    event: ResponseEvent = Depends(get_event),
    actor: ResponseUser = Depends(get_current_active_user),
):
    response = (
        db.query(DBEventResponses)
        .filter(DBEventResponses.event == event, DBEventResponses.user == actor)
        .first()
    )
    if not response:
        raise EventResponseNotFound
    
    response.status = status

    db.commit()
    db.refresh(response)

    return response

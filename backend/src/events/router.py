from fastapi import APIRouter, Depends, Form, status
from typing import Annotated, Optional
from sqlalchemy.orm import Session
from datetime import date, timedelta

from src.database import get_db
from src.utils import all_fields_are_none

from src.events.models import DBEvents, DBEventResponses
from src.events.schemas import (
    ResponseEvent,
    NewEvent,
    UpdateEvent,
    ResponseType,
    Response,
    RecurrenceType,
)
from src.events.dependencies import get_event, get_active_event
from src.events.service import (
    add_event,
    add_series,
    update_event,
    update_series,
    set_event_response,
)
from src.events.utils import parse_timerange

from src.users.dependencies import (
    get_current_active_user,
    get_current_active_admin_user,
)
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
        .filter(
            DBEvents.start_time <= end_time,
            DBEvents.end_time >= start_time,
            DBEvents.responses.any(DBEventResponses.user_id == user.id),
        )
        .order_by(DBEvents.start_time)
        .all()
    )
    return events


@router.get("/all", response_model=list[ResponseEvent])
async def router_get_events(
    start_date: Optional[Annotated[date, Form()]] = None,
    end_date: Optional[Annotated[date, Form()]] = None,
    user: ResponseUser = Depends(get_current_active_admin_user),
    db: Session = Depends(get_db),
):
    start_time, end_time = parse_timerange(start_date, end_date)

    events = (
        db.query(DBEvents)
        .filter(
            DBEvents.start_time <= end_time,
            DBEvents.end_time >= start_time,
        )
        .order_by(DBEvents.start_time)
        .all()
    )
    return events


@router.post("/", response_model=ResponseEvent | list[ResponseEvent], status_code=status.HTTP_201_CREATED)
async def router_add_event(
    new: NewEvent,
    user: ResponseUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # TODO: This needs to handle non-weekly recurrences at some point
    match new.recurrence:
        case RecurrenceType.once:
            event = add_event(new, user, db)
        case RecurrenceType.weekly:
            event = add_series(new, user, timedelta(weeks=1), 52, db)

    return event


@router.get("/{event_id}", response_model=ResponseEvent)
async def router_get_event(
    user: ResponseUser = Depends(get_current_active_user),
    event: ResponseEvent = Depends(get_event),
):
    return event


@router.delete("/{event_id}")
async def router_delete_event(
    update_all: bool = False,
    user: ResponseUser = Depends(get_current_active_user),
    event: ResponseEvent = Depends(get_event),
    db: Session = Depends(get_db),
):
    if not is_admin_or_self(user, event.owner, db):
        raise AccessDenied

    is_series = event.series_id is not None

    db.delete(event)
    db.query(DBEventResponses).filter(DBEventResponses.event == event).delete()

    if is_series and update_all:
        events = (
            db.query(DBEvents)
            .filter(
                DBEvents.series_id == event.series_id,
                DBEvents.start_time >= event.start_time,
            )
            .all()
        )
        for e in events:
            db.delete(e)
            db.query(DBEventResponses).filter(DBEventResponses.event == e).delete()

    db.commit()

    return {}


@router.put("/{event_id}", response_model=ResponseEvent | list[ResponseEvent])
async def router_update_event(
    update: UpdateEvent,
    db: Session = Depends(get_db),
    event: ResponseEvent = Depends(get_active_event),
    user: ResponseUser = Depends(get_current_active_user),
):
    if not is_admin_or_self(user, event.owner, db):
        raise AccessDenied

    # Return event without update if no update is requested
    if all_fields_are_none(update):
        return event

    if event.series_id is not None and update.update_all:
        events = update_series(db, event, update)
        return events
    else:
        event = update_event(db, event, update)
        return event


@router.put("/{event_id}/respond", response_model=Response)
async def router_set_event_response(
    status: ResponseType,
    db: Session = Depends(get_db),
    event: ResponseEvent = Depends(get_active_event),
    actor: ResponseUser = Depends(get_current_active_user),
):
    response = set_event_response(db, event, actor, status)

    return response

from fastapi import Depends
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from src.database import get_db

from src.events.models import DBEvents
from src.events.schemas import ResponseEvent
from src.events.exceptions import EventNotFound, EventIsLocked


def get_event(
    event_id: UUID,
    db: Session = Depends(get_db),
) -> ResponseEvent:
    event = db.query(DBEvents).get(event_id)

    if event is None:
        raise EventNotFound

    return event


def get_active_event(
    event: get_event,
) -> ResponseEvent:

    if event.locked_time < datetime.now():
        raise EventIsLocked

    return event

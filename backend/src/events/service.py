from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime

from src.events.models import DBEvents
from src.events.schemas import ResponseEvent, NewEvent
from src.events.exceptions import EventDatesInvalid

from src.users.models import DBUser


def add_event(
    new: NewEvent,
    owner: DBUser,
    db: Session,
):
    if new.start_time >= new.end_time:
        raise EventDatesInvalid

    event = DBEvents(
        title=new.title,
        description=new.description,
        start_time=new.start_time,
        end_time=new.end_time,
        display_color=new.display_color,
        owner=owner,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def update_event(
    db: Session,
    event: ResponseEvent,
    title: Optional[str],
    description: Optional[str],
    start_time: Optional[datetime],
    end_time: Optional[datetime],
    display_color: Optional[str],
) -> ResponseEvent:
    event = db.query(DBEvents).get(event.id)

    event.title = title if title else event.title
    event.description = description if description else event.description
    event.start_time = start_time if start_time else event.start_time
    event.end_time = end_time if end_time else event.end_time
    event.display_color = display_color if display_color else event.display_color

    db.commit()
    db.refresh(event)

    return event


def get_events(db: Session, start_time: datetime, end_time: datetime) -> ResponseEvent:
    return (
        db.query(DBEvents)
        .filter(DBEvents.start_time <= end_time)
        .filter(DBEvents.end_time >= start_time)
        .order_by(DBEvents.start_time)
        .all()
    )

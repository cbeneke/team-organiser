from typing import Optional
from sqlalchemy.orm import Session
from datetime import date, datetime

import src.events.models as models
import src.events.schemas as schemas
import src.events.exceptions as exceptions
import src.events.utils as utils

import src.users.schemas as user_schemas


def get_events(
    start_date: date,
    end_date: date,
    user: user_schemas.ResponseUser,
    db: Session,
) -> list[schemas.ResponseEvent]:
    start_time, end_time = utils.parse_timerange(start_date, end_date)

    events = (db
        .query(models.DBEvents)
        .filter(
            models.DBEvents.start_time <= end_time,
            models.DBEvents.end_time >= start_time
        )
        .order_by(models.DBEvents.start_time)
        .all()
    )

    return events

def add_event(
    new: schemas.NewEvent,
    owner: user_schemas.ResponseUser,
    db: Session,
) -> schemas.ResponseEvent:

    if new.start_time >= new.end_time:
        raise exceptions.EventDatesInvalid

    event = models.DBEvents(
        title=new.title,
        description=new.description,
        start_time=new.start_time,
        end_time=new.end_time,
        owner=owner,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event

def update_event(
    db: Session,
    event: schemas.ResponseEvent,
    title: Optional[str],
    description: Optional[str],
    start_time: Optional[datetime],
    end_time: Optional[datetime],
) -> schemas.ResponseEvent:

    event = db.query(models.DBEvents).get(event.id)
    
    event.title = title if title else event.title
    event.description = description if description else event.description
    event.start_time = start_time if start_time else event.start_time
    event.end_time = end_time if end_time else event.end_time

    db.add(event)
    db.commit()
    db.refresh(event)

    return event

def get_events(
    start_time: datetime,
    end_time: datetime,
    db: Session,
) -> schemas.ResponseEvent:

    return (db
        .query(models.DBEvents)
        .filter(models.DBEvents.start_time <= end_time)
        .filter(models.DBEvents.end_time >= start_time)
        .order_by(models.DBEvents.start_time)
        .all()
    )
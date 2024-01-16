from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime

from src.events.models import DBEvents, DBEventResponses
from src.events.schemas import (
    ResponseEvent,
    NewEvent,
    ResponseType,
)
from src.events.exceptions import EventDatesInvalid, EventResponseNotFound, EventTitleInvalid

from src.users.models import DBUser
from src.users.schemas import ResponseUser
from src.users.utils import is_user_in_list


def add_event(
    new: NewEvent,
    owner: DBUser,
    db: Session,
):
    if new.start_time >= new.end_time:
        raise EventDatesInvalid
    
    if new.title == "":
        raise EventTitleInvalid

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

    if not is_user_in_list(owner, new.invitees):
        new.invitees.append(owner)

    synchronise_invitees(db, event, new.invitees)
    respond_to_event(db, event, owner, ResponseType.accepted)

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
        .filter(DBEvents.start_time <= end_time, DBEvents.end_time >= start_time)
        .order_by(DBEvents.start_time)
        .all()
    )


def respond_to_event(
    db: Session, event: ResponseEvent, user: ResponseUser, status: ResponseType
):
    response = (
        db.query(DBEventResponses)
        .filter(DBEventResponses.event == event, DBEventResponses.user == user)
        .first()
    )
    if not response:
        raise EventResponseNotFound

    response.status = status

    db.commit()
    db.refresh(response)

    return response


def synchronise_invitees(
    db: Session, event: ResponseEvent, invitees: list[ResponseUser]
):
    # Remove old invitees
    for response in event.responses:
        if not is_user_in_list(response.user, invitees):
            db.query(DBEventResponses).filter(
                DBEventResponses.event == event, DBEventResponses.user == response.user
            ).delete()

    # Add new invitees
    current_invitees = [response.user for response in event.responses]
    for invitee in invitees:
        if not is_user_in_list(invitee, current_invitees):
            db_response = DBEventResponses(
                event_id=event.id,
                user_id=invitee.id,
                status=ResponseType.pending,
            )
            db.add(db_response)

    db.commit()
    db.refresh(event)

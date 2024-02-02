from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from src.events.models import DBEvents, DBEventResponses
from src.events.schemas import (
    ResponseEvent,
    NewEvent,
    ResponseType,
    UpdateEvent,
)
from src.events.exceptions import (
    EventDatesInvalid,
    EventResponseNotFound,
    EventTitleInvalid,
)

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
        series_id     = None,
        title         = new.title,
        description   = new.description,
        start_time    = new.start_time,
        end_time      = new.end_time,
        display_color = new.display_color,
        owner         = owner,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    if not is_user_in_list(owner, new.invitees):
        new.invitees.append(owner)

    synchronise_invitees(db, event, new.invitees)
    respond_to_event(db, event, owner, ResponseType.accepted)

    return event

# TODO: This needs to handle non-weekly recurrences at some point
def add_series(event: ResponseEvent, db: Session):
    event = db.query(DBEvents).get(event.id)
    event.series_id = event.id

    # TODO: This needs a refresh endpoint
    for i in range(1, 52):
        new_event = DBEvents(
            series_id     = event.id,
            title         = event.title,
            description   = event.description,
            start_time    = event.start_time + timedelta(weeks=i),
            end_time      = event.end_time + timedelta(weeks=i),
            display_color = event.display_color,
            owner         = event.owner,
        )
        db.add(new_event)

    db.commit()
    db.refresh(event)

def update_event(
    db: Session,
    event: ResponseEvent,
    update: UpdateEvent,
) -> ResponseEvent:
    event = db.query(DBEvents).get(event.id)

    if update.title:
        event.title = update.title

    if update.description:
        event.description = update.description

    if update.start_time:
        event.start_time = update.start_time

    if update.end_time:
        event.end_time = update.end_time
        
    if update.display_color:
        event.display_color = update.display_color
    
    if update.invitees:
        synchronise_invitees(db, event, update.invitees)

    db.commit()
    db.refresh(event)

    return event

def update_series(
    db: Session,
    base: ResponseEvent,
    update: UpdateEvent,
) -> ResponseEvent:

    events = (
        db.query(DBEvents)
        .filter(DBEvents.series_id == base.series_id, DBEvents.start_time >= base.start_time)
        .all()
    )

    for event in events:
        # TODO: Improve DB performance by committing all changes at once
        event = update_event(db, event, update)

    return events


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

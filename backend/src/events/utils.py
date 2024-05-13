from typing import Optional
from datetime import date, datetime
from sqlalchemy.orm import Session

from src.events.schemas import ResponseEvent
from src.events.exceptions import EventDatesInvalid

from src.users.schemas import ResponseUser
from src.users.utils import is_admin

def parse_timerange(
    start_date: Optional[date], end_date: Optional[date]
) -> tuple[datetime, datetime]:
    # TODO: EventCalendar has a 52 month pre- and post-fetch range, maybe we should utilise this as well
    if not start_date:
        start_date = date.min
    if not end_date:
        end_date = date.max

    if end_date < start_date:
        raise EventDatesInvalid

    start_time = datetime.combine(start_date, datetime.min.time())
    end_time = datetime.combine(end_date, datetime.max.time())

    return start_time, end_time


def is_admin_or_unlocked(actor: ResponseUser, event: ResponseEvent, db: Session):
    if is_admin(actor, db):
        return True

    return event.locked_time < datetime.now()
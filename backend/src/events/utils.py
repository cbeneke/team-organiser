from typing import Optional
from datetime import date, datetime, time
from sqlalchemy.orm import Session

from src.events.schemas import ResponseEvent
from src.events.exceptions import EventTimesInvalid

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

    start_time = datetime.combine(start_date, time.min)
    end_time = datetime.combine(end_date, time.max)

    if end_time < start_time:
        raise EventTimesInvalid

    return start_time, end_time


def is_admin_or_unlocked(actor: ResponseUser, event: ResponseEvent, db: Session):
    if is_admin(actor, db):
        return True

    return event.lock_time > datetime.now()

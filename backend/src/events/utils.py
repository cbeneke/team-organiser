from typing import Optional
from datetime import date, datetime

from src.events.exceptions import EventDatesInvalid


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

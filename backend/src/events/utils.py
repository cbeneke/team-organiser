from typing import Optional
from datetime import date, datetime, timedelta

def parse_timerange(
    start_date: Optional[date],
    end_date: Optional[date]
) -> tuple[datetime, datetime]:
    
    if not start_date:
        start_date = date.today()
    if not end_date:
        end_date = start_date + timedelta(days=7)
    
    start_time = datetime.combine(start_date, datetime.min.time())
    end_time = datetime.combine(end_date, datetime.max.time())

    return start_time, end_time
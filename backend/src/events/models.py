import sqlalchemy as sql
from sqlalchemy.orm import relationship
from uuid import uuid4

from src.database import Base, GUID


class DBEvents(Base):
    __tablename__ = "events"

    id = sql.Column(GUID(), primary_key=True, index=True, default=lambda: str(uuid4()))
    title = sql.Column(sql.String)
    description = sql.Column(sql.String)
    start_time = sql.Column(sql.DateTime, index=True)
    end_time = sql.Column(sql.DateTime, index=True)
    owner_id = sql.Column(GUID(), sql.ForeignKey("users.id"))
    owner = relationship("DBUser")

class DBEventResponses(Base):
    __tablename__ = "event_responses"

    id = sql.Column(GUID(), primary_key=True, index=True, default=lambda: str(uuid4()))
    event_id = sql.Column(sql.ForeignKey("event.id"), index=True)
    user_id = sql.Column(sql.ForeignKey("users.id"), index=True)
    status = sql.Column(sql.Enum("accepted", "declined", "pending"), default="pending", nullable=False)


# class DBPeriodicEvents(Base):
#     __tablename__ = "periodic_events"

#     id = sql.Column(GUID(), primary_key=True, index=True, default=lambda: str(uuid4()))
#     title = sql.Column(sql.String)
#     description = sql.Column(sql.String)
#     start_time = sql.Column(sql.DateTime, index=True, nullable=False)  # relative to 01.01.1970 00:00:00
#     end_time = sql.Column(sql.DateTime, index=True, nullable=False)    # relative to 01.01.1970 00:00:00
#     owner_id = sql.Column(GUID(), sql.ForeignKey("users.id"))
#     owner = relationship("DBUser")
#     periodicity = sql.Column(sql.Enum("daily", "weekly", "monthly", "yearly"), default="weekly", nullable=False)

# class DBPeriodicEventException(Base):
#     __tablename__ = "periodic_event_exception"
    
#     event_id = sql.Column(sql.ForeignKey("event.id"))
#     date = sql.Column(sql.DateTime, index=True, nullable=False)
#     is_skipped = sql.Column(sql.Boolean, default=False, nullable=False)
#     start_time = sql.Column(sql.DateTime)  # relative to 01.01.1970 00:00:00
#     end_time = sql.Column(sql.DateTime)    # relative to 01.01.1970 00:00:00

# class DBPeriodicEventResponse(Base):
#     __tablename__ = "user_to_event"
    
#     event_id = sql.Column(sql.ForeignKey("periodic_events.id"))
#     user_id = sql.Column(sql.ForeignKey("user.id"))
#     status = sql.Column(sql.Enum("accepted", "declined", "pending"), default="pending", nullable=False)


# class DBPeriodicEventResponseException(Base):
#     __tablename__ = "periodic_event_response_exception"
    
#     event_id = sql.Column(sql.ForeignKey("event.id")),
#     user_id = sql.Column(sql.ForeignKey("user.id")),
#     date = sql.Column(sql.DateTime, index=True),
#     status = sql.Column(sql.Enum("accepted", "declined", "pending"), default="pending", nullable=False)
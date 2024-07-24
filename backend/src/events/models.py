import sqlalchemy as sql
from sqlalchemy.orm import relationship
from uuid import uuid4

from src.constants import Base
from src.database import GUID


class DBEvents(Base):
    __tablename__ = "events"

    id = sql.Column(GUID(), primary_key=True, index=True, default=lambda: str(uuid4()))
    series_id = sql.Column(GUID(), index=True, nullable=True)
    title = sql.Column(sql.String)
    description = sql.Column(sql.String)
    lock_time = sql.Column(sql.DateTime, index=True)
    start_time = sql.Column(sql.DateTime, index=True)
    end_time = sql.Column(sql.DateTime, index=True)
    display_color = sql.Column(sql.String)
    owner_id = sql.Column(GUID(), sql.ForeignKey("users.id"))
    owner = relationship("DBUser")
    responses = relationship("DBEventResponses", back_populates="event")


class DBEventResponses(Base):
    __tablename__ = "event_responses"

    id = sql.Column(GUID(), primary_key=True, index=True, default=lambda: str(uuid4()))
    event_id = sql.Column(sql.ForeignKey("events.id"))
    event = relationship("DBEvents", back_populates="responses")
    user_id = sql.Column(sql.ForeignKey("users.id"))
    user = relationship("DBUser", back_populates="events")
    status = sql.Column(
        sql.Enum("accepted", "declined", "pending"), default="pending", nullable=False
    )

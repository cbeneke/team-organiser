import sqlalchemy as sql
from sqlalchemy.orm import relationship
from uuid import uuid4

from src.constants import Base
from src.database import GUID


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
    status = sql.Column(
        sql.Enum("accepted", "declined", "pending"), default="pending", nullable=False
    )

from enum import Enum
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Union

from src.users.schemas import ResponseUser


class BaseEvent(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    display_color: str


class NewEvent(BaseEvent):
    invitees: list[ResponseUser] = []


class ResponseEvent(BaseEvent):
    id: UUID = Field(default_factory=uuid4)
    owner: ResponseUser

    class Config:
        orm_mode = True


class ResponseType(str, Enum):
    accepted = "accepted"
    declined = "declined"
    pending = "pending"


class Response(BaseModel):
    user: ResponseUser
    status: ResponseType

    class Config:
        orm_mode = True


class EventResponse(Response):
    event: ResponseEvent


class UpdateEvent(BaseModel):
    title: Union[str, None] = None
    description: Union[str, None] = None
    start_time: Union[datetime, None] = None
    end_time: Union[datetime, None] = None
    display_color: Union[str, None] = None
    responses: list[Response] = None

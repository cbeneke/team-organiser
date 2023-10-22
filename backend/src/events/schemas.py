from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from datetime import datetime

import src.users.schemas as user_schemas


class NewEvent(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime

class ResponseEvent(NewEvent):
    id: UUID = Field(default_factory=uuid4)
    owner: user_schemas.ResponseUser

    class Config:
        orm_mode = True

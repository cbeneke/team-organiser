from enum import Enum
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, constr
from typing import Union


class RoleName(str, Enum):
    trainer = "trainer"
    user = "user"


class Role(BaseModel):
    name: RoleName
    description: Union[str, None] = None

    class Config:
        orm_mode = True


class BaseUser(BaseModel):
    username: constr(regex="^[a-zA-Z0-9_-]+$", to_lower=True, strip_whitespace=True)
    first_name: Union[str, None] = None


class NewUser(BaseUser):
    password: str


class UpdateUser(BaseModel):
    password: Union[str, None] = None
    is_trainer: Union[bool, None] = None

class ResponseUser(BaseUser):
    id: UUID = Field(default_factory=uuid4)
    is_active: bool
    roles: list[Role] = []

    class Config:
        orm_mode = True


class User(ResponseUser):
    hashed_password: str

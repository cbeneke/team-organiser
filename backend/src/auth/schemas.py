from uuid import UUID, uuid4
from pydantic import BaseModel, Field, constr
from typing import Union


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Union[str, None] = None


class BaseUser(BaseModel):
    username: constr(regex="^[a-zA-Z0-9_-]+$", to_lower=True, strip_whitespace=True)
    first_name: Union[str, None] = None
    
class NewUser(BaseUser):
    password: str

class ResponseUser(BaseUser):
    id: UUID = Field(default_factory=uuid4)
    is_active: bool

    class Config:
        orm_mode = True

class User(ResponseUser):
    hashed_password: str
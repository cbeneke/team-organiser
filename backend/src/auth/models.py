import sqlalchemy as sql
from uuid import uuid4

from src.database import Base
from src.auth.database import GUID

class DBUser(Base):
    __tablename__ = "users"

    id = sql.Column(GUID(), primary_key=True, index=True, default=lambda: str(uuid4()))
    username = sql.Column(sql.String, unique=True, index=True)
    first_name = sql.Column(sql.String)
    hashed_password = sql.Column(sql.String)
    is_active = sql.Column(sql.Boolean, default=True)
from __future__ import annotations

import sqlalchemy as sql
from sqlalchemy.orm import Mapped, relationship
from uuid import uuid4

from src.constants import Base
from src.database import GUID


user_to_role = sql.Table(
    "user_to_role",
    Base.metadata,
    sql.Column("user_id", sql.ForeignKey("users.id")),
    sql.Column("role_id", sql.ForeignKey("roles.id")),
)


class DBRoles(Base):
    __tablename__ = "roles"

    id = sql.Column(GUID(), primary_key=True, index=True, default=lambda: str(uuid4()))
    name = sql.Column(sql.String, unique=True, index=True)
    description = sql.Column(sql.String)


class DBUser(Base):
    __tablename__ = "users"

    id = sql.Column(GUID(), primary_key=True, index=True, default=lambda: str(uuid4()))
    username = sql.Column(sql.String, unique=True, index=True)
    first_name = sql.Column(sql.String)
    hashed_password = sql.Column(sql.String)
    is_active = sql.Column(sql.Boolean, default=True)

    roles: Mapped[list[DBRoles]] = relationship("DBRoles", secondary=user_to_role)
    events = relationship("DBEventResponses", back_populates="user")

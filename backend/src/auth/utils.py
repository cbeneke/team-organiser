from sqlalchemy.orm import Session
from uuid import UUID

from src.auth.models import DBUser
from src.auth.constants import pwd_context


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(username: str, db: Session):
    return (db
            .query(DBUser)
            .filter(DBUser.username == username)
            .first()
    )
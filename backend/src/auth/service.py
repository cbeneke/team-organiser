from jose import jwt
from typing import Union
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

import src.auth.utils as utils
from src.auth.models import DBUser
from src.auth.constants import SECRET_KEY, ALGORITHM
from src.auth.exceptions import UsernameAlreadyInUseException


def add_user(username: str, password: str, db: Session):
    if utils.get_user(username, db):
        raise UsernameAlreadyInUseException
    hashed_password = utils.get_password_hash(password)
    user = DBUser(username=username, hashed_password=hashed_password, is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(username: str, password: str, db: Session):
    user = utils.get_user(username, db)
    if not user:
        return False
    if not utils.verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

from typing import Annotated
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from src.auth.constants import SECRET_KEY, ALGORITHM
from src.auth.models import DBUser
import src.auth.exceptions as exceptions
import src.auth.schemas as schemas
import src.auth.utils as utils
from src.database import get_db


async def get_current_user(
    token: Annotated[str, Depends(OAuth2PasswordBearer(tokenUrl="auth/token"))],
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise exceptions.InvalidTokenException
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise exceptions.InvalidTokenException
    user = utils.get_user(token_data.username, db)
    if user is None:
        raise exceptions.InvalidTokenException
    return user


async def get_current_active_user(
        current_user: Annotated[DBUser, Depends(get_current_user)]
):
    if not current_user.is_active:
        raise exceptions.InactiveUserException()
    return current_user
from typing import Annotated
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from src.auth.constants import SECRET_KEY, ALGORITHM
from src.auth.exceptions import InvalidToken
from src.auth.schemas import TokenData


async def get_username_from_token(
    token: Annotated[str, Depends(OAuth2PasswordBearer(tokenUrl="auth/login"))],
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise InvalidToken
        token_data = TokenData(username=username)
    except JWTError:
        raise InvalidToken

    return token_data.username

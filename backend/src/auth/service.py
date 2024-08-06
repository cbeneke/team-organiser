from jose import jwt
from typing import Union
import datetime

from src.auth.constants import SECRET_KEY, ALGORITHM


def create_access_token(data: dict, expires_delta: Union[datetime.timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now() + expires_delta
    else:
        expire = datetime.datetime.now() + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

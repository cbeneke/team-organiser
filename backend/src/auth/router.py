from fastapi import APIRouter, Depends, Form
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from datetime import timedelta
from sqlalchemy.orm import Session

from src.database import get_db

from src.users.service import authenticate_user, add_user
from src.users.schemas import ResponseUser

from src.auth.exceptions import IncorrectCredentials
from src.auth.schemas import Token
from src.auth.constants import ACCESS_TOKEN_EXPIRE_MINUTES
from src.auth.service import create_access_token


router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise IncorrectCredentials
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.put("/register", response_model=ResponseUser)
async def register(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()],
    db: Session = Depends(get_db)
):
    user = add_user(username, password, db)
    return user
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from datetime import timedelta
from sqlalchemy.orm import Session

import src.auth.service as service
from src.auth.exceptions import InvalidUsernameOrPasswordException
from src.auth.schemas import Token, ResponseUser
from src.auth.constants import ACCESS_TOKEN_EXPIRE_MINUTES
from src.auth.dependencies import get_current_active_user
from src.database import get_db


router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    user = service.authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise InvalidUsernameOrPasswordException
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = service.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.put("/register", response_model=ResponseUser)
async def register(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    user = service.add_user(form_data.username, form_data.password, db)
    return user


@router.get("/me", response_model=ResponseUser)
async def read_users_me(
    current_user: Annotated[ResponseUser, Depends(get_current_active_user)]
):
    return current_user

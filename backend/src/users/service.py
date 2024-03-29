from sqlalchemy.orm import Session

from src.users.utils import (
    get_db_user,
    get_password_hash,
    verify_password,
    get_db_role,
)
from src.users.models import DBUser
from src.users.exceptions import UsernameAlreadyInUse
from src.users.schemas import RoleName


def authenticate_user(username: str, password: str, db: Session):
    user = get_db_user(username, db)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def add_user(username: str, password: str, db: Session):
    if get_db_user(username, db):
        raise UsernameAlreadyInUse
    hashed_password = get_password_hash(password)
    user = DBUser(
        username=username,
        hashed_password=hashed_password,
        is_active=True,
        roles=[get_db_role(RoleName.user, db)],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(
    user: DBUser, display_name: str, password: str, is_admin: bool, db: Session
):
    if display_name:
        user.display_name = display_name

    if password:
        user.hashed_password = get_password_hash(password)

    if is_admin is not None:
        if is_admin:
            user.roles = [get_db_role(RoleName.trainer, db)]
        else:
            user.roles = [get_db_role(RoleName.user, db)]

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

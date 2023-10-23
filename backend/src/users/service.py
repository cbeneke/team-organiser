from sqlalchemy.orm import Session
from uuid import UUID

from src.users.utils import (
    get_db_user,
    get_db_user_by_id,
    get_password_hash,
    verify_password,
    get_db_role,
)
from src.users.models import DBUser
from src.users.exceptions import UsernameAlreadyInUse, UserNotFound
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


def update_user(user_id: UUID, password: str, is_trainer: bool, db: Session):
    user = get_db_user_by_id(user_id, db)
    user.hashed_password = get_password_hash(password)
    if is_trainer:
        user.roles = [get_db_role(RoleName.trainer, db)]
    else:
        user.roles = [get_db_role(RoleName.user, db)]

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(user_id: UUID, db: Session):
    user = get_db_user_by_id(user_id, db)
    if not user:
        raise UserNotFound
    db.delete(user)
    db.commit()
    return


def is_owner_or_admin(user: DBUser, actor: DBUser, db: Session):
    trainer_role = get_db_role(RoleName.trainer, db)
    return user.id == actor.id or trainer_role in actor.roles

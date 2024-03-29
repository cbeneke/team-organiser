from sqlalchemy.orm import Session

from src.users.models import DBUser, DBRoles
from src.users.schemas import RoleName, ResponseUser
from src.auth.constants import pwd_context


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_db_user(username: str, db: Session):
    return db.query(DBUser).filter(DBUser.username == username).first()


def get_db_role(rolename: str, db: Session):
    return db.query(DBRoles).filter(DBRoles.name == rolename).first()


def is_admin_or_self(actor: ResponseUser, user: ResponseUser, db: Session):
    if actor.id == user.id:
        return True

    return is_admin(actor, db)


def is_admin(user: ResponseUser, db: Session):
    trainer_role = get_db_role(RoleName.trainer, db)
    return trainer_role in user.roles


def is_user_in_list(user: ResponseUser, users: list[ResponseUser]) -> bool:
    return any(user.id == u.id for u in users)

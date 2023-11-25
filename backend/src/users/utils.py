from sqlalchemy.orm import Session
from uuid import UUID

from src.users.models import DBUser, DBRoles
from src.users.schemas import RoleName
from src.auth.constants import pwd_context


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_db_user(username: str, db: Session):
    return db.query(DBUser).filter(DBUser.username == username).first()


def get_db_user_by_id(user_id: UUID, db: Session):
    return db.query(DBUser).filter(DBUser.id == user_id).first()


def get_all_db_users(db: Session):
    return db.query(DBUser).order_by(DBUser.username).all()


def get_db_role(rolename: str, db: Session):
    return db.query(DBRoles).filter(DBRoles.name == rolename).first()

def is_admin_or_owner(actor: DBUser, owner: DBUser, db: Session):
    trainer_role = get_db_role(RoleName.trainer, db)
    return owner.id == actor.id or trainer_role in actor.roles

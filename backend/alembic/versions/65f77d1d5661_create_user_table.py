"""Create user table

Revision ID: 65f77d1d5661
Revises:
Create Date: 2023-10-16 09:00:56.295711

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from uuid import uuid4

from src.database import GUID
from src.users.utils import get_password_hash

# revision identifiers, used by Alembic.
revision: str = "65f77d1d5661"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    users_table = op.create_table(
        "users",
        sa.Column(
            "id", GUID(), primary_key=True, index=True, default=lambda: str(uuid4())
        ),
        sa.Column("username", sa.String, unique=True, index=True),
        sa.Column("first_name", sa.String),
        sa.Column("hashed_password", sa.String),
        sa.Column("is_active", sa.Boolean, default=True),
    )

    op.bulk_insert(
        users_table,
        [
            {
                "username": "admin",
                "first_name": "Admin",
                "hashed_password": get_password_hash("admin"),
                "is_active": True,
            }
        ],
    )


def downgrade() -> None:
    op.drop_table("users")

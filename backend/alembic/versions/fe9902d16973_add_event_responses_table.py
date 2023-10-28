"""Add event_responses table

Revision ID: fe9902d16973
Revises: ede3ed347761
Create Date: 2023-10-28 15:32:18.174881

"""
from typing import Sequence, Union
from uuid import uuid4

from src.database import GUID
from alembic import op
import sqlalchemy as sql


# revision identifiers, used by Alembic.
revision: str = 'fe9902d16973'
down_revision: Union[str, None] = 'ede3ed347761'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "event_responses",
        sql.Column(
            "id", GUID(), primary_key=True, index=True, default=lambda: str(uuid4())
        ),
        sql.Column("event_id", GUID(), sql.ForeignKey("events.id"), index=True),
        sql.Column("user_id", GUID(), sql.ForeignKey("users.id"), index=True),
        sql.Column(
            "status",
            sql.Enum("accepted", "declined", "pending"),
            default="pending",
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_table("event_responses")
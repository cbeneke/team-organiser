"""Add events table

Revision ID: ede3ed347761
Revises: e1e67ffb5731
Create Date: 2023-10-17 21:21:49.373553

"""
from typing import Sequence, Union
from uuid import uuid4

from src.database import GUID

from alembic import op
import sqlalchemy as sql


# revision identifiers, used by Alembic.
revision: str = "ede3ed347761"
down_revision: Union[str, None] = "e1e67ffb5731"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "events",
        sql.Column(
            "id", GUID(), primary_key=True, index=True, default=lambda: str(uuid4())
        ),
        sql.Column("title", sql.String),
        sql.Column("description", sql.String),
        sql.Column("start_time", sql.DateTime, index=True),
        sql.Column("end_time", sql.DateTime, index=True),
        sql.Column("owner_id", GUID(), sql.ForeignKey("users.id")),
    )

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
    op.drop_table("events")

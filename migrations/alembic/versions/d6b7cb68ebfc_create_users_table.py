"""create users table

Revision ID: d6b7cb68ebfc
Revises:
Create Date: 2023-10-03 15:36:59.772142

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sql


# revision identifiers, used by Alembic.
revision: str = 'd6b7cb68ebfc'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sql.Column("id", sql.Integer, primary_key=True, index=True),
        sql.Column("username", sql.String, unique=True, index=True),
        sql.Column("email", sql.String, default=""),
        sql.Column("hashed_password", sql.String),
        sql.Column("is_active", sql.Boolean, default=True),
    )


def downgrade() -> None:
    op.drop_table('users')
    pass

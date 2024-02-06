"""Add support for recurring events

Revision ID: a8235af7d26b
Revises: 669294669a7e
Create Date: 2024-02-02 19:16:47.329577

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from src.database import GUID

# revision identifiers, used by Alembic.
revision: str = "a8235af7d26b"
down_revision: Union[str, None] = "669294669a7e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("events", sa.Column("series_id", GUID(), nullable=True))
    pass


def downgrade() -> None:
    op.drop_column("events", "series_id")
    pass

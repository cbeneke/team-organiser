"""Add support for locked events

Revision ID: da985f08edd2
Revises: a8235af7d26b
Create Date: 2024-02-20 21:37:14.528500

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "da985f08edd2"
down_revision: Union[str, None] = "a8235af7d26b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("events", sa.Column("lock_time", sa.DateTime, index=True))
    # Initialize lock_time with start_time
    op.execute("UPDATE events SET lock_time = start_time")
    pass


def downgrade() -> None:
    op.drop_column("events", "lock_time")
    pass

"""Drop display_color column.

Revision ID: dd900e726b50
Revises: da985f08edd2
Create Date: 2024-08-06 10:53:23.598092

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "dd900e726b50"
down_revision: Union[str, None] = "da985f08edd2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("events", "display_color")


def downgrade() -> None:
    op.add_column("events", "display_color")

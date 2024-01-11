"""Rename firstname to displayname

Revision ID: 669294669a7e
Revises: fe9902d16973
Create Date: 2023-12-30 19:22:20.731667

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "669294669a7e"
down_revision: Union[str, None] = "fe9902d16973"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("users", "first_name", new_column_name="display_name")


def downgrade() -> None:
    op.alter_column("users", "display_name", new_column_name="first_name")

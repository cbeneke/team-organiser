"""Add roles for users

Revision ID: e1e67ffb5731
Revises: 65f77d1d5661
Create Date: 2023-10-16 15:40:32.797669

"""
from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sql

from src.database import GUID


# revision identifiers, used by Alembic.
revision: str = 'e1e67ffb5731'
down_revision: Union[str, None] = '65f77d1d5661'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    role_mapping_table = op.create_table(
        'user_to_role',
        sql.Column("user_id", GUID(), sql.ForeignKey("users.id")),
        sql.Column("role_id", GUID(), sql.ForeignKey("roles.id")),
    )

    roles_table = op.create_table(
        'roles',
        sql.Column('id', GUID(), primary_key=True, index=True, default=lambda: str(uuid4())),
        sql.Column('name', sql.String, unique=True, index=True),
        sql.Column('description', sql.String)
    )


    op.bulk_insert(
        roles_table,
        [
            {
                "name": "trainer",
                "description": "A trainer can create and manage training sessions.",
            },
            {
                "name": "user",
                "description": "A user can participate in training sessions."
            }
        ]
    )
    conn = op.get_bind()
    admin_user_id = conn.execute(sql.text("select id from users where username = 'admin'")).first()[0]
    trainer_role_id = conn.execute(sql.text("select id from roles where name = 'trainer'")).first()[0]

    op.bulk_insert(
        role_mapping_table,
        [
            {
                "user_id": admin_user_id,
                "role_id": trainer_role_id,
            }
        ]
    )

    conn = op.get_bind()
    admin_user_id = conn.execute(sql.text("select id from users where username = 'admin'")).first()[0]
    trainer_role_id = conn.execute(sql.text("select id from roles where name = 'trainer'")).first()[0]

    op.bulk_insert(
        role_mapping_table,
        [
            {
                "user_id": admin_user_id,
                "role_id": trainer_role_id,
            }
        ]
    )


def downgrade() -> None:
    op.drop_table('user_to_role')
    op.drop_table('roles')

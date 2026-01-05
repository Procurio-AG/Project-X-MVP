"""add_score_and_result_columns

Revision ID: a906d6d1b33b
Revises: 56424a6e1e69
Create Date: 2026-01-06 00:48:06.863067

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a906d6d1b33b'
down_revision: Union[str, Sequence[str], None] = '56424a6e1e69'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns for caching final scores and results
    op.add_column('matches', sa.Column('home_score', sa.String(), nullable=True))
    op.add_column('matches', sa.Column('away_score', sa.String(), nullable=True))
    op.add_column('matches', sa.Column('result_note', sa.String(), nullable=True))

def downgrade() -> None:
    op.drop_column('matches', 'result_note')
    op.drop_column('matches', 'away_score')
    op.drop_column('matches', 'home_score')

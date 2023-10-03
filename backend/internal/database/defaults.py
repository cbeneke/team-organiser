import databases
import sqlalchemy as sql
from pydantic import BaseModel
from typing import Union

DATABASE_URL = "sqlite:///../backend.db"

database = databases.Database(DATABASE_URL)
metadata = sql.MetaData()

engine = sql.create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

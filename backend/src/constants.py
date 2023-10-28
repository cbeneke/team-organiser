import os
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = os.environ.get("DATABASE_URL")
Base = declarative_base()

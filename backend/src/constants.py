import os
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL")
Base = declarative_base()

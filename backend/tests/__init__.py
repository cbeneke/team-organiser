import os

from .fixtures import get_random_string

os.environ["DATABASE_URL"] = "sqlite:///tests.db"
os.environ["JWT_SECRET_KEY"] = get_random_string(32, hex=True)
